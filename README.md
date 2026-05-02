# secQ

A high-performance, non-intrusive Dynamic Application Security Testing (DAST) scanner designed for modern web applications.

## Preview

### Security Scan Interface
Instantly probe your live environments with our intuitive scanning interface.

![Scan Page](./screenshots/scan_page.png)

### Scan Results & Analysis
Get clear, actionable security reports with specialized scoring and vulnerability breakdowns.

![Scan Complete](./screenshots/scan_complete.png)

## Project Overview

secQ provides an enterprise-grade security auditing experience with a focus on simplicity and speed. It enables developers and security professionals to instantly probe live environments for vulnerabilities such as Cross-Site Scripting (XSS) and SQL Injection without the need for complex configuration.

Built with a "Safety-First" approach, secQ performs read-only tests in isolated sandboxes, ensuring that your production data remains untouched and secure while providing actionable insights into your application's security posture.

## Tech Stack

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)
![Sass](https://img.shields.io/badge/Sass-CC6699?style=for-the-badge&logo=sass&logoColor=white)

- **Frontend**: React 19, Vite, React-Bootstrap, Lucide Icons, Recharts
- **Worker**: Python 3.x, OWASP ZAP API integration
- **Database & Auth**: Supabase (PostgreSQL, GoTrue)
- **Styling**: SCSS / Custom Modern UI

## Structure

The project is divided into two main components: a modern React frontend and a Python-based security worker.

```text
secQ/
├── frontend/                # React Vite Application
│   ├── src/
│   │   ├── assets/          # Static assets and global styles
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Authentication and Global State
│   │   ├── lib/             # API clients (Supabase)
│   │   └── pages/           # Application views (Scan, History, etc.)
│   └── vite.config.js       # Vite configuration
├── worker/                  # Python Security Worker
│   ├── main.py              # DAST scanning logic via OWASP ZAP
│   └── requirements.txt     # Python dependencies
├── screenshots/             # Project preview images
└── README.md                # Project documentation
```
