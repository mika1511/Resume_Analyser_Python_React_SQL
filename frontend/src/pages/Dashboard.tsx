import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ScoreCircle from "@/components/ScoreCircle";
import SkillBadge from "@/components/SkillBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Sparkles, Loader2 } from "lucide-react";
import { resumeAPI, analysisAPI, AnalysisResult } from "@/lib/api";
import { toast } from "sonner";

export default function Dashboard() {
  const { user } = useAuth();
  const [fileName, setFileName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"upload" | "job" | "results">("upload");
  const [uploadedResumeId, setUploadedResumeId] = useState<number | null>(null);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }
    setFileName(file.name);
    setLoading(true);
    try {
      const response = await resumeAPI.upload(file);
      setUploadedResumeId(response.id);
      setStep("job");
      toast.success("Resume uploaded and processed successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to upload resume");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!jobDescription.trim() || !uploadedResumeId) {
      toast.error("Please upload a resume and enter a job description");
      return;
    }
    setLoading(true);
    try {
      const res = await analysisAPI.analyze({
        resume_id: uploadedResumeId,
        job_description: jobDescription,
      });
      setResult(res);
      setStep("results");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFileName("");
    setJobDescription("");
    setResult(null);
    setStep("upload");
    setUploadedResumeId(null);
  };

  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container py-8 max-w-3xl">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {["upload", "job", "results"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-display font-bold border ${
                step === s ? "bg-primary text-primary-foreground border-primary glow-green" :
                ["upload", "job", "results"].indexOf(step) > i ? "bg-primary/20 text-primary border-primary/40" :
                "bg-muted text-muted-foreground border-border"
              }`}>
                {i + 1}
              </div>
              {i < 2 && <div className={`w-12 h-px ${["upload", "job", "results"].indexOf(step) > i ? "bg-primary/40" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === "upload" && (
            <motion.div key="upload" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <Card className="glass glow-green">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary" />
                    Upload Your Resume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                    <FileText className="w-10 h-10 text-muted-foreground mb-3" />
                    <span className="text-sm text-muted-foreground">
                      {fileName || "Click to upload PDF resume"}
                    </span>
                    <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
                  </label>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "job" && (
            <motion.div key="job" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <Card className="glass glow-green">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Paste Job Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Resume: <span className="text-primary font-medium">{fileName}</span>
                  </p>
                  <Textarea
                    value={jobDescription}
                    onChange={e => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here..."
                    className="min-h-[200px] font-body"
                  />
                  <Button onClick={handleAnalyze} disabled={loading} className="w-full font-display">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Analyze Match
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "results" && result && (
            <motion.div key="results" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
              <Card className="glass glow-green">
                <CardHeader>
                  <CardTitle className="font-display text-center">ATS Match Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScoreCircle score={result.score} />
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="font-display text-sm text-primary">
                      ✓ Matched Skills ({result.matched_skills.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {result.matched_skills.length > 0 ? (
                      result.matched_skills.map(s => <SkillBadge key={s} skill={s} variant="matched" />)
                    ) : (
                      <p className="text-sm text-muted-foreground">No direct skill matches found</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="font-display text-sm text-destructive">
                      ✗ Missing Skills ({result.missing_skills.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {result.missing_skills.length > 0 ? (
                      result.missing_skills.map(s => <SkillBadge key={s} skill={s} variant="missing" />)
                    ) : (
                      <p className="text-sm text-muted-foreground">You cover all required skills!</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="glass">
                <CardHeader>
                  <CardTitle className="font-display text-sm">💡 Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.suggestions}</p>
                </CardContent>
              </Card>

              <Button onClick={handleReset} variant="outline" className="w-full font-display">
                Analyze Another Resume
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
