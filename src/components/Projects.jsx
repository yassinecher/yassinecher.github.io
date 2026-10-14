import { Image, Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { animate, useMotionValue } from "framer-motion";

import { motion } from "framer-motion-3d";
import { atom, useAtom } from "jotai";
import { useEffect, useRef } from "react";
import { projects as allProjects } from "../data/projects";
import { asset } from "../lib/asset";

export const projects = allProjects.filter((p) => p.featured);

export const currentProjectAtom = atom(0);

const Project = (props) => {
  const { project, highlighted, onOpen } = props;

  const background = useRef();
  const bgOpacity = useMotionValue(0.4);

  useEffect(() => {
    animate(bgOpacity, highlighted ? 0.7 : 0.4);
  }, [highlighted]);

  useFrame(() => {
    background.current.material.opacity = bgOpacity.get();
  });

  const open = (e) => {
    e.stopPropagation();
    if (highlighted) onOpen(project.slug);
  };

  return (
    <group position-y={-1.8} scale={0.85} {...props}>
      <mesh position-z={-0.002} ref={background} onClick={open}>
        <planeGeometry args={[6.2, 7.6]} />
        <meshBasicMaterial color="black" transparent opacity={0.4} />
      </mesh>
      <Image
        scale={[6.2, 6, 0.001]}
        url={asset(project.cover)}
        toneMapped={false}
        position-y={1}
        onClick={open}
      />
      <Text
        maxWidth={5.6}
        anchorX="left"
        anchorY="top"
        fontSize={0.34}
        position={[-2.8, -2.2, 0]}
      >
        {project.title.toUpperCase()}
      </Text>
      <Text
        maxWidth={5.6}
        anchorX="left"
        anchorY="top"
        fontSize={0.2}
        color="#a1a1aa"
        position={[-2.8, -2.65, 0]}
      >
        {project.stack.slice(0, 4).join("  ·  ")}
      </Text>
      <mesh position={[-1.75, -3.25, 0]} onClick={open}>
        <planeGeometry args={[2.1, 0.4]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>
      <Text
        position={[-1.75, -3.25, 0.001]}
        fontSize={0.19}
        anchorX="center"
        anchorY="middle"
        color="black"
        onClick={open}
      >
        VIEW CASE STUDY
      </Text>
    </group>
  );
};

// `onOpen` comes from the page: this renders inside the Canvas, outside the router's context.
export const Projects = ({ onOpen }) => {
  const { viewport } = useThree();
  const [currentProject] = useAtom(currentProjectAtom);

  return (
    <group position-y={-viewport.height * 3 + 1}>
      {projects.map((project, index) => (
        <motion.group
          key={"project_" + index}
          position={[index * 2.5, 0, -3]}
          animate={{
            x: 0 + (index - currentProject) * 8.5,
            y: currentProject === index ? 0 : -0.1,
            z: currentProject === index ? -2 : -3,
            rotateX: currentProject === index ? 0 : -Math.PI / 3,
            rotateZ: currentProject === index ? 0 : -0.1 * Math.PI,
          }}
        >
          <Project
            project={project}
            highlighted={index === currentProject}
            onOpen={onOpen}
          />
        </motion.group>
      ))}
    </group>
  );
};
