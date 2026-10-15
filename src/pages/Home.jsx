import { Scroll, ScrollControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { MotionConfig } from "framer-motion";
import { useAtom, useAtomValue } from "jotai";
import { Leva } from "leva";
import { Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Backdrop } from "../components/Backdrop";
import { Experience } from "../components/Experience";
import { Interface } from "../components/Interface";
import { LoadingScreen } from "../components/LoadingScreen";
import { Menu } from "../components/Menu";
import { ScrollManager } from "../components/ScrollManager";
import { SECTIONS, framerMotionConfig } from "../config";
import { activeSectionAtom, homeSectionAtom } from "../state";

export const Home = () => {
  const [nav, setNav] = useAtom(homeSectionAtom);
  const section = nav.index;
  const setSection = (index) => setNav({ index, at: Date.now() });
  const navigate = useNavigate();
  // The 3D scene and the scrolled HTML render outside this tree's router context, so they get
  // navigation through props.
  const openProject = (slug) => {
    // Come back to the projects section when returning from the case study.
    setNav({ index: 3, at: Date.now() });
    navigate(`/projects/${slug}`);
  };
  const activeSection = useAtomValue(activeSectionAtom);
  const [started, setStarted] = useState(false);
  const [menuOpened, setMenuOpened] = useState(false);

  useEffect(() => {
    setMenuOpened(false);
  }, [nav]);

  return (
    <>
      <Backdrop section={activeSection} />
      <LoadingScreen started={started} setStarted={setStarted} />
      <MotionConfig
        transition={{
          ...framerMotionConfig,
        }}
      >
        {/* Transparent canvas: the animated backdrop shows through */}
        <Canvas shadows camera={{ position: [0, 3, 10], fov: 42 }} gl={{ alpha: true }}>
          <ScrollControls pages={SECTIONS.length} damping={0.2}>
            <ScrollManager section={section} request={nav.at} onSectionChange={setSection} />
            <Scroll>
              <Suspense>
                {started && (
                  <Experience
                    section={section}
                    menuOpened={menuOpened}
                    onOpenProject={openProject}
                  />
                )}
              </Suspense>
            </Scroll>
            <Scroll html>
              {started && (
                <Interface
                  setSection={setSection}
                  openProject={openProject}
                  navigate={navigate}
                />
              )}
            </Scroll>
          </ScrollControls>
        </Canvas>
        <Menu
          onSectionChange={setSection}
          navigate={navigate}
          menuOpened={menuOpened}
          setMenuOpened={setMenuOpened}
        />
      </MotionConfig>
      <Leva hidden />
    </>
  );
};
