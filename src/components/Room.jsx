import React, { useEffect } from "react";
import { useGLTF, useTexture, useVideoTexture } from "@react-three/drei"; // Added import
import { useFrame } from "@react-three/fiber";
import { animate, useMotionValue } from "framer-motion";
import * as THREE from "three";
import { asset } from "../lib/asset";

export function Room(props) {

  const { nodes } = useGLTF(asset("models/Room.gltf"));
  
  const texture = useTexture(asset("textures/bakedNight.jpg"));
  const textureVSCode = useVideoTexture(asset("textures/vscode.mp4"));
  
  texture.flipY = false;
  texture.encoding = THREE.sRGBEncoding;

  const textureMaterial = new THREE.MeshStandardMaterial({
map:texture,
    transparent: true,
    opacity: 1,
  });

  const textureGlassMaterial = new THREE.MeshStandardMaterial({
 
    transparent: true,
    opacity: 0.42,
    color:texture
  });

 

  return ( 
    <group    scale={0.44} {...props}>
<group  position={[2.2, -0.646, -0.53]} rotation={[0,-130, 0]} >
<group name="Empty012" position={[0.812, 1.305, -1.533]} rotation={[0, -1.455, 0]}>
        <mesh name="Cube318" geometry={nodes.Cube318.geometry} material={textureMaterial} position={[-0.68, 0.119, 0]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]} />
      </group>
      <mesh name="Cube320" geometry={nodes.Cube320.geometry} material={textureMaterial} position={[4.867, 3.146, -0.53]} rotation={[0, Math.PI / 2, 0]} >
      <meshBasicMaterial map={textureVSCode} toneMapped={false} />
      </mesh>
    
    </group>
   

  
</group>

  );
}

useGLTF.preload(asset("models/Room.gltf"));
