import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface ResumeUploadResponse {
  id: number;
  file_path: string;
  text_length: number;
}

export interface Resume {
  id: number;
  file_path: string;
  created_at: string;
}

export interface AnalysisRequest {
  resume_id: number;
  job_description: string;
}

export interface AnalysisResult {
  score: number;
  matched_skills: string[];
  missing_skills: string[];
  suggestions: string;
}

export const authAPI = {
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/register', { name, email, password });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/login', { email, password });
    return response.data;
  },
};

export const resumeAPI = {
  upload: async (file: File): Promise<ResumeUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getResumes: async (): Promise<Resume[]> => {
    const response = await api.get('/resume');
    return response.data;
  },
};

export const analysisAPI = {
  analyze: async (data: AnalysisRequest): Promise<AnalysisResult> => {
    const response = await api.post('/analyze', data);
    return response.data;
  },
};

export default api;