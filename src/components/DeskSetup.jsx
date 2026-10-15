import { useMemo } from "react";
import { CodeScreen } from "./CodeScreen";

// The workstation the avatar types at, in the room group's coordinates.
// The desk runs along the wall: `along` is the direction of the wall, `toRoom` points away from it.
// Positions were measured against the baked room (desk top y = 0.565) and the avatar's typing pose.
const DESK_Y = 0.565;
const along = [0.37, 0.93];
const toRoom = [0.93, -0.37];
const deskPoint = (off, u) => [off * toRoom[0] + u * along[0], DESK_Y, off * toRoom[1] + u * along[1]];
// Rotation that lines an object's local x axis up with the desk edge.
const ALONG_DESK = -1.19;

const KEY_ROWS = 5;
const KEY_COLS = 14;

const Keyboard = () => {
  const keys = useMemo(() => {
    const list = [];
    for (let r = 0; r < KEY_ROWS; r++) {
      for (let c = 0; c < KEY_COLS; c++) {
        list.push([-0.208 + c * 0.032, 0.026, -0.052 + r * 0.026]);
      }
    }
    return list;
  }, []);
  return (
    <group>
      <mesh position={[0, 0.011, 0]}>
        <boxGeometry args={[0.48, 0.022, 0.15]} />
        <meshStandardMaterial color="#27272a" roughness={0.6} />
      </mesh>
      {/* Underglow */}
      <mesh position={[0, 0.002, 0]}>
        <boxGeometry args={[0.49, 0.004, 0.16]} />
        <meshBasicMaterial color="#f59e0b" toneMapped={false} />
      </mesh>
      {keys.map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.026, 0.01, 0.021]} />
          <meshStandardMaterial color={i % 13 === 0 ? "#f59e0b" : "#e4e4e7"} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
};

const Mouse = () => (
  <group>
    <mesh position={[0, 0.003, 0]}>
      <boxGeometry args={[0.16, 0.004, 0.2]} />
      <meshStandardMaterial color="#3f3f46" roughness={0.9} />
    </mesh>
    <mesh position={[0, 0.018, 0]} scale={[0.035, 0.016, 0.055]}>
      <sphereGeometry args={[1, 20, 12]} />
      <meshStandardMaterial color="#e4e4e7" roughness={0.4} />
    </mesh>
  </group>
);

const Monitor = () => (
  <group>
    <mesh position={[0, 0.006, -0.02]}>
      <boxGeometry args={[0.24, 0.012, 0.14]} />
      <meshStandardMaterial color="#18181b" metalness={0.4} roughness={0.4} />
    </mesh>
    <mesh position={[0, 0.17, -0.05]}>
      <boxGeometry args={[0.04, 0.32, 0.025]} />
      <meshStandardMaterial color="#18181b" metalness={0.4} roughness={0.4} />
    </mesh>
    {/* Screen centre at eye level, above the podcast mic in front of the avatar */}
    <mesh position={[0, 0.52, 0]}>
      <boxGeometry args={[0.78, 0.48, 0.03]} />
      <meshStandardMaterial color="#09090b" roughness={0.3} />
    </mesh>
    <CodeScreen position={[0, 0.52, 0.0155]} scale={0.455} />
    {/* Soft light from the screen onto the desk and the avatar */}
    <pointLight position={[0, 0.52, 0.25]} color="#93c5fd" intensity={0.6} distance={1.4} />
  </group>
);

export const DeskSetup = () => (
  <group>
    <group position={deskPoint(-0.63, -0.15)} rotation-y={ALONG_DESK}>
      <Keyboard />
    </group>
    <group position={deskPoint(-0.6, -0.52)} rotation-y={ALONG_DESK}>
      <Mouse />
    </group>
    {/* Behind the keyboard, turned slightly toward the camera so the code stays readable */}
    <group position={deskPoint(-0.8, -0.12)} rotation-y={1.75}>
      <Monitor />
    </group>
  </group>
);
