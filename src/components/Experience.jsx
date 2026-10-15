import { useScroll } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { animate, useMotionValue } from "framer-motion";
import { motion } from "framer-motion-3d";
import { useSetAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { SECTIONS, framerMotionConfig } from "../config";
import { activeSectionAtom } from "../state";
import { Avatar } from "./Avatar";
import { DeskSetup } from "./DeskSetup";
import { Projects } from "./Projects";
import { Room as Office } from "./Room";

const LAST_SECTION = SECTIONS.length - 1;

export const Experience = (props) => {
  const { menuOpened, onOpenProject } = props;
  const { viewport } = useThree();
  const data = useScroll();

  const isMobile = window.innerWidth < 768;
  const responsiveRatio = viewport.width / 12;
  const officeScaleRatio = Math.max(0.5, Math.min(0.9 * responsiveRatio, 0.82));

  const [section, setSection] = useState(0);
  const setActiveSection = useSetAtom(activeSectionAtom);
  useEffect(() => setActiveSection(section), [section]);
  const progressBar = useRef(null);

  // Start from real numbers: the first frames can render before the animations below begin.
  const cameraPositionX = useMotionValue(1);
  const cameraLookAtX = useMotionValue(0);

  useEffect(() => {
    animate(cameraPositionX, menuOpened ? -2 : section === 0 ? 1 : 0, {
      ...framerMotionConfig,
    });
    animate(cameraLookAtX, menuOpened ? 5 : 0, {
      ...framerMotionConfig,
    });
  }, [menuOpened, section]);

  const characterContainerAboutRef = useRef();

  const [characterAnimation, setCharacterAnimation] = useState("Typing");
  useEffect(() => {
    setCharacterAnimation("Falling");
    const timeout = setTimeout(() => {
      setCharacterAnimation(section === 0 ? "Typing" : "Standing");
    }, 600);
    return () => clearTimeout(timeout);
  }, [section]);

  const characterGroup = useRef();

  useFrame((state) => {
    const curSection = Math.min(
      Math.floor(data.scroll.current * data.pages),
      LAST_SECTION
    );

    if (curSection !== section) {
      setSection(curSection);
    }

    // Scroll progress bar in the header (plain DOM write: no React render per frame)
    progressBar.current ??= document.getElementById("scroll-progress");
    if (progressBar.current) progressBar.current.style.transform = `scaleX(${data.offset})`;

    state.camera.position.x = cameraPositionX.get();
    state.camera.lookAt(cameraLookAtX.get(), 0, 0);

    if (section === 0) {
      characterContainerAboutRef.current.getWorldPosition(
        characterGroup.current.position
      );
    }
  });

  return (
    <>
      <motion.group
        ref={characterGroup}
        rotation={[-3.141592653589793, 1.2053981633974482, 3.141592653589793]}
        scale={[officeScaleRatio, officeScaleRatio, officeScaleRatio]}
        animate={"" + section}
        transition={{
          duration: 0.6,
        }}
        variants={{
          // About: seated at the desk
          0: {
            rotateY: 30.33,
            scaleX: officeScaleRatio,
            scaleY: officeScaleRatio,
            scaleZ: officeScaleRatio,
          },
          // Stack: standing to the right of the skill cards
          1: {
            y: -viewport.height + 0.5,
            x: isMobile ? 0.3 : 3.2,
            z: 3,
            rotateX: 0,
            rotateY: isMobile ? -Math.PI / 2 : -Math.PI / 6,
            rotateZ: 0,
            scaleX: 1,
            scaleY: 1,
            scaleZ: 1,
          },
          // Experience: on the right, turned toward the timeline
          2: {
            y: -viewport.height * 2 + 0.5,
            x: isMobile ? 2.2 : 3.9,
            z: isMobile ? -2 : 2,
            rotateX: 0,
            rotateY: -Math.PI / 3,
            rotateZ: 0,
            scaleX: 1,
            scaleY: 1,
            scaleZ: 1,
          },
          // Projects: right of the carousel, looking at it
          3: {
            x: isMobile ? 1.6 : 3.6,
            y: -viewport.height * 3 + 0.5,
            z: isMobile ? -5 : 0,
            rotateX: 0,
            rotateY: -Math.PI / 2,
            rotateZ: 0,
            scaleX: 1,
            scaleY: 1,
            scaleZ: 1,
          },
          // Contact: to the right of the form
          4: {
            y: -viewport.height * 4 + 1,
            x: isMobile ? 2.6 : 2.3,
            z: isMobile ? -2 : 4.5,
            rotateX: 0,
            rotateY: -Math.PI / 4,
            rotateZ: 0,
            scaleX: 1,
            scaleY: 1,
            scaleZ: 1,
          },
        }}
      >
        <Avatar animation={characterAnimation} wireframe={false} typingLean={0.25} />
      </motion.group>
      <ambientLight intensity={1} />
      <motion.group
        position={[
          isMobile ? 1 : 1.95 * officeScaleRatio,
          isMobile ? -viewport.height / 6 : 2,
          3,
        ]}
        scale={[officeScaleRatio, officeScaleRatio, officeScaleRatio]}
        rotation-y={-Math.PI / 4}
        animate={{
          y: isMobile ? -viewport.height / 6 : 0,
        }}
        transition={{
          duration: 0.8,
        }}
      >
        <Office section={section} />
        <DeskSetup />
        <group
          ref={characterContainerAboutRef}
          name="CharacterSpot"
          // Centred on the chair seat, close enough for the hands to reach the keyboard
          position={[0.088, 0.16, -0.254]}
          rotation={[-Math.PI, 0.42, -Math.PI]}
        ></group>
      </motion.group>
      <directionalLight position={[-5, 3, 5]} intensity={0.4} />
      <Projects onOpen={onOpenProject} />
    </>
  );
};
