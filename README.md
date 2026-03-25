BridgeBoard - Military-to-Civilian Career Transition Tracker
Overview
BridgeBoard is a full-stack web application designed to help transitioning military service members organize and track their civilian job search. The app provides a centralized dashboard to manage job applications, tasks, interview notes, networking contacts, and search real job listings from external sources.

Motivation
Transitioning from military to civilian employment is a complex process that involves tracking multiple job applications, managing networking relationships, preparing for interviews, and staying organized across a lengthy timeline. BridgeBoard addresses this need by providing a purpose-built tool that understands the unique challenges of career transition.

Tech Stack
Frontend
React 18 with Vite
React Router DOM for client-side routing
Axios for HTTP requests
Tailwind CSS for styling

Backend
Django REST Framework
Token-based authentication
PostgreSQL database

Infrastructure
Docker Compose for container orchestration
Nginx for serving the frontend build
Gunicorn for Django WSGI

External API
Adzuna Job Search API

Challenges & Solutions:
-DB tables were lost when container restart was happening because it was being reset everytime. Solution: Always run docker exec -it django-container python manage.py migrate
-Had issues with my frontend connecting to my Django due to CORS port mistmatch. Solution: changed my CORS_ALLOW_ALL_ORIGINS = True.
-Adzuna's API integration having to figure out how to utilize the ID and KEY. Solution: mimic the .env generated for the backend side, as well as placing it in my gitignore. Document was very helpful with the url link generation.