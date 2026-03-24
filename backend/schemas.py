from pydantic import BaseModel
from typing import List

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class AnalyzeRequest(BaseModel):
    job_description: str
    resume_id: int

class AnalysisResult(BaseModel):
    score: int
    matched_skills: List[str]
    missing_skills: List[str]
    suggestions: str
