"use client";

import { ArrowRight, List } from "lucide-react";

interface BatchInputSectionProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  loading: boolean;
}

export default function BatchInputSection({
  value,
  onChange,
  onGenerate,
  loading,
}: BatchInputSectionProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate();
  };

  // Count valid URLs
  const urls = value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const urlCount = urls.length;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto relative group">
      {/* Brutalist Container */}
      <div className="relative bg-white border-4 border-black shadow-brutal-lg transition-all group-focus-within:translate-x-[2px] group-focus-within:translate-y-[2px] group-focus-within:shadow-brutal">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b-4 border-black bg-gray-50">
          <div className="flex items-center gap-3">
            <List size={24} strokeWidth={2.5} />
            <span className="font-bold text-lg uppercase tracking-wide">Batch Mode</span>
          </div>
          <span className="text-sm font-mono text-gray-500">
            {urlCount} {urlCount === 1 ? "URL" : "URLs"}
          </span>
        </div>

        {/* Textarea Input */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste multiple URLs (one per line)&#10;&#10;https://docs.stripe.com/api&#10;https://platform.openai.com/docs&#10;https://docs.anthropic.com/api"
          className="w-full px-6 py-6 text-lg font-mono bg-white border-none outline-none placeholder:text-gray-400 text-black resize-none"
          rows={8}
          disabled={loading}
          required
          autoFocus
        />

        {/* Action Button */}
        <div className="p-3 border-t-4 border-black bg-gray-50 flex justify-end">
          <button
            type="submit"
            disabled={loading || urlCount === 0}
            className="h-12 px-8 bg-black text-white font-bold text-lg flex items-center gap-2 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating {urlCount} Skills</span>
              </>
            ) : (
              <>
                <span>Generate {urlCount} {urlCount === 1 ? "Skill" : "Skills"}</span>
                <ArrowRight size={20} strokeWidth={3} />
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Helper Text */}
      <div className="mt-3 flex justify-between px-1 text-xs font-mono text-gray-500 uppercase tracking-wider">
        <span>Parallel processing with Hyperbrowser</span>
        <span>One URL per line</span>
      </div>
    </form>
  );
}
