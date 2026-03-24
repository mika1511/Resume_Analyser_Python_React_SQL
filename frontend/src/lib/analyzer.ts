// Client-side ATS analyzer using keyword matching (MVP)
// In production, this would call the FastAPI backend with sentence-transformers

const TECH_SKILLS = [
  "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust", "ruby", "php",
  "react", "angular", "vue", "next.js", "node.js", "express", "django", "flask", "fastapi", "spring",
  "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch",
  "docker", "kubernetes", "aws", "azure", "gcp", "terraform", "ansible",
  "git", "ci/cd", "jenkins", "github actions", "gitlab",
  "html", "css", "tailwind", "sass", "bootstrap",
  "rest", "graphql", "grpc", "websocket",
  "linux", "bash", "nginx", "apache",
  "machine learning", "deep learning", "tensorflow", "pytorch", "nlp", "computer vision",
  "agile", "scrum", "jira", "confluence",
  "figma", "sketch", "adobe xd",
  "swift", "kotlin", "flutter", "react native",
  "pandas", "numpy", "scikit-learn", "matplotlib",
  "rabbitmq", "kafka", "celery",
  "oauth", "jwt", "ssl/tls", "cybersecurity",
];

function extractSkills(text: string): string[] {
  const lower = text.toLowerCase();
  return TECH_SKILLS.filter(skill => {
    // Match whole word or with boundaries
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    return regex.test(lower);
  });
}

function computeSimilarity(resumeText: string, jobText: string): number {
  // Simple TF-IDF-like keyword overlap scoring
  const resumeWords = new Set(resumeText.toLowerCase().split(/\W+/).filter(w => w.length > 2));
  const jobWords = jobText.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  const jobUnique = new Set(jobWords);

  let matches = 0;
  for (const word of jobUnique) {
    if (resumeWords.has(word)) matches++;
  }

  return jobUnique.size > 0 ? (matches / jobUnique.size) * 100 : 0;
}

function generateSuggestions(missingSkills: string[]): string {
  if (missingSkills.length === 0) return "Great match! Your resume covers the key skills.";

  const categories: Record<string, string[]> = {
    cloud: ["aws", "azure", "gcp", "terraform", "kubernetes", "docker"],
    backend: ["python", "java", "node.js", "django", "flask", "fastapi", "spring", "express"],
    frontend: ["react", "angular", "vue", "next.js", "typescript", "tailwind"],
    data: ["sql", "mysql", "postgresql", "mongodb", "redis", "pandas", "numpy"],
    devops: ["ci/cd", "jenkins", "github actions", "docker", "kubernetes", "ansible"],
    ml: ["machine learning", "deep learning", "tensorflow", "pytorch", "nlp"],
  };

  const gaps: string[] = [];
  for (const [category, skills] of Object.entries(categories)) {
    if (missingSkills.some(s => skills.includes(s))) {
      gaps.push(category);
    }
  }

  const gapText = gaps.length > 0 ? gaps.join(", ") : "relevant";
  return `Consider adding experience with: ${missingSkills.slice(0, 5).join(", ")}. Focus on strengthening your ${gapText} skills to improve your match.`;
}

export interface AnalysisResult {
  score: number;
  matched_skills: string[];
  missing_skills: string[];
  suggestions: string;
}

export function analyzeResume(resumeText: string, jobDescription: string): AnalysisResult {
  const resumeSkills = extractSkills(resumeText);
  const jobSkills = extractSkills(jobDescription);

  const matched = resumeSkills.filter(s => jobSkills.includes(s));
  const missing = jobSkills.filter(s => !resumeSkills.includes(s));

  // Weighted score: 60% skill match + 40% text similarity
  const skillScore = jobSkills.length > 0 ? (matched.length / jobSkills.length) * 100 : 50;
  const textScore = computeSimilarity(resumeText, jobDescription);
  const score = Math.round(skillScore * 0.6 + textScore * 0.4);

  return {
    score: Math.min(score, 100),
    matched_skills: matched,
    missing_skills: missing,
    suggestions: generateSuggestions(missing),
  };
}
