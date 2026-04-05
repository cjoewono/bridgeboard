BridgeBoard - Military-to-Civilian Career Transition Tracker
Overview
BridgeBoard is a full-stack web application purpose-built for transitioning military service members navigating the civilian job market. It provides a centralized, tactical dashboard to manage job applications, tasks, interview notes, and networking contacts

Motivation
Transitioning from military to civilian employment is a complex, multi-month process. Service members must simultaneously track dozens of job applications, manage networking relationships, prepare for interviews, and maintain momentum across a lengthy timeline — all without the institutional support structure they're used to.
BridgeBoard addresses this gap by providing a purpose-built tool that speaks the language of military transition: mission-focused, organized, and built to keep the operator informed.

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
Gemini API

Challenges & Solutions:
-Nginx not proxying API requests. The frontend was calling http://127.0.0.1:8000 directly, bypassing Nginx entirely. Solution: Changed all axios calls to relative paths (/api/v1/...) so requests route through Nginx, which proxies to the Django container.
-Adzuna initially planned as LinkedIn Jobs API. The initial plan was to use the LinkedIn Jobs API for job search. LinkedIn requires partner approval with a multi-week wait time, making it unsuitable for a project timeline.
Solution: Switched to Adzuna, which has a free tier, immediate API key access, real job listings, and a simple REST API that uses the same axios pattern already established in the project.
-Adzuna keys exposed in frontend. Initial implementation stored ADZUNA_APP_ID and ADZUNA_APP_KEY in the React frontend via VITE_* environment variables, making them visible in the browser. Solution: Moved keys to server/.env and built a Django proxy view (JobSearchView) that injects the keys server-side before forwarding to Adzuna. Frontend never sees the keys.
-authtoken_token relation does not exist. After a docker-compose down && up, all requests returned a ProgrammingError: relation "authtoken_token" does not exist because the Postgres volume was wiped and migrations hadn't been re-run. Solution (immediate): docker exec django-container python manage.py migrate.
-ModuleNotFoundError: No module named 'dotenv'. After adding from dotenv import load_dotenv to translate_app/views.py, the container crashed on startup because python-dotenv wasn't in requirements.txt. Solution: Added python-dotenv==1.2.2 to requirements.txt and rebuilt the image with docker-compose up --build backend
-Gemini response returning HTML instead of JSON. The translator frontend was receiving <html>... and throwing Unexpected token '<'... is not valid JSON. This meant the API request was hitting Nginx's SPA fallback instead of reaching Django. Root cause: The backend container was crashing on import due to the missing dotenv module, so Nginx had no backend to proxy to and returned index.html instead. Solution: Resolved by fixing dotenv dependency, then rebuilding and re-running migrations.
-Unpinned packages in requirements.txt. google-genai, requests, and python-dotenv had no version pins, which means builds are not reproducible and could silently break on a dependency update. Solution: Pinned all three to their installed versions (google-genai==1.70.0, requests==2.33.1, python-dotenv==1.2.2) to match the rest of requirements.txt.
-Container restart not picking up env_file changes. docker-compose restart reuses the existing container environment and does not reload env_file. This caused debugging sessions where environment variable changes appeared to have no effect. Solution: Established the correct pattern — docker-compose down && docker-compose up --build — as the only reliable way to ensure a clean environment reload.

Breakdown:
bridgeboard/
│
├── docker-compose.yml
│
├── nginx/
│   └── default.conf
│
├── client/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── dist/
│   └── src/
│       ├── main.jsx
│       ├── router.jsx
│       ├── App.jsx
│       ├── index.css
│       └── pages/
│           ├── HomePage.jsx
│           ├── LoginPage.jsx
│           ├── RegisterPage.jsx
│           ├── DashboardPage.jsx
│           ├── JobDetailPage.jsx
│           ├── ContactsPage.jsx
│           ├── JobSearchPage.jsx
│           ├── TranslatorPage.jsx
│           └── NotFoundPage.jsx
│
└── server/
    ├── Dockerfile
    ├── requirements.txt
    ├── manage.py
    ├── .env
    │
    ├── bridgeboard_proj/
    │   ├── __init__.py
    │   ├── settings.py
    │   ├── urls.py
    │   ├── wsgi.py
    │   └── asgi.py
    │
    ├── user_app/
    │   ├── models.py
    │   ├── serializers.py
    │   ├── views.py
    │   ├── urls.py
    │   └── apps.py
    │
    ├── job_app/
    │   ├── models.py
    │   ├── serializers.py
    │   ├── views.py
    │   ├── urls.py
    │   └── apps.py
    │
    ├── task_app/
    │   ├── models.py
    │   ├── serializers.py
    │   ├── views.py
    │   ├── urls.py
    │   └── apps.py
    │
    ├── note_app/
    │   ├── models.py
    │   ├── serializers.py
    │   ├── views.py
    │   ├── urls.py
    │   └── apps.py
    │
    ├── contact_app/
    │   ├── models.py
    │   ├── serializers.py
    │   ├── views.py
    │   ├── urls.py
    │   └── apps.py
    │
    └── translate_app/
        ├── models.py
        ├── views.py
        ├── urls.py
        └── apps.py

How to Guide:
How to Clone and Run BridgeBoard Locally

Step 1 — Clone the Repository
Open a terminal and run:
git clone https://github.com/cjoewono/bridgeboard.git
cd bridgeboard

Step 2 — Get Your API Keys
You need three sets of credentials before the app will run. Get them in this order:

Gemini API Key (for MOS Translator)
Go to https://aistudio.google.com
Sign in with a Google account
Click Get API key in the top navigation
Click Create API key
Copy the key — it starts with AIzaSy...
Free tier is sufficient. No billing required for development usage. 
NOTE: During the MOS translator operation, you may encounter a high demand error and unable to retrieve. Re-try again until results pop up.

Adzuna API Keys (for Job Search)
Go to https://developer.adzuna.com
Click Register and create a free account
After logging in, go to https://developer.adzuna.com/admin/applications
Click Create New Application
Give it any name (e.g. BridgeBoard)
Copy both your App ID and App Key

Free tier gives you access to the job search endpoint used in this app.

Step 3 — Create the Environment File
The app reads all secrets from a single file at server/.env. This file is gitignored and must be created manually.
From inside the bridgeboard/ directory:
cd server
touch .env
Open server/.env in any text editor and paste the following, replacing every value with your own:
DJANGO_SECRET_KEY=any-long-random-string-you-make-up
DEBUG=True
POSTGRES_DB=bridgeboard_db
POSTGRES_USER=bb_user
POSTGRES_PASSWORD=bb_password
GEMINI_API_KEY=AIzaSy...your-key-here
ADZUNA_APP_ID=your-adzuna-app-id
ADZUNA_APP_KEY=your-adzuna-app-key
Notes on each variable:
DJANGO_SECRET_KEY — make up any long random string. For local development it doesn't matter what it is, just don't leave it empty. Example: my-local-dev-secret-key-bridgeboard-2026
DEBUG — leave as True for local development.
POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD — these are the credentials Docker uses to create your local Postgres database. You can use any values you want, they just need to be consistent. The values above are fine for local use.
GEMINI_API_KEY — paste the key from Step 2 that starts with AIzaSy.
ADZUNA_APP_ID and ADZUNA_APP_KEY — paste both values from your Adzuna application dashboard.
Go back to the project root when done:
cd ..

Step 4 — Build the Frontend
The React app needs to be compiled before Docker can serve it. Run from the project root:
cd client
npm install
npm run build
cd ..

Step 5 — Start the Application
From the project root (bridgeboard/):
docker-compose up --build -d

Step 6 — Verify Everything Started Correctly
Check that migrations ran and gunicorn is running:
docker logs django-container 

Check all three containers are running:
docker ps
You should see postgres-container, django-container, and nginx-container all with status Up.

Step 7 — Open the Application
Go to http://localhost in your browser.
You should see the BridgeBoard landing page. Click Get Started to register an account and begin using the app.