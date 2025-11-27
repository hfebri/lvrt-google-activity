"use client";

import { useState } from "react";
import styles from "./QuizForm.module.css";
import { generateLetter, generateImage } from "./actions";
import { Loader2 } from "lucide-react";
import type { SocialSharingText } from "@/lib/socialSharingTypes";

interface QuizFormProps {
  onComplete: (result: { letter: string; imageUrl: string; sharingText?: SocialSharingText }) => void;
}

export default function QuizForm({ onComplete }: QuizFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [progress, setProgress] = useState(0);

  const [formData, setFormData] = useState({
    relationship: "Family",
    name: "",
    tone: "Heartfelt",
    keyMessage: "",
    additionalContext: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setProgress(0);

    // Simulate smooth progress
    const simulateProgress = (start: number, end: number, duration: number) => {
      const increment = (end - start) / (duration / 100);
      const interval = setInterval(() => {
        setProgress(prev => {
          const next = prev + increment;
          if (next >= end) {
            clearInterval(interval);
            return end;
          }
          return next;
        });
      }, 100);
      return interval;
    };

    try {
      // Step 1: Generate letter (0-50%)
      setLoadingStep("Writing your letter...");
      const letterProgress = simulateProgress(0, 45, 3000);

      const { letter, prompt, sharingText } = await generateLetter(formData);
      clearInterval(letterProgress);
      setProgress(50);

      // Step 2: Generate image (50-100%)
      setLoadingStep("Designing the card... (this may take 20-30 seconds)");
      await new Promise(resolve => setTimeout(resolve, 300));
      const imageProgress = simulateProgress(50, 95, 25000); // More realistic timing

      const imageUrl = await generateImage(prompt);
      clearInterval(imageProgress);
      setProgress(100);

      await new Promise(resolve => setTimeout(resolve, 500));
      onComplete({ letter, imageUrl, sharingText });
    } catch (error) {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={48} />
        <p className={styles.loadingText}>{loadingStep}</p>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <p className={styles.percentage}>{Math.round(progress)}%</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.stepIndicator}>
        Step {step} of 3
      </div>

      {step === 1 && (
        <div className={styles.step}>
          <h2>Who is this for?</h2>
          <div className={styles.field}>
            <label>Relationship</label>
            <select name="relationship" value={formData.relationship} onChange={handleChange}>
              <option value="Family">Family</option>
              <option value="Friend">Friend</option>
              <option value="Colleague">Colleague</option>
              <option value="Partner">Partner</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>Recipient Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              placeholder="e.g. Budi"
            />
          </div>
          <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>Next</button>
        </div>
      )}

      {step === 2 && (
        <div className={styles.step}>
          <h2>Set the Mood</h2>
          <div className={styles.field}>
            <label>Tone</label>
            <select name="tone" value={formData.tone} onChange={handleChange}>
              <option value="Heartfelt">Heartfelt</option>
              <option value="Casual">Casual</option>
              <option value="Formal">Formal</option>
              <option value="Funny">Funny</option>
              <option value="Poetic">Poetic</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>Key Message</label>
            <textarea 
              name="keyMessage" 
              value={formData.keyMessage} 
              onChange={handleChange} 
              required 
              placeholder="e.g. Sorry I can't come home this year..."
              rows={4}
            />
          </div>
          <div className={styles.buttons}>
            <button type="button" className="btn" onClick={() => setStep(1)}>Back</button>
            <button type="button" className="btn btn-primary" onClick={() => setStep(3)}>Next</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className={styles.step}>
          <h2>Any last details?</h2>
          <div className={styles.field}>
            <label>Additional Context (Optional)</label>
            <textarea 
              name="additionalContext" 
              value={formData.additionalContext} 
              onChange={handleChange} 
              placeholder="e.g. Mention our childhood memories..."
              rows={4}
            />
          </div>
          <div className={styles.buttons}>
            <button type="button" className="btn" onClick={() => setStep(2)}>Back</button>
            <button type="submit" className="btn btn-primary">Generate Letter</button>
          </div>
        </div>
      )}
    </form>
  );
}
