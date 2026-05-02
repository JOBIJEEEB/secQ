# Deployment Guidelines: secQ Website

## 1. Overview
The secQ project uses a split architecture to handle its different workloads effectively. 
* **Frontend (Vite + React):** Hosted on a serverless platform (Vercel) for speed and global availability.
* **Database & Auth (Supabase):** Managed cloud database handling user accounts, session tokens, and scan history.
* **Scanning Worker (Python):** Hosted on a containerized platform (Railway) to provide the compute power needed to run heavy CLI tools like Semgrep and OWASP ZAP.

## 2. Frontend Deployment (Vercel)

Vercel is the ideal host for the React frontend because it natively supports Vite and provides seamless GitHub integration.

### Steps for Vercel:
1. Push your local Vite React project to a public or private GitHub repository.
2. Log into Vercel and select "Add New" > "Project".
3. Import your GitHub repository.
4. **Environment Variables:** During the setup on Vercel, you must add the following environment variables (found in your Supabase dashboard):
   * `VITE_SUPABASE_URL`
   * `VITE_SUPABASE_ANON_KEY`
5. Click "Deploy". Vercel will build the Vite app and provide a live URL. Every subsequent push to your `main` branch will automatically trigger a new deployment.

## 3. Database Deployment (Supabase)

Supabase is already hosted in the cloud. However, you must configure your production environment variables to accept connections from your new Vercel frontend.

### Steps for Supabase:
1. **Authentication Redirects:** In your Supabase dashboard, go to Authentication > URL Configuration. Add your live Vercel domain (e.g., `https://secq.vercel.app`) to the "Site URL" and "Redirect URLs" so GitHub OAuth knows where to send users after they log in.
2. **Row Level Security:** Ensure the RLS policies created during the database setup phase are active, so users cannot access each other's scan data via the public API.

## 4. Scanning Worker Deployment (Railway)

Because running tools like OWASP ZAP and Semgrep requires command line execution and dedicated server resources, the backend worker must be written in Python and hosted on Railway.

### Python Worker Requirements:
The worker will act as a continuous listener, checking Supabase for new scan requests.
1. **Libraries:** Use the `supabase` Python client to poll or listen to the `scans` table for rows where `status = 'pending'`.
2. **Subprocess:** Use the Python `subprocess` module to execute the CLI tools (`semgrep`, `zaproxy`, `trufflehog`) securely.
3. **Data Formatting:** Once the subprocess completes, parse the JSON output from the security tools and push the results to the `vulnerabilities` table, updating the scan status to `completed`.

### Steps for Railway:
1. Create a separate directory or repository for your Python worker.
2. Include a `requirements.txt` file detailing your Python dependencies (e.g., `supabase`).
3. Include a `Dockerfile` that:
   * Uses a Python base image.
   * Installs the necessary CLI security tools (e.g., `pip install semgrep`, or downloading the ZAP package) directly into the container.
   * Runs your main Python listener script (e.g., `CMD ["python", "main.py"]`).
4. Log into Railway and connect this repository. Railway will detect the Dockerfile, build the container, and keep the Python script running continuously.
5. **Environment Variables:** In Railway, set your Supabase connection strings:
   * `SUPABASE_URL`
   * `SUPABASE_SERVICE_ROLE_KEY` (Use the Service Role key, not the Anon key, so the worker has admin rights to write the vulnerability data).