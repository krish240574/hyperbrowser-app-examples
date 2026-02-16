"use client";

import { BatchResult } from "@/types";
import { Check, X, Loader2, Download, Eye, Package } from "lucide-react";
import { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface BatchResultsSectionProps {
  results: BatchResult[];
  onPreview: (result: BatchResult) => void;
}

export default function BatchResultsSection({
  results,
  onPreview,
}: BatchResultsSectionProps) {
  const [downloading, setDownloading] = useState(false);

  if (results.length === 0) {
    return null;
  }

  const successCount = results.filter((r) => r.status === "success").length;
  const errorCount = results.filter((r) => r.status === "error").length;
  const processingCount = results.filter((r) => r.status === "processing").length;

  const handleDownloadAll = async () => {
    setDownloading(true);
    try {
      const zip = new JSZip();
      
      results
        .filter((r) => r.status === "success" && r.content)
        .forEach((result, index) => {
          // Create a clean filename from URL
          const filename = result.url
            .replace(/^https?:\/\//, "")
            .replace(/[^a-z0-9]/gi, "-")
            .substring(0, 50);
          zip.file(`skill-${index + 1}-${filename}.md`, result.content || "");
        });

      const blob = await zip.generateAsync({ type: "blob" });
      saveAs(blob, `hyperskills-pack-${successCount}-skills.zip`);
    } catch (error) {
      console.error("Failed to create ZIP:", error);
    } finally {
      setDownloading(false);
    }
  };

  const getStatusIcon = (status: BatchResult["status"]) => {
    switch (status) {
      case "success":
        return <Check size={20} className="text-green-600" strokeWidth={3} />;
      case "error":
        return <X size={20} className="text-red-600" strokeWidth={3} />;
      case "processing":
        return <Loader2 size={20} className="text-blue-600 animate-spin" strokeWidth={3} />;
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-16">
      {/* Header with Stats */}
      <div className="sticky top-6 z-10 mb-[-4px]">
        <div className="bg-black text-white p-4 flex items-center justify-between border-4 border-black shadow-brutal border-b-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 font-mono text-sm">
              <Package size={16} />
              <span>Batch Results</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
              {successCount > 0 && (
                <span className="text-green-400">✓ {successCount} Success</span>
              )}
              {processingCount > 0 && (
                <span className="text-blue-400">⏳ {processingCount} Processing</span>
              )}
              {errorCount > 0 && (
                <span className="text-red-400">✗ {errorCount} Failed</span>
              )}
            </div>
          </div>
          
          <button
            onClick={handleDownloadAll}
            disabled={successCount === 0 || downloading}
            className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Creating ZIP
              </>
            ) : (
              <>
                <Download size={14} />
                Download All ({successCount})
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Grid */}
      <div className="border-4 border-black bg-white shadow-brutal">
        <div className="divide-y-4 divide-black">
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors ${
                result.status === "processing" ? "animate-pulse" : ""
              }`}
            >
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {getStatusIcon(result.status)}
              </div>

              {/* URL and Status */}
              <div className="flex-grow min-w-0">
                <div className="font-mono text-sm text-gray-900 truncate mb-1">
                  {result.url}
                </div>
                {result.error && (
                  <div className="text-xs text-red-600 font-medium">
                    {result.error}
                  </div>
                )}
                {result.duration && result.status === "success" && (
                  <div className="text-xs text-gray-500 font-mono">
                    Generated in {(result.duration / 1000).toFixed(1)}s
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {result.status === "success" && (
                <div className="flex-shrink-0">
                  <button
                    onClick={() => onPreview(result)}
                    className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors flex items-center gap-2"
                  >
                    <Eye size={14} />
                    Preview
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Progress Footer */}
      {processingCount > 0 && (
        <div className="mt-4 px-4 py-3 bg-blue-50 border-2 border-blue-600 text-center">
          <div className="flex items-center justify-center gap-3">
            <Loader2 size={20} className="animate-spin text-blue-600" />
            <div className="text-sm font-bold text-blue-900 uppercase tracking-wide">
              Batch processing {results.length} URLs with Hyperbrowser...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
