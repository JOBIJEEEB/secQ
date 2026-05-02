# Technical Guidelines: secQ Website

## 1. Architecture Overview
This application is a full stack security auditing tool designed to scan AI generated web applications. Note that most of the target websites will include login and signup forms. The website is officially named secQ. It accepts a live URL for DAST, orchestrates the scanning engine, and presents the findings in a dashboard.

* **Frontend:** React.js built with Vite integrated with Bootstrap customized for Apple-inspired design language.
* **Backend, Auth, and Database:** Supabase.
* **Scanning Engine:** OWASP ZAP for DAST.

## 2. Frontend Guidelines (React and Bootstrap)

### 2.1. Framework and Setup
* Initialize the project using Vite for a fast and optimized development environment.
* Use functional components and React Hooks like `useState`, `useEffect`, and `useContext`.
* **Bootstrap Integration:** Use `react-bootstrap` for component structures to ensure accessible and responsive grids. 
* **Theming Implementation:** Create a custom `custom.scss` file to override Bootstrap default variables and apply the Apple-inspired styles defined in `branding.md`.

### 2.2. Routing and Views
* **Dashboard:** The main hub for initiating new DAST scans and viewing a quick summary of recent activity.
* **History:** A dedicated tab displaying a table of all past scans tied to the user, sortable by date and security score.
* **Vulnerability Library:** An educational tab listing common vulnerabilities found in vibe-coded apps with explanations and mitigation strategies.
* **Remediation Sandbox:** An interactive workspace where users can paste vulnerable code snippets, apply suggested mitigations, and run a quick verification scan.

## 3. Security Scanning Integration (DAST Only)

The worker triggers the OWASP ZAP API to scan for the following comprehensive vulnerability categories:

* **Injection Attacks:** SQL Injection, Command Injection, and XML External Entity (XXE) Injection.
* **Cross-Site Scripting (XSS):** Persistent, Reflected, and DOM-based XSS.
* **Broken Authentication:** Weak session management, session mix-up, and credential risks.
* **Security Misconfigurations:** Unhardened server settings, open ports, and missing security headers.
* **Sensitive Data Exposure:** Unintentional leaks of user emails, PII, or unencrypted data in transit.
* **Broken Access Control:** Insecure Direct Object Reference (IDOR) and Path Traversal.
* **Request Forgery:** Cross-Site Request Forgery (CSRF) and Server-Side Request Forgery (SSRF).

## 4. Testing and Code Quality
* **Code Cleanup:** Delete all dead code. Use `ruff` and `vulture` to maintain code hygiene.
* **Code Style:** Use `camelCasing` for all variable names, function names, and general file naming conventions.