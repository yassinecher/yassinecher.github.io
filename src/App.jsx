import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ThemeSync } from "./lib/theme";
import { ProjectDetail } from "./pages/ProjectDetail";
import { ProjectsIndex } from "./pages/ProjectsIndex";

// The 3D home pulls in three.js; load it on its own so case-study links (from the CV, LinkedIn)
// open without downloading the whole 3D engine.
const Home = lazy(() => import("./pages/Home").then((m) => ({ default: m.Home })));

function App() {
  return (
    <>
      <ThemeSync />
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={<div className="min-h-screen bg-paper" />}>
              <Home />
            </Suspense>
          }
        />
        <Route path="/projects" element={<ProjectsIndex />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
