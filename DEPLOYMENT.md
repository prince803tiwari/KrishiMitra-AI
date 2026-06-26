# KrishiMitra AI - Deployment Guide

This document describes how to deploy the **KrishiMitra AI** multi-agent platform to production.

---

## 1. Backend Deployment (Google Cloud Run / Render)

FastAPI is packaged as a Docker container, making it ideal for deployment to **Google Cloud Run**.

### Dockerfile
Create a `Dockerfile` in the `/backend` folder:
```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "run.py"]
```

### Steps to Deploy to Google Cloud Run
1.  **Build the Container Image**:
    ```bash
    gcloud builds submit --tag gcr.io/your-gcp-project-id/krishimitra-backend
    ```
2.  **Deploy to Cloud Run**:
    ```bash
    gcloud run deploy krishimitra-backend \
      --image gcr.io/your-gcp-project-id/krishimitra-backend \
      --platform managed \
      --region us-central1 \
      --allow-unauthenticated \
      --set-env-vars "GEMINI_API_KEY=your_gemini_key,DEEPGRAM_API_KEY=your_deepgram_key"
    ```
3.  **Note the URL**: After deployment, Cloud Run will output a service URL (e.g. `https://krishimitra-backend-xxxxx.a.run.app`). Keep this URL for the frontend configuration.

---

## 2. Frontend Deployment (Vercel)

The React frontend compiles to static assets (HTML/CSS/JS) and can be hosted on **Vercel** or **Firebase Hosting**.

### Steps to Deploy to Vercel
1.  **Configure Environment Variables**:
    Create a production build variable in your Vite config or configure the backend fetch URL dynamically in `App.jsx` based on `window.location.hostname`.
    *For production, update the backend base URL from `http://localhost:8000` to the deployed Cloud Run URL (e.g., in your API requests).*
2.  **Deploy using Vercel CLI**:
    ```bash
    cd frontend
    npm run build
    vercel deploy --prod
    ```
3.  **Settings**:
    - **Build Command**: `npm run build`
    - **Output Directory**: `dist`
    - **Install Command**: `npm install`

---

## 3. Database Persistence

By default, the SQLite database is local and runs as `./krishimitra.db`.
*   **In Cloud Run**: Cloud Run containers have ephemeral filesystems. If the instance restarts, SQLite data will clear.
*   **Production recommendation**: For real production persistence, update `DATABASE_URL` in your `.env` or Environment Variables to point to a managed Postgres instance, such as **Google Cloud SQL**:
    ```
    DATABASE_URL=postgresql://user:password@db-host:5432/krishimitra
    ```
    FastAPI will automatically wire up the tables and schemas on startup.
