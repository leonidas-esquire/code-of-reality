import { useState } from "react";
import { useSubmitAssessment } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Hexagon, ChevronRight, Activity } from "lucide-react";

const DIMENSIONS = [
  "Spatial", "Temporal", "Causal", "Intentional", 
  "Identity", "Emotional", "Mental", "Transcendent"
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [, setLocation] = useLocation();
  const submitMutation = useSubmitAssessment();

  const handleScore = (score: number) => {
    const dimension = DIMENSIONS[currentStep].toLowerCase();
    setScores(prev => ({ ...prev, [dimension]: score }));
    
    if (currentStep < DIMENSIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Submit
      submitMutation.mutate({
        data: {
          type: "DIMENSIONAL_SCAN",
          responses: DIMENSIONS.map(d => ({
            dimensionId: d.toLowerCase(),
            score: scores[d.toLowerCase()] || score // use new score for last item
          }))
        }
      }, {
        onSuccess: () => {
          setLocation("/");
        }
      });
    }
  };

  const currentDim = DIMENSIONS[currentStep];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[80px]" />
      </div>

      <div className="z-10 w-full max-w-2xl p-8">
        <div className="text-center mb-12">
          <Hexagon className="w-12 h-12 text-primary mx-auto mb-6" strokeWidth={1} />
          <h1 className="font-serif text-3xl text-foreground uppercase tracking-widest mb-2">Initial Calibration</h1>
          <p className="font-mono text-xs text-primary/70 uppercase tracking-widest">
            Establishing baseline reality vector
          </p>
        </div>

        <div className="sacred-border bg-card/80 backdrop-blur-md p-8 clip-corners">
          <div className="flex justify-between items-center mb-8">
            <span className="font-mono text-xs text-primary uppercase tracking-widest">
              Axis {currentStep + 1} / {DIMENSIONS.length}
            </span>
            <div className="flex gap-1">
              {DIMENSIONS.map((_, i) => (
                <div key={i} className={`h-1 w-6 ${i <= currentStep ? 'bg-primary' : 'bg-primary/20'}`} />
              ))}
            </div>
          </div>

          <div className="text-center my-12">
            <h2 className="font-serif text-4xl text-primary mb-4 tracking-wider">{currentDim}</h2>
            <p className="font-mono text-sm text-muted-foreground uppercase tracking-widest max-w-md mx-auto">
              Assess your current resonance frequency in the {currentDim.toLowerCase()} domain.
            </p>
          </div>

          <div className="grid grid-cols-10 gap-2 mt-12">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
              <button
                key={val}
                onClick={() => handleScore(val)}
                className="h-16 border border-primary/30 hover:bg-primary hover:text-background text-primary font-mono text-lg transition-all duration-300 clip-corners flex items-center justify-center bg-primary/5"
              >
                {val}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-4 font-mono text-[10px] text-muted-foreground uppercase">
            <span>Dissonant</span>
            <span>Coherent</span>
          </div>
        </div>

        {submitMutation.isPending && (
          <div className="mt-8 flex items-center justify-center text-primary font-mono text-xs uppercase animate-pulse">
            <Activity className="w-4 h-4 mr-2" />
            Processing dimensional data...
          </div>
        )}
      </div>
    </div>
  );
}
