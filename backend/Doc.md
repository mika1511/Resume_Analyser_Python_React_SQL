# ATS Resume Analyzer Backend Documentation

## Overview
This backend is a FastAPI service with token-based authentication and resume analysis.

- HTTP server: `uvicorn` (FastAPI)
- Database: SQLAlchemy + MySQL/PyMySQL or SQLite (configurable through `DATABASE_URL`)
- Auth: JWT tokens with `python-jose`
- Password hashing: `passlib` with bcrypt_sha256
- Resume processing: `pdfplumber` for PDF text extraction
- Semantic scoring: `sentence-transformers` + scikit-learn cosine similarity

## Configuration
File: `config.py`
- `DATABASE_URL` from environment
- `SECRET_KEY`: JWT secret (default `change-this-secret`)
- `ALGORITHM`: JWT algorithm (default `HS256`)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: token lifetime (default 60)
- `UPLOAD_DIR`: folder for uploaded resumes (`uploads/`)

## Models
File: `models.py`
- `User`: id, name, email, password, created_at
- `Resume`: id, user_id, file_path, extracted_text, created_at

## Pydantic Schemas
File: `schemas.py`
- `UserCreate`: name, email, password
- `UserLogin`: email, password
- `Token`: access_token, token_type
- `AnalyzeRequest`: job_description, resume_id
- `AnalysisResult`: score, matched_skills, missing_skills, suggestions

## Auth Logic
File: `auth.py`
- `pwd_context` uses bcrypt_sha256
- `hash_password(password)` hashes password
- `verify_password(plain, hashed)` checks password
- `create_access_token(data)` encodes JWT with data payload + expiry
- `get_current_user(token)` validates JWT and fetches user from DB

## API Endpoints
File: `main.py`

### Register
- `POST /register`
- Body: `UserCreate`
- Checks email uniqueness
- Stores hashed password
- Returns: JWT `access_token`, `token_type`

### Login
- `POST /login`
- Body: `UserLogin`
- Verifies credentials
- Returns: JWT `access_token`, `token_type`

### Upload Resume
- `POST /upload`
- Authenticated: `Depends(get_current_user)`
- Body: form-data `file` (UploadFile)
- Saves file to local `UPLOAD_DIR` as `userId_filename`
- Extracts text via `pdfplumber`
- Stores `Resume` record
- Returns: resume id, file path, text length

### List Resumes
- `GET /resume`
- Authenticated
- Returns user resumes list

### Analyze Resume
- `POST /analyze`
- Authenticated
- Body: `AnalyzeRequest`
- Loads user resume and computes score with `compute_score`
- Returns `AnalysisResult`

## Analyzer Details
File: `analyzer.py`
- Loads SentenceTransformer model `all-MiniLM-L6-v2`
- `TECH_SKILLS`: list of keywords for extraction
- `extract_skills(text)`: token-level skill extraction
- `compute_score(resume_text, job_description)`:
  - Semantic similarity (cosine on embeddings)
  - Skill matching / missing skills
  - Combines `semantic_score` and `skill_score` into final score (0-100)
  - Returns suggestions

## Startup
Run from project root:
```bash
uvicorn main:app --reload
```

or
```bash
python main.py
```

## Authentication Flow
1. `POST /login` with email+password
2. Receive `access_token` (JWT)
3. Add header `Authorization: Bearer <token>` to protected endpoints

## Troubleshooting
- `401 Unauthorized` for `/upload` often means missing/invalid token
- Ensure `SECRET_KEY` same in all runs (and use strong value)
- Token payload stores `sub` as user.id
- `passlib` password length limit (72 bytes), truncate long passwords client-side

## Notes
- Environment variable loading via `python-dotenv` in `config.py`
- `uploads/` directory created automatically
- CORS open (`*`) in middleware; adjust for production
