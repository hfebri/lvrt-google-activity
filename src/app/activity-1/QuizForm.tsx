"use client";

import { useState } from "react";
import { generateLetter, generateImage } from "./actions";
import { Loader2, ChevronRight, ChevronLeft, Send } from "lucide-react";
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
      setLoadingStep("Crafting your message...");
      const letterProgress = simulateProgress(0, 45, 3000);

      const { letter, prompt, sharingText } = await generateLetter(formData);
      clearInterval(letterProgress);
      setProgress(50);

      setLoadingStep("Designing your card...");
      await new Promise(resolve => setTimeout(resolve, 300));
      const imageProgress = simulateProgress(50, 95, 25000);

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
      <div className="flex flex-col items-center justify-center p-12 text-center w-full max-w-md mx-auto bg-surface/50 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          <Loader2 className="relative text-primary animate-spin" size={64} />
        </div>
        <h3 className="text-2xl font-serif text-primary mb-2">{loadingStep}</h3>
        <p className="text-gray-400 mb-8 text-sm">AI is weaving magic into your greeting...</p>
        
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary-hover transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }} 
          />
        </div>
        <p className="mt-2 text-primary/80 font-mono text-sm">{Math.round(progress)}%</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto bg-surface/50 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="mb-8 text-center">
        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs tracking-widest uppercase mb-4">
          Step {step} of 3
        </span>
        <div className="flex justify-center gap-2 mb-2">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-primary' : 'w-2 bg-white/10'}`} />
          ))}
        </div>
      </div>

      <div className="min-h-[300px]">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-3xl font-serif text-white mb-8 text-center">Who is this for?</h2>
            
            <div className="space-y-6">
              <div className="group">
                <label className="block text-primary/80 text-sm font-semibold mb-2 ml-1">Relationship</label>
                <select 
                  name="relationship" 
                  value={formData.relationship} 
                  onChange={handleChange}
                  className="input-field appearance-none cursor-pointer hover:bg-white/5"
                >
                  <option value="Family">Family</option>
                  <option value="Friend">Friend</option>
                  <option value="Colleague">Colleague</option>
                  <option value="Partner">Partner</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="group">
                <label className="block text-primary/80 text-sm font-semibold mb-2 ml-1">Recipient Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. Budi"
                  className="input-field hover:bg-white/5 placeholder:text-gray-600"
                />
              </div>
            </div>
            
            <div className="mt-10 flex justify-end">
              <button type="button" className="btn btn-primary w-full sm:w-auto" onClick={() => setStep(2)}>
                Next Step <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-3xl font-serif text-white mb-8 text-center">Set the Mood</h2>
            
            <div className="space-y-6">
              <div className="group">
                <label className="block text-primary/80 text-sm font-semibold mb-2 ml-1">Tone</label>
                <select 
                  name="tone" 
                  value={formData.tone} 
                  onChange={handleChange}
                  className="input-field appearance-none cursor-pointer hover:bg-white/5"
                >
                  <option value="Heartfelt">Heartfelt</option>
                  <option value="Casual">Casual</option>
                  <option value="Formal">Formal</option>
                  <option value="Funny">Funny</option>
                  <option value="Poetic">Poetic</option>
                </select>
              </div>
              
              <div className="group">
                <label className="block text-primary/80 text-sm font-semibold mb-2 ml-1">Key Message</label>
                <textarea 
                  name="keyMessage" 
                  value={formData.keyMessage} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. Sorry I can't come home this year..."
                  rows={4}
                  className="input-field hover:bg-white/5 placeholder:text-gray-600 resize-none"
                />
              </div>
            </div>
            
            <div className="mt-10 flex justify-between gap-4">
              <button type="button" className="btn btn-outline flex-1 sm:flex-none" onClick={() => setStep(1)}>
                <ChevronLeft size={18} /> Back
              </button>
              <button type="button" className="btn btn-primary flex-1 sm:flex-none" onClick={() => setStep(3)}>
                Next Step <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-3xl font-serif text-white mb-8 text-center">Final Touches</h2>
            
            <div className="space-y-6">
              <div className="group">
                <label className="block text-primary/80 text-sm font-semibold mb-2 ml-1">Additional Context (Optional)</label>
                <textarea 
                  name="additionalContext" 
                  value={formData.additionalContext} 
                  onChange={handleChange} 
                  placeholder="e.g. Mention our childhood memories..."
                  rows={4}
                  className="input-field hover:bg-white/5 placeholder:text-gray-600 resize-none"
                />
              </div>
            </div>
            
            <div className="mt-10 flex justify-between gap-4">
              <button type="button" className="btn btn-outline flex-1 sm:flex-none" onClick={() => setStep(2)}>
                <ChevronLeft size={18} /> Back
              </button>
              <button type="submit" className="btn btn-primary flex-1 sm:flex-none">
                Generate Letter <Send size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
