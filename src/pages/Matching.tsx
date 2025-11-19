import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const Matching = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const data = sessionStorage.getItem("surveyData");
    if (!data) {
      navigate("/");
      return;
    }

    // Simulate matching process (slower to show message)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => navigate("/results"), 500);
          return 100;
        }
        return prev + 1;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-12">
          <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Finding Your Perfect Matches
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Finding matches based on your product market fit and the data we collected from retail stores
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-secondary rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-4">{progress}% complete</p>
        </div>

        {/* Status Messages */}
        <div className="space-y-3 text-left max-w-md mx-auto">
          <StatusItem
            text="Analyzing store demographics"
            active={progress > 20}
            completed={progress > 40}
          />
          <StatusItem
            text="Matching product categories"
            active={progress > 40}
            completed={progress > 60}
          />
          <StatusItem
            text="Evaluating store niches"
            active={progress > 60}
            completed={progress > 80}
          />
          <StatusItem
            text="Calculating match scores"
            active={progress > 80}
            completed={progress >= 100}
          />
        </div>
      </div>
    </div>
  );
};

const StatusItem = ({
  text,
  active,
  completed,
}: {
  text: string;
  active: boolean;
  completed: boolean;
}) => (
  <div
    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
      active ? "bg-secondary" : "opacity-40"
    }`}
  >
    <div
      className={`w-2 h-2 rounded-full transition-all ${
        completed ? "bg-success scale-125" : active ? "bg-primary animate-pulse" : "bg-border"
      }`}
    />
    <span className={`text-sm ${active ? "text-foreground" : "text-muted-foreground"}`}>
      {text}
    </span>
  </div>
);

export default Matching;
