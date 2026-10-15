import { Navigate, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { ProjectDetail } from "./pages/ProjectDetail";
import { ProjectsIndex } from "./pages/ProjectsIndex";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<ProjectsIndex />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
