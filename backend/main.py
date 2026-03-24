from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import pdfplumber
import os

from database import engine, get_db, Base
from models import User, Resume
from schemas import UserCreate, UserLogin, Token, AnalyzeRequest, AnalysisResult
from auth import hash_password, verify_password, create_access_token, get_current_user
from analyzer import compute_score
from config import UPLOAD_DIR

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ATS Resume Analyzer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Auth ──

@app.post("/register", response_model=Token)
def register(data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(400, "Email already registered")
    user = User(name=data.name, email=data.email, password=hash_password(data.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"access_token": create_access_token({"sub": str(user.id)}), "token_type": "bearer"}

@app.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(401, "Invalid credentials")
    return {"access_token": create_access_token({"sub": str(user.id)}), "token_type": "bearer"}

# ── Resume ──

@app.post("/upload")
def upload_resume(file: UploadFile = File(...), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    file_path = os.path.join(UPLOAD_DIR, f"{user.id}_{file.filename}")
    with open(file_path, "wb") as f:
        f.write(file.file.read())
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text += (page.extract_text() or "") + "\n"
    resume = Resume(user_id=user.id, file_path=file_path, extracted_text=text.strip())
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return {"id": resume.id, "file_path": resume.file_path, "text_length": len(resume.extracted_text)}

@app.get("/resume")
def get_resumes(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resumes = db.query(Resume).filter(Resume.user_id == user.id).all()
    return [{"id": r.id, "file_path": r.file_path, "created_at": str(r.created_at)} for r in resumes]

# ── Analysis ──

@app.post("/analyze", response_model=AnalysisResult)
def analyze(data: AnalyzeRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == data.resume_id, Resume.user_id == user.id).first()
    if not resume:
        raise HTTPException(404, "Resume not found")
    return compute_score(resume.extracted_text, data.job_description)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
