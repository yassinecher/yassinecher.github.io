import { Sparkles } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Avatar } from "../components/Avatar";
import { CHAIR_PULL, Room, roomInteractive } from "./Room";

// Camera stops, one per page section, in the room's coordinates. The page scroll position is a
// float (2.4 = 40% of the way from section 2 to section 3) and the camera glides between stops.
// `shift` moves the room sideways on screen (film offset) so text has room on the left.
const DESKTOP_STOPS = [
  { pos: [-26, 22.5, 26], target: [0, 3.2, 0], shift: -7 }, // intro: the whole room
  { pos: [-15, 12, 14], target: [-1.6, 3.2, -2.6], shift: -7.5 }, // about: shelves and desk
  { pos: [-12, 11, 15], target: [1, 2.6, -2.2], shift: -7.5 }, // experience: the desk from the side
  { pos: [-7.2, 5.6, 2.6], target: [0.1, 3.3, -4.2], shift: -6.5 }, // work: close on the monitor, past his shoulder
  { pos: [-9.5, 7.8, 6], target: [0.4, 3.1, -3.0], shift: -6.5 }, // contact: evening, by the desk
];

// Portrait screens: the room sits in the upper part, text below it.
const MOBILE_STOPS = [
  { pos: [-40, 31, 40], target: [0.5, -2.2, 0.5], shift: 0 },
  { pos: [-22, 17, 19], target: [-1.5, 0, -2.5], shift: 0 },
  { pos: [-20, 17, 22], target: [1, 0, -2], shift: 0 },
  { pos: [-8.5, 7.5, 5], target: [0.1, 2, -4.2], shift: 0 },
  { pos: [-11, 9, 7.5], target: [0.4, 1.6, -3], shift: 0 },
];

const smooth = (t) => t * t * (3 - 2 * t);

const CameraRig = ({ progressRef, pointerRef }) => {
  const three = useThree();
  const { camera, size } = three;
  if (import.meta.env.DEV) window.__three = three;
  const tmp = useMemo(
    () => ({ pos: new THREE.Vector3(), target: new THREE.Vector3(), a: new THREE.Vector3(), b: new THREE.Vector3(), look: new THREE.Vector3() }),
    []
  );
  const current = useMemo(() => ({ pos: null, target: new THREE.Vector3(0, 2, 0), shift: 0 }), []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const stops = size.width / size.height < 0.9 ? MOBILE_STOPS : DESKTOP_STOPS;
    const p = THREE.MathUtils.clamp(progressRef.current, 0, stops.length - 1);
    const i = Math.min(Math.floor(p), stops.length - 2);
    const t = smooth(p - i);
    const A = stops[i];
    const B = stops[i + 1];

    tmp.pos.lerpVectors(tmp.a.fromArray(A.pos), tmp.b.fromArray(B.pos), t);
    tmp.target.lerpVectors(tmp.a.fromArray(A.target), tmp.b.fromArray(B.target), t);
    const shift = THREE.MathUtils.lerp(A.shift, B.shift, t);

    // A little parallax with the pointer, so the room feels alive
    tmp.pos.x += pointerRef.current.x * 0.6;
    tmp.pos.y += pointerRef.current.y * 0.4;

    // First frames: start far away and slowly dolly in to the first stop
    if (!current.pos) {
      current.pos = tmp.pos.clone().sub(tmp.target).multiplyScalar(1.9).add(tmp.target);
      current.pos.y += 6;
      current.age = 0;
    }
    current.age += dt;
    const lambda = current.age < 3.5 ? 1.2 : 3;
    current.pos.x = THREE.MathUtils.damp(current.pos.x, tmp.pos.x, lambda, dt);
    current.pos.y = THREE.MathUtils.damp(current.pos.y, tmp.pos.y, lambda, dt);
    current.pos.z = THREE.MathUtils.damp(current.pos.z, tmp.pos.z, lambda, dt);
    current.target.x = THREE.MathUtils.damp(current.target.x, tmp.target.x, 3, dt);
    current.target.y = THREE.MathUtils.damp(current.target.y, tmp.target.y, 3, dt);
    current.target.z = THREE.MathUtils.damp(current.target.z, tmp.target.z, 3, dt);
    current.shift = THREE.MathUtils.damp(current.shift, shift, 3, dt);

    camera.position.copy(current.pos);
    camera.lookAt(current.target);
    if (Math.abs(camera.filmOffset - current.shift) > 0.001) {
      camera.filmOffset = current.shift;
      camera.updateProjectionMatrix();
    }
  });
  return null;
};

// The avatar, seated in the desk chair with its hands on the keyboard. Values are in room units.
// The avatar component carries a 0.44 scale from the original scene; undo it here.
export const SEAT = {
  position: [0.71 + CHAIR_PULL[0], 1.34, -1.89 + CHAIR_PULL[1]],
  // Swivelled ~11° toward the keyboard (centred at x 0.1, z -3.6 on the desk)
  rotationY: Math.PI + 0.19,
  scale: 1.05 / 0.44,
  // Measured against the desk (top y 1.9), seat (y 1.6) and keyboard (x -0.3..0.5, z -3.75..-3.45):
  // lean in, lower the arms onto the keys, thighs under the desk, feet flat on the floor.
  pose: {
    Spine: [0.15, 0, 0],
    Spine1: [0.15, 0, 0],
    Spine2: [0.15, 0, 0],
    LeftArm: [0.2, 0, 0],
    RightArm: [0.2, 0, 0],
    LeftForeArm: [0.2, 0, 0],
    RightForeArm: [0.2, 0, 0],
    LeftUpLeg: [-0.33, 0, 0],
    RightUpLeg: [-0.33, 0, 0],
    LeftLeg: [0.42, 0, 0],
    RightLeg: [0.42, 0, 0],
    // Flatten the feet: soles on the floor (toe joints ~0.06 above it), not toes dug in
    LeftFoot: [0.08, 0, 0],
    RightFoot: [0.08, 0, 0],
  },
  // 70% of a calm frame of the typing clip (t = 4 s), 30% of the live clip: hands stay on the keys
  calm: { weight: 0.7, time: 4, speed: 1 },
};

// The room is baked, so only the avatar needs real lights. Daytime: soft sky and warm floor
// bounce plus window light. Evening: dim fill, the cool monitor in front of him and the desk lamp.
const AvatarLights = ({ nightRef }) => {
  const hemi = useRef();
  const sun = useRef();
  const screen = useRef();
  const lamp = useRef();
  const n = useRef(0);
  useFrame((_, delta) => {
    n.current = THREE.MathUtils.damp(n.current, nightRef.current, 2.5, Math.min(delta, 0.1));
    const k = n.current;
    hemi.current.intensity = THREE.MathUtils.lerp(1.15, 0.3, k);
    sun.current.intensity = THREE.MathUtils.lerp(1.1, 0.05, k);
    screen.current.intensity = THREE.MathUtils.lerp(0, 1.6, k);
    lamp.current.intensity = THREE.MathUtils.lerp(0, 0.9, k);
  });
  return (
    <>
      <hemisphereLight ref={hemi} args={["#fff4e6", "#9a6a4a", 1.15]} />
      <directionalLight ref={sun} color="#ffe9d2" position={[6, 9, -5]} intensity={1.1} />
      <pointLight ref={screen} color="#8fb8ff" position={[0.2, 3.3, -3.9]} intensity={0} distance={5} decay={2} />
      <pointLight ref={lamp} color="#ff9a52" position={[-1.6, 3.6, -4]} intensity={0} distance={6} decay={2} />
    </>
  );
};

export const Scene = ({ progressRef, nightRef, screenRef, pointerRef, onAction }) => (
  <>
    <AvatarLights nightRef={nightRef} />
    <CameraRig progressRef={progressRef} pointerRef={pointerRef} />
    <Room nightRef={nightRef} screenRef={screenRef} onAction={onAction} />
    <Dust nightRef={nightRef} />
    <group
      position={SEAT.position}
      rotation-y={SEAT.rotationY}
      scale={SEAT.scale}
      {...roomInteractive("That's me · say hello", "contact", onAction)}
    >
      <Avatar animation="Typing" wireframe={false} pose={SEAT.pose} calm={SEAT.calm} />
    </group>
  </>
);

// Keeps a DOM element (the handwritten note) pinned to the avatar's head on screen, intro only.
export const AvatarTracker = ({ targetId, visibleRef }) => {
  const { scene, camera, size } = useThree();
  const head = useRef(null);
  const element = useRef(null);
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    element.current ??= document.getElementById(targetId);
    head.current ??= scene.getObjectByName("Head");
    if (!element.current || !head.current) return;
    head.current.getWorldPosition(v).project(camera);
    const x = (v.x * 0.5 + 0.5) * size.width;
    const y = (-v.y * 0.5 + 0.5) * size.height;
    element.current.style.transform = `translate(${x}px, ${y}px)`;
    element.current.style.opacity = visibleRef.current < 0.35 ? "1" : "0";
  });
  return null;
};

// Dust drifting in the window light; it fades out when the lights go down.
const Dust = ({ nightRef }) => {
  const ref = useRef();
  const level = useRef(0.7);
  useFrame((_, delta) => {
    const attribute = ref.current?.geometry?.attributes?.opacity;
    if (!attribute) return;
    const next = THREE.MathUtils.damp(level.current, (1 - nightRef.current) * 0.7, 2, Math.min(delta, 0.1));
    if (Math.abs(next - level.current) < 0.001) return;
    level.current = next;
    attribute.array.fill(next);
    attribute.needsUpdate = true;
  });
  return <Sparkles ref={ref} count={70} scale={[7, 4.5, 7]} position={[0.5, 3.2, -1]} size={2.4} speed={0.18} noise={0.6} color="#fff1cf" opacity={0.7} />;
};
