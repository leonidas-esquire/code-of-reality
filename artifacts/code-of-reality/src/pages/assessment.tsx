import { useState } from "react";
import { useGetLatestAssessment, useSubmitAssessment, useListAssessments } from "@workspace/api-client-react";
import { RadarChart } from "@/components/radar-chart";
import { Hexagon, Activity, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AssessmentPage() {
  const { data: latestAssessment, isLoading: loadingAssessment } = useGetLatestAssessment();
  const submitMutation = useSubmitAssessment();
  
  const [isScanning, setIsScanning] = useState(false);

  // Mock scoring interface for scan mode
  const handleScan = () => {
    setIsScanning(true);
    // In a real app, this would open a modal with questions
    // For now, we simulate a scan completion after 2s
    setTimeout(() => {
      submitMutation.mutate({
        data: {
          type: "DIMENSIONAL_SCAN",
          responses: [
            { dimensionId: "spatial", score: Math.floor(Math.random() * 5) + 5 },
            { dimensionId: "temporal", score: Math.floor(Math.random() * 5) + 5 },
            { dimensionId: "causal", score: Math.floor(Math.random() * 5) + 5 },
            { dimensionId: "intentional", score: Math.floor(Math.random() * 5) + 5 },
            { dimensionId: "identity", score: Math.floor(Math.random() * 5) + 5 },
            { dimensionId: "emotional", score: Math.floor(Math.random() * 5) + 5 },
            { dimensionId: "mental", score: Math.floor(Math.random() * 5) + 5 },
            { dimensionId: "transcendent", score: Math.floor(Math.random() * 5) + 5 },
          ]
        }
      }, {
        onSuccess: () => setIsScanning(false)
      });
    }, 2000);
  };

  const radarData = latestAssessment?.dimensionScores ? [
    { axis: "Spatial", value: latestAssessment.dimensionScores.spatial },
    { axis: "Temporal", value: latestAssessment.dimensionScores.temporal },
    { axis: "Causal", value: latestAssessment.dimensionScores.causal },
    { axis: "Intentional", value: latestAssessment.dimensionScores.intentional },
    { axis: "Identity", value: latestAssessment.dimensionScores.identity },
    { axis: "Emotional", value: latestAssessment.dimensionScores.emotional },
    { axis: "Mental", value: latestAssessment.dimensionScores.mental },
    { axis: "Transcendent", value: latestAssessment.dimensionScores.transcendent },
  ] : [];

  return (
    <div className="flex flex-col gap-6">
      <header className="mb-4 flex justify-between items-end">
        <div>
          <h1 className="font-serif text-4xl text-primary uppercase tracking-widest mb-2">Dimensional Scan</h1>
          <p className="font-mono text-sm text-muted-foreground uppercase tracking-widest">8-Axis Reality Assessment</p>
        </div>
        <Button 
          onClick={handleScan}
          disabled={isScanning || submitMutation.isPending}
          className="bg-primary/20 hover:bg-primary/40 text-primary border border-primary rounded-none clip-corners font-mono uppercase tracking-widest"
        >
          {isScanning ? "Scanning Matrix..." : "Initiate New Scan"}
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 sacred-border bg-card/60 backdrop-blur-md p-6 clip-corners flex items-center justify-center min-h-[500px]">
          {loadingAssessment ? (
            <div className="font-mono text-primary/50 uppercase tracking-widest animate-pulse">Calibrating sensors...</div>
          ) : radarData.length > 0 ? (
            <RadarChart data={radarData} width={500} height={500} />
          ) : (
            <div className="text-center">
              <Hexagon className="w-12 h-12 text-primary/30 mx-auto mb-4" />
              <p className="font-mono text-primary/50 uppercase tracking-widest">No dimensional data found.</p>
              <p className="font-mono text-xs text-muted-foreground mt-2">Initiate a scan to map your reality vector.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="sacred-border bg-card/60 backdrop-blur-md p-6 clip-corners">
            <h3 className="font-mono text-xs text-primary/80 uppercase tracking-widest mb-4 flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Overall Resonance
            </h3>
            <div className="text-6xl font-serif text-primary text-center my-6">
              {latestAssessment?.overallScore?.toFixed(1) || "--"}
            </div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest text-center">
              Harmonic Coherence Score
            </div>
          </div>

          <div className="sacred-border bg-card/60 backdrop-blur-md p-6 clip-corners flex-1">
            <h3 className="font-mono text-xs text-primary/80 uppercase tracking-widest mb-4 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Axis Diagnostics
            </h3>
            
            <div className="space-y-3 mt-4">
              {radarData.map((d) => (
                <div key={d.axis} className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground uppercase w-24">{d.axis}</span>
                  <div className="flex-1 h-1 bg-primary/10 mx-3">
                    <div className="h-full bg-primary" style={{ width: `${(d.value / 10) * 100}%` }} />
                  </div>
                  <span className="font-mono text-xs text-primary w-8 text-right">{d.value.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
