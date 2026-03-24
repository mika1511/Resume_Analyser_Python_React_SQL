# ATS Resume Analyzer

A web app to analyze resumes against job descriptions and get an ATS match score.

## Quick Start

### Option 1: Frontend Only (No backend needed)
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173 — works with client-side PDF parsing and keyword matching.

### Option 2: Full Stack (with AI model)

#### Prerequisites
- Python 3.9+
- MySQL 8.0+
- Node.js 18+

#### 1. Setup MySQL
```bash
mysql -u root -p < backend/schema.sql
```

#### 2. Setup Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # Edit with your MySQL credentials
python main.py                # Runs on http://localhost:8000
```

#### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev                   # Runs on http://localhost:5173
```

## Features
- 🔐 JWT Authentication (signup/login)
- 📄 PDF resume upload & text extraction
- 📝 Job description input
- 📊 ATS match score (0-100)
- ✅ Matched & missing skills
- 💡 Improvement suggestions
- 🤖 Sentence-transformers AI similarity (backend mode)

## API Endpoints
| Method | Endpoint    | Description          |
|--------|-------------|----------------------|
| POST   | /register   | Create account       |
| POST   | /login      | Get JWT token        |
| POST   | /upload     | Upload PDF resume    |
| GET    | /resume     | List user resumes    |
| POST   | /analyze    | Analyze resume vs JD |

## 🚀 GitHub & Deployment

### 1. Push to GitHub
1. Create a new repository on [GitHub](https://github.com/new).
2. Connect your local folder and push:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/ats-resume-analyzer.git
   git branch -M main
   git push -u origin main
   ```

### 2. Deployment Tips

#### **Frontend (Vercel/Netlify)**
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Root Directory:** `frontend`
- **Environment Variables:** Set `VITE_API_URL` to your backend URL.

#### **Backend (Render/Railway/Heroku)**
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `python main.py` (The app is configured to listen on the correct `$PORT`)
- **Root Directory:** `backend`
- **Environment Variables:**
  - `DATABASE_URL`: Your production MySQL/PostgreSQL URL.
  - `SECRET_KEY`: A long random string.
  - `PORT`: (Automatically set by most platforms).

#### **Database**
Use a managed database like **Aiven for MySQL**, **PlanetScale**, or the internal database services provided by Render/Railway.
