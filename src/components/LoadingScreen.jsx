import { useProgress } from "@react-three/drei";
import { useEffect } from "react";

export const LoadingScreen = (props) => {
  const { started, setStarted } = props;
  const { progress, total, loaded, item } = useProgress();

  useEffect(() => {
    if (progress === 100) {
      setTimeout(() => {
        setStarted(true);
      }, 500);
    }
  }, [progress, total, loaded, item]);

  return (
    <div
      className={`fixed top-0 left-0 w-full h-full z-50 transition-opacity duration-1000 pointer-events-none
  flex flex-col items-center justify-center gap-6 bg-paper 
  ${started ? "opacity-0" : "opacity-100"}`}
    >
      <div className="font-display text-5xl md:text-9xl font-bold text-ink relative tracking-tight">
        <div
          className="absolute left-0 top-0 overflow-hidden truncate text-clip transition-all duration-500 bg-linear-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent"
          style={{
            width: `${progress}%`,
          }}
        >
          Yassine Cherni
        </div>
        <div className="opacity-15">Yassine Cherni</div>
      </div>
      <p className="font-mono text-sm text-muted">Loading the studio · {Math.round(progress)}%</p>
    </div>
  );
};
