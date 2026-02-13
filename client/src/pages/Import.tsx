import { useState, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDashboard } from "@/store/dashboard-context";
import { useThemeRules } from "@/hooks/use-theme-rules";
import { parseAndProcessCSV } from "@/lib/data-processor";
import { UploadCloud, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function ImportPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { setData } = useDashboard();
  const { data: themeRules = [] } = useThemeRules();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleFile = async (file: File) => {
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      toast({ 
        title: "Invalid file type", 
        description: "Please upload a CSV file.", 
        variant: "destructive" 
      });
      return;
    }

    setIsProcessing(true);
    try {
      const data = await parseAndProcessCSV(file, { themeRules });
      setData(data);
      toast({
        title: "Import Successful",
        description: `Processed ${data.length} records.`,
      });
      setLocation("/overview");
    } catch (error) {
      console.error(error);
      toast({
        title: "Import Failed",
        description: "Could not parse the CSV file. Check the format.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <Layout title="Import Data" subtitle="Upload your service call CSV to begin analysis" showFilters={false}>
      <div className="max-w-2xl mx-auto mt-8">
        <Card
          className={`
            border-2 border-dashed p-12 text-center transition-all cursor-pointer
            ${isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/50"}
          `}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".csv"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          
          <div className="flex flex-col items-center gap-4">
            <div className={`p-4 rounded-full ${isProcessing ? 'bg-amber-100 animate-pulse' : 'bg-primary/10'}`}>
              {isProcessing ? (
                <FileSpreadsheet className="w-10 h-10 text-amber-600" />
              ) : (
                <UploadCloud className="w-10 h-10 text-primary" />
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold">
                {isProcessing ? "Processing Data..." : "Drop your CSV here"}
              </h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                {isProcessing 
                  ? "Analyzing records, calculating durations, and applying classification rules." 
                  : "Click to browse or drag and drop your file directly."}
              </p>
            </div>

            <Button disabled={isProcessing} className="mt-4">
              {isProcessing ? "Please wait..." : "Select File"}
            </Button>
          </div>
        </Card>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-blue-900 dark:text-blue-100">Calculated Fields</p>
              <p className="text-blue-700 dark:text-blue-300 mt-1">Duration, Day of Week, and Month are automatically derived from timestamps.</p>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/50 flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-purple-900 dark:text-purple-100">Auto Classification</p>
              <p className="text-purple-700 dark:text-purple-300 mt-1">Themes are applied automatically based on your active Keyword Rules.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
