import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework import status as s
import requests
 
load_dotenv()
 
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not set. Check your .env file.")
 
client = genai.Client(api_key=api_key)
 
MODEL_NAME = "gemini-2.5-flash"
 
 
class MilitaryTranslation(BaseModel):
    branch: str = Field(description="Military branch (e.g. Army, Navy, Marine Corps, Air Force, Coast Guard, Space Force)")
    code: str = Field(description="The exact MOS, NEC, AFSC, Rating, or specialty code as provided by the user")
    military_title: str = Field(description="Official military job title for this code")
    civilian_job_titles: list[str] = Field(description="3-5 direct civilian job title equivalents")
    transferable_skills: list[str] = Field(description="8-12 specific, resume-ready transferable skills derived from this military role")
    suggested_keywords: list[str] = Field(description="6-10 ATS-optimized keywords for civilian job searching")
    summary: str = Field(description="2-3 sentence plain-English translation of this military role for a civilian hiring manager")
 
 
SYSTEM_PROMPT = """
You are an expert military-to-civilian career transition specialist with deep knowledge
of all U.S. military branches and their occupational systems:
 
- Army: MOS (Military Occupational Specialty) codes, e.g. 11B, 25U, 92A
- Navy: NEC (Navy Enlisted Classification) codes and Officer Designators, e.g. 2514, 1120, HM
- Marine Corps: MOS codes, e.g. 0311, 0621, 3521
- Air Force / Space Force: AFSC (Air Force Specialty Code), e.g. 1A1X1, 3D0X2
- Coast Guard: Rating codes, e.g. BM, MK, IT
 
Your job is to translate a military occupational code or job title into civilian equivalents
that hiring managers at tech companies, defense contractors, and Fortune 500 companies
will immediately understand.
 
Rules:
- Be precise and specific — avoid generic skills like "leadership" or "teamwork" unless
  paired with a concrete, measurable context (e.g. "led 12-person team under time-critical conditions")
- Civilian job titles should reflect realistic matches, not aspirational stretches
- Transferable skills must be resume-ready — specific enough to paste into a bullet point
- Keywords should be ATS-optimized for modern job boards (LinkedIn, Indeed, Workday)
- If the user provides a branch alongside the code, prioritize that branch's interpretation
- If the code is ambiguous across branches, note the most likely interpretation in your response
"""
 
 
class TranslateView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
 
    def post(self, request):
        user_input = request.data.get("query", "").strip()
 
        if not user_input:
            return Response(
                {"error": "Query is required."},
                status=s.HTTP_400_BAD_REQUEST
            )
 
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=f"Translate this military occupational code or job title: {user_input}",
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    response_mime_type="application/json",
                    response_schema=MilitaryTranslation,
                )
            )
 
            result = json.loads(response.text)
            return Response(result, status=s.HTTP_200_OK)
 
        except json.JSONDecodeError:
            return Response(
                {"error": "Failed to parse Gemini response."},
                status=s.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            return Response(
                {"error": f"Translation failed: {str(e)}"},
                status=s.HTTP_500_INTERNAL_SERVER_ERROR
            )
 
 
class JobSearchView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
 
    def get(self, request):
        what = request.query_params.get("what", "").strip()
        where = request.query_params.get("where", "").strip()
        page = request.query_params.get("page", "1").strip()
        results_per_page = request.query_params.get("results_per_page", "10").strip()

        try:
            page = max(1, min(1000, int(page)))
            results_per_page = max(1, min(50, int(results_per_page)))
        except ValueError:
            page = 1
            results_per_page = 10

        if not what:
            return Response(
                {"error": "Search term is required."},
                status=s.HTTP_400_BAD_REQUEST
            )

        app_id = os.getenv("ADZUNA_APP_ID")
        app_key = os.getenv("ADZUNA_APP_KEY")

        if not app_id or not app_key:
            return Response(
                {"error": "Adzuna credentials not configured."},
                status=s.HTTP_500_INTERNAL_SERVER_ERROR
            )

        try:
            response = requests.get(
                f"https://api.adzuna.com/v1/api/jobs/us/search/{page}",
                params={
                    "app_id": app_id,
                    "app_key": app_key,
                    "what": what,
                    "where": where,
                    "results_per_page": results_per_page,
                }
            )
            return Response(response.json(), status=response.status_code)
 
        except Exception:
            return Response(
                {"error": "Job search failed. Please try again."},
                status=s.HTTP_500_INTERNAL_SERVER_ERROR
            )