from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import re

model = SentenceTransformer('all-MiniLM-L6-v2')

TECH_SKILLS = [
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust",
    "react", "angular", "vue", "next.js", "node.js", "express", "django", "flask", "fastapi",
    "sql", "mysql", "postgresql", "mongodb", "redis",
    "docker", "kubernetes", "aws", "azure", "gcp", "terraform",
    "git", "ci/cd", "jenkins", "github actions",
    "html", "css", "tailwind", "rest", "graphql",
    "linux", "bash", "nginx",
    "machine learning", "deep learning", "tensorflow", "pytorch", "nlp",
    "agile", "scrum", "swift", "kotlin", "flutter", "react native",
    "pandas", "numpy", "scikit-learn", "kafka", "rabbitmq",
]

def extract_skills(text: str) -> list:
    lower = text.lower()
    return [s for s in TECH_SKILLS if re.search(rf'\b{re.escape(s)}\b', lower)]

def compute_score(resume_text: str, job_description: str) -> dict:
    embeddings = model.encode([resume_text, job_description])
    sim = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
    semantic_score = max(0, min(100, int(sim * 100)))

    resume_skills = extract_skills(resume_text)
    job_skills = extract_skills(job_description)
    matched = [s for s in resume_skills if s in job_skills]
    missing = [s for s in job_skills if s not in resume_skills]

    skill_score = (len(matched) / len(job_skills) * 100) if job_skills else 50
    final_score = int(semantic_score * 0.5 + skill_score * 0.5)

    suggestions = (
        f"Add experience with: {', '.join(missing[:5])}. This will improve your ATS match."
        if missing else "Great match! Your resume covers the key skills."
    )

    return {
        "score": min(final_score, 100),
        "matched_skills": matched,
        "missing_skills": missing,
        "suggestions": suggestions,
    }
