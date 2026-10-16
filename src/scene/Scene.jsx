import { Sparkles } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Avatar } from "../components/Avatar";
import { roomFx } from "../components/RoomFx";
import { CHAIR_PIVOT, Room, roomInteractive } from "./Room";

// Camera stops, one per page section, in the room's coordinates. The page scroll position is a
// float (2.4 = 40% of the way from section 2 to section 3) and the camera glides between stops.
// `shift` moves the room sideways on screen (film offset) so text has room on the left.
const DESKTOP_STOPS = [
  { pos: [-26, 22.5, 26], target: [0, 3.2, 0], shift: -7 }, // intro: the whole room
  { pos: [-15, 12, 14], target: [-1.6, 3.2, -2.6], shift: -7.5 }, // about: shelves and desk
  { pos: [-12, 11, 15], target: [1, 2.6, -2.2], shift: -7.5 }, // experience: the desk from the side
  { pos: [-8.4, 6.1, 3.8], target: [1.4, 3.3, -3.4], shift: -6.5 }, // work: the monitor, and him beside it
  { pos: [-9.5, 7.8, 6], target: [1.1, 3.1, -2.7], shift: -6.5 }, // contact: evening, by the desk
];

// Phones: the room has its own panel at the top of the screen (about square), framed centred
const MOBILE_STOPS = [
  { pos: [-30, 25, 30], target: [0.4, 2.2, -0.2], shift: 0 }, // the whole room
  { pos: [-17, 13, 16], target: [-1.6, 2.8, -2.4], shift: 0 }, // shelves and desk
  { pos: [-13, 10.5, 15], target: [0.6, 2.6, -2.4], shift: 0 }, // the desk from the side
  { pos: [-8.6, 6.4, 4.2], target: [0.6, 3.2, -3.6], shift: 0 }, // the monitor and him
  { pos: [-9.8, 7.4, 6.6], target: [0.8, 2.9, -2.6], shift: 0 }, // him, turned to you
];

const smooth = (t) => t * t * (3 - 2 * t);
const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const CameraRig = ({ progressRef, pointerRef, phone }) => {
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
    const stops = phone ? MOBILE_STOPS : DESKTOP_STOPS;
    const p = THREE.MathUtils.clamp(progressRef.current, 0, stops.length - 1);
    const i = Math.min(Math.floor(p), stops.length - 2);
    const t = smooth(p - i);
    const A = stops[i];
    const B = stops[i + 1];

    tmp.pos.lerpVectors(tmp.a.fromArray(A.pos), tmp.b.fromArray(B.pos), t);
    tmp.target.lerpVectors(tmp.a.fromArray(A.target), tmp.b.fromArray(B.target), t);
    const shift = THREE.MathUtils.lerp(A.shift, B.shift, t);

    // A little parallax with the pointer, so the room feels alive
    if (!reducedMotion) {
      // on a phone this is a finger dragged across the room: look around a little more
      tmp.pos.x += pointerRef.current.x * (phone ? 3 : 0.6);
      tmp.pos.y += pointerRef.current.y * 0.4;
    }

    // First frames: start far away and slowly dolly in to the first stop
    if (!current.pos) {
      current.pos = tmp.pos.clone();
      if (!reducedMotion) {
        current.pos.sub(tmp.target).multiplyScalar(1.9).add(tmp.target);
        current.pos.y += 6;
      }
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
// The avatar component carries a 0.44 scale from the original scene; undo it here. He's sized to
// the chair (its back reaches above his shoulders) with his hips on the seat.
const SEAT_WORLD = [0.559, 1.396, -2.143];
export const SEAT = {
  // Relative to the chair's swivel pivot, so the chair and the avatar turn together
  position: SEAT_WORLD.map((v, i) => v - CHAIR_PIVOT[i]),
  // Swivelled ~11° toward the keyboard (centred at x 0.1, z -3.6 on the desk)
  rotationY: Math.PI + 0.19,
  scale: 0.945 / 0.44,
  // Where his wrists rest on the keyboard (room coordinates); reached by IK, so they stay on the
  // keys whatever his size and the swivel of the chair
  hands: { Left: [-0.12, 2.25, -3.22], Right: [0.36, 2.26, -3.3] },
  // Measured against the desk (top y 1.9), seat (y 1.6) and keyboard (x -0.3..0.5, z -3.75..-3.45):
  // a slight lean, fingertips resting on the keys (they only dip in on a key press), head up
  // toward the monitor, thighs under the desk, feet flat on the floor.
  pose: {
    // (the calm frame of the clip leans him ~6 degrees to his left; this sits him up straight)
    Spine: [0.1, 0, 0.12],
    Spine1: [0.1, 0, 0],
    Spine2: [0.1, 0, 0],
    LeftArm: [0.16, 0, 0],
    RightArm: [0.12, 0, 0],
    LeftForeArm: [0.3, 0, 0],
    RightForeArm: [0.3, 0, 0],
    LeftUpLeg: [-0.45, 0, 0],
    RightUpLeg: [-0.45, 0, 0],
    LeftLeg: [0.42, 0, 0],
    RightLeg: [0.42, 0, 0],
    // Eyes on the monitor rather than the keyboard
    Neck: [-0.08, 0, 0],
    Head: [-0.14, 0, 0],
    // Flatten the feet: soles on the floor (toe joints ~0.06 above it), not toes dug in
    LeftFoot: [0.08, 0, 0],
    RightFoot: [0.08, 0, 0],
  },
  // 70% of a calm frame of the typing clip (t = 4 s), 30% of the live clip: hands stay on the keys
  calm: { weight: 0.7, time: 4, speed: 1 },
};

// The room is baked, so only the avatar needs real lights. Daytime: soft sky and warm floor
// bounce plus window light. Evening: the cool monitor in front of him, the warm desk lamp, the
// pink TV behind, and enough fill that he never turns into a silhouette.
const AvatarLights = ({ nightRef, tvRef }) => {
  const hemi = useRef();
  const sun = useRef();
  const screen = useRef();
  const lamp = useRef();
  const tv = useRef();
  const n = useRef(0);
  useFrame((_, delta) => {
    n.current = THREE.MathUtils.damp(n.current, nightRef.current, 2.5, Math.min(delta, 0.1));
    const k = n.current;
    hemi.current.intensity = THREE.MathUtils.lerp(1.15, 0.55, k);
    hemi.current.color.lerpColors(DAY_SKY, NIGHT_SKY, k);
    sun.current.intensity = THREE.MathUtils.lerp(1.1, 0.05, k);
    screen.current.intensity = THREE.MathUtils.lerp(0, 3.2, k);
    lamp.current.intensity = THREE.MathUtils.lerp(0, 1.8, k);
    tv.current.intensity = THREE.MathUtils.lerp(0, 1.4, k) * (tvRef.current.level ?? 1);
  });
  return (
    <>
      <hemisphereLight ref={hemi} args={["#fff4e6", "#9a6a4a", 1.15]} />
      <directionalLight ref={sun} color="#ffe9d2" position={[6, 9, -5]} intensity={1.1} />
      <pointLight ref={screen} color="#9cc2ff" position={[0.3, 3.4, -3.7]} intensity={0} distance={6} decay={1.5} />
      <pointLight ref={lamp} color="#ffa25c" position={[-1.4, 3.8, -3.2]} intensity={0} distance={7} decay={1.5} />
      <pointLight ref={tv} color="#ff5c8a" position={[3.6, 3, 0.5]} intensity={0} distance={8} decay={1.5} />
    </>
  );
};
const DAY_SKY = new THREE.Color("#fff4e6");
const NIGHT_SKY = new THREE.Color("#b7b0d6");

// Eases the avatar's attention (while `hold`, or until `until`) and moods (one weight each, see
// moodRef in Home), and turns the chair toward the camera when he pays attention.
//
// Like a person, he doesn't turn as one block: eyes and head lead, the chest follows, the chair
// comes round last, and the hands leave the keys once he's looking. Going back, the head returns to
// the screen first and the hands find the keys a beat later. Each part is a critically damped
// spring (ease in and out), not an exponential snap.
const MOODS = ["excited", "interested", "love", "upset", "annoyed", "startled", "reading", "greeting"];
const PARTS = {
  // seconds to settle: [turning to you, going back]; a poke makes him spin round fast
  head: [0.3, 0.32],
  body: [0.55, 0.6],
  chair: [0.75, 0.8],
  hands: [0.6, 0.9],
};
const smoothDamp = (state, key, target, smoothTime, dt) => {
  const omega = 2 / smoothTime;
  const x = omega * dt;
  const decay = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const velocity = state[`${key}V`] ?? 0;
  const change = (state[key] ?? 0) - target;
  const temp = (velocity + omega * change) * dt;
  state[`${key}V`] = (velocity - omega * temp) * decay;
  state[key] = target + (change + temp) * decay;
};
const SeatRig = ({ swivelRef, attentionRef, moodRef, colliderRef, coffeeRef }) => {
  const { camera, scene } = useThree();
  const bones = useRef(null);
  const v = useMemo(() => [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()], []);
  useFrame((_, delta) => {
    // The pointer box: from his hips to the top of his head, shoulders wide
    bones.current ??= ["Hips", "HeadTop_End", "LeftArm", "RightArm"].map((name) => scene.getObjectByName(name));
    const [hips, top, left, right] = bones.current;
    const box = colliderRef.current;
    if (hips && top && box?.parent) {
      const [a, b, c, d] = v;
      hips.getWorldPosition(a);
      top.getWorldPosition(b);
      const height = a.distanceTo(b) * 1.1;
      const width = left.getWorldPosition(c).distanceTo(right.getWorldPosition(d)) * 1.6;
      box.position.copy(box.parent.worldToLocal(a.add(b).multiplyScalar(0.5)));
      box.scale.set(width, height, width * 0.8);
    }

    const dt = Math.min(delta, 0.1);
    const now = performance.now();
    const a = attentionRef.current;
    const mood = moodRef.current;
    const current = now < mood.until ? mood.name : null;
    // Reading your message on his monitor wins over looking at you
    // (mid-sip he puts the mug down before turning round: see the coffee in Avatar)
    const busy = current !== "reading" && !coffeeRef?.current?.active && (a.hold || now < a.until);
    const startled = current === "startled";
    for (const [part, [toYou, back]] of Object.entries(PARTS)) {
      smoothDamp(a, part, busy ? 1 : 0, busy ? (startled ? toYou * 0.4 : toYou) : back, dt);
      a[part] = THREE.MathUtils.clamp(a[part], 0, 1);
    }
    a.value = a.body;
    for (const name of MOODS) {
      const speed = name === "startled" && name === current ? 9 : 3.2;
      mood.weights[name] = THREE.MathUtils.damp(mood.weights[name] ?? 0, name === current ? 1 : 0, speed, dt);
    }

    const pivot = swivelRef.current.position;
    const toCamera = Math.atan2(camera.position.x - pivot.x, camera.position.z - pivot.z);
    let phi = toCamera - SEAT.rotationY;
    phi = Math.atan2(Math.sin(phi), Math.cos(phi)); // shortest way round
    swivelRef.current.rotation.y = THREE.MathUtils.clamp(phi * 0.65, -1.2, 1.2) * a.chair;
  });
  return null;
};

export const Scene = ({ progressRef, nightRef, screenRef, pointerRef, attentionRef, moodRef, coffeeRef, onAction, onAvatarHover, phone }) => {
  const swivelRef = useRef();
  const colliderRef = useRef();
  // Whether the TV is on, and its glow (Room switches it; the avatar's lights follow)
  const tvRef = useRef({ on: true, level: 1 });
  // At work he's busy (hovering gets a side-eye, a click a "one moment"); turned to you in
  // contact, he's all yours
  const hover = roomInteractive(() => (attentionRef.current.hold ? "That's me · say hi" : "That's me · busy coding"), "poke", onAction);
  return (
    <>
      <AvatarLights nightRef={nightRef} tvRef={tvRef} />
      <CameraRig progressRef={progressRef} pointerRef={pointerRef} phone={phone} />
      <Room nightRef={nightRef} screenRef={screenRef} onAction={onAction} swivelRef={swivelRef} tvRef={tvRef} coffeeRef={coffeeRef}>
        <group
          position={SEAT.position}
          rotation-y={SEAT.rotationY}
          scale={SEAT.scale}
        >
          <Avatar
            animation="Typing"
            wireframe={false}
            pose={SEAT.pose}
            calm={SEAT.calm}
            hands={SEAT.hands}
            attentionRef={attentionRef}
            moodRef={moodRef}
            coffeeRef={coffeeRef}
          />
        </group>
        {/* What the pointer actually hits: a box around his torso and head that follows him
            (raycasting the skinned body on every pointer move is slow, and misses his pose) */}
        <mesh
          ref={colliderRef}
          visible={false}
          rotation-y={SEAT.rotationY}
          {...hover}
          onPointerOver={(e) => {
            hover.onPointerOver(e);
            onAvatarHover?.();
          }}
          onPointerMove={() => onAvatarHover?.()}
          onClick={(e) => {
            // a little puff of dust where he was tapped
            roomFx("dust", e.nativeEvent.clientX, e.nativeEvent.clientY);
            hover.onClick(e);
          }}
        >
          <boxGeometry />
        </mesh>
      </Room>
      <SeatRig swivelRef={swivelRef} attentionRef={attentionRef} moodRef={moodRef} colliderRef={colliderRef} coffeeRef={coffeeRef} />
      <Dust nightRef={nightRef} />
    </>
  );
};

// Keeps DOM elements pinned to the avatar's head on screen: the handwritten note (intro only)
// and the little drawings for his moods.
export const AvatarTracker = ({ noteId, moodId, visibleRef }) => {
  const { scene, camera, size } = useThree();
  const head = useRef(null);
  const elements = useRef(null);
  const v = useMemo(() => new THREE.Vector3(), []);
  // Only touch the page when something changed: every style write invalidates layout, and the
  // scroll handlers would then pay for it
  const last = useRef({});
  const write = (element, key, value, apply) => {
    if (last.current[key] === value) return;
    last.current[key] = value;
    apply(element, value);
  };
  useFrame(() => {
    elements.current ??= { note: document.getElementById(noteId), mood: document.getElementById(moodId) };
    head.current ??= scene.getObjectByName("Head");
    if (!head.current) return;
    head.current.getWorldPosition(v).project(camera);
    const x = Math.round((v.x * 0.5 + 0.5) * size.width + (size.left ?? 0));
    const y = Math.round((-v.y * 0.5 + 0.5) * size.height + (size.top ?? 0));
    const { note, mood } = elements.current;
    if (note) {
      const shown = visibleRef.current < 0.35;
      write(note, "noteOpacity", shown ? "1" : "0", (el, value) => (el.style.opacity = value));
      if (shown) write(note, "note", `translate(${x}px, ${y}px)`, (el, value) => (el.style.transform = value));
    }
    if (mood && mood.firstChild) {
      // Kept on screen even when his head is at the edge of the frame, and near the right edge
      // the drawings go on the other side of his head
      const mx = THREE.MathUtils.clamp(x, 90, (size.left ?? 0) + size.width - 90);
      write(mood, "mood", `translate(${mx}px, ${y}px)`, (el, value) => (el.style.transform = value));
      write(mood, "side", x > (size.left ?? 0) + size.width - 240 ? "left" : "right", (el, value) => (el.dataset.side = value));
    }
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

// Render at full rate while the visitor is doing something (scrolling, moving the pointer, the
// intro), and at 30 fps when the page just sits there: the room still lives, at half the work.
// Used with <Canvas frameloop="demand">.
export const FrameDriver = ({ activityRef }) => {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    let frame;
    let last = 0;
    const loop = (time) => {
      const busy = performance.now() - activityRef.current < 1500;
      if (busy || time - last >= 1000 / 30 - 2) {
        invalidate();
        last = time;
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [invalidate, activityRef]);
  return null;
};
