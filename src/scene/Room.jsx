import { useGLTF, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { asset } from "../lib/asset";
import { NIGHT_LIGHTS, createBakedMaterial } from "./bakedMaterial";
import { createCoffeeSteamMaterial } from "./coffeeSteamMaterial";
import { createMacScreen, createPcScreen, createTvScreen } from "./screens";
import { strum, tvSound } from "../lib/sound";

// "My Room in 3D" by Bruno Simon (models and bakes), assembled in its original coordinates.

// The chair top swivels around its stem. In the original scene the stem sits at CHAIR_STEM; here
// the chair is pulled toward the desk (CHAIR_PULL) so the avatar sits on it while typing.
const CHAIR_STEM = [0.8117, 1.3047, -1.5329];
export const CHAIR_PULL = [-0.2, -0.42];
export const CHAIR_PIVOT = [CHAIR_STEM[0] + CHAIR_PULL[0], CHAIR_STEM[1], CHAIR_STEM[2] + CHAIR_PULL[1]];

const model = (name) => asset(`models/${name}`);
const texture = (name) => asset(`textures/${name}`);

const MODELS = [
  "roomModel.glb",
  "topChairModel.glb",
  "pcScreenModel.glb",
  "macScreenModel.glb",
  "coffeeSteamModel.glb",
  "elgatoLightModel.glb",
  "googleHomeLedsModel.glb",
  "loupedeckButtonsModel.glb",
];
MODELS.forEach((name) => useGLTF.preload(model(name)));

const setMaterial = (object, material) =>
  object.traverse((child) => {
    if (child.isMesh) child.material = material;
  });

// A screen mesh whose texture is redrawn from a canvas "program" (see screens.js).
// Programs lay out in their own logical size; the canvas is `scale` times that, and the texture
// skips mipmaps since it is re-uploaded every time it is redrawn.
const useScreen = (mesh, program, scale) => {
  const { canvas, map, ctx } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(program.width * scale);
    canvas.height = Math.round(program.height * scale);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    const map = new THREE.CanvasTexture(canvas);
    map.encoding = THREE.sRGBEncoding;
    map.generateMipmaps = false;
    map.minFilter = THREE.LinearFilter;
    map.anisotropy = 4;
    return { canvas, map, ctx };
  }, [program, scale]);
  useLayoutEffect(() => {
    mesh.material = new THREE.MeshBasicMaterial({ map, toneMapped: false });
  }, [mesh, map]);
  return (time, dt) => {
    program.draw(ctx, program.width, program.height, time, dt);
    map.needsUpdate = true;
  };
};

// Redraw budget per screen: enough for typing and a smooth bounce, a fraction of 60 fps.
const SCREEN_FPS = { pc: 12, mac: 8, tv: 15 };

// Damp a value toward a target, frame-rate independent.
const damp = (current, target, lambda, dt) => THREE.MathUtils.damp(current, target, lambda, dt);

// Hover label + pointer cursor for the objects you can click in the room.
export const roomInteractive = (label, action, onAction) => ({
  onPointerOver: (e) => {
    e.stopPropagation();
    document.body.style.cursor = "pointer";
    const tip = document.getElementById("room-tip");
    if (tip) {
      tip.textContent = label;
      tip.dataset.show = "true";
    }
  },
  onPointerOut: () => {
    document.body.style.cursor = "";
    const tip = document.getElementById("room-tip");
    if (tip) tip.dataset.show = "false";
  },
  onClick: (e) => {
    e.stopPropagation();
    // A tap has no hover: show what it was for a moment
    if (e.nativeEvent?.pointerType === "touch") {
      const tip = document.getElementById("room-tip");
      if (tip) {
        tip.textContent = label;
        tip.style.transform = `translate(${e.nativeEvent.clientX - 60}px, ${e.nativeEvent.clientY + 24}px)`;
        tip.dataset.show = "true";
        clearTimeout(tip.hideTimer);
        tip.hideTimer = setTimeout(() => (tip.dataset.show = "false"), 1500);
      }
    }
    onAction?.(action);
  },
});

// The coffee mug is baked into the room mesh: its triangles (all within this little cylinder on
// the desk, measured) are lifted out into a mesh of their own, so he can pick it up.
const MUG = new THREE.Vector3(-1.3956, 1.925, -3.4155);
const MUG_RADIUS = 0.25;
const MUG_TOP = 2.25;
const mugs = new WeakMap();
const liftMug = (mesh, material) => {
  const geometry = mesh.geometry;
  if (mugs.has(geometry)) return mugs.get(geometry);
  mesh.updateWorldMatrix(true, false);
  const position = geometry.attributes.position;
  const index = geometry.index;
  const v = new THREE.Vector3();
  // Above the coaster everything in the cylinder is the mug (body and handle); at coaster height
  // only the mug's own base, so the coaster stays on the desk
  const inMug = (i) => {
    v.fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld);
    const r = Math.hypot(v.x - MUG.x, v.z - MUG.z);
    return v.y < MUG_TOP && ((v.y > MUG.y + 0.02 && r < MUG_RADIUS) || (v.y > MUG.y && r < 0.12));
  };
  const keep = [];
  const take = [];
  for (let t = 0; t < index.count; t += 3) {
    const a = index.getX(t), b = index.getX(t + 1), c = index.getX(t + 2);
    (inMug(a) && inMug(b) && inMug(c) ? take : keep).push(a, b, c);
  }
  if (!take.length) return null;
  const mugGeometry = new THREE.BufferGeometry();
  for (const [name, attribute] of Object.entries(geometry.attributes)) {
    const size = attribute.itemSize;
    const out = new Float32Array(take.length * size);
    const get = [attribute.getX, attribute.getY, attribute.getZ, attribute.getW];
    take.forEach((vertex, k) => {
      for (let c = 0; c < size; c++) out[k * size + c] = get[c].call(attribute, vertex);
    });
    mugGeometry.setAttribute(name, new THREE.BufferAttribute(out, size));
  }
  mugGeometry.applyMatrix4(mesh.matrixWorld);
  mugGeometry.translate(-MUG.x, -MUG.y, -MUG.z);
  geometry.setIndex(keep);
  const group = new THREE.Group();
  group.position.copy(MUG);
  group.add(new THREE.Mesh(mugGeometry, material));
  // an easier target for the pointer than the mug itself
  const hit = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.5, 0.55), new THREE.MeshBasicMaterial({ visible: false }));
  hit.position.y = 0.15;
  group.add(hit);
  group.userData.rest = MUG.clone();
  mugs.set(geometry, group);
  return group;
};

export const Room = ({ nightRef, screenRef, onAction, swivelRef, tvRef, coffeeRef, children }) => {
  const [room, chair, pc, mac, steam, elgato, leds, loupedeck] = MODELS.map((name) => useGLTF(model(name)));
  const [day, night, lightMap, ledMask] = useTexture([
    texture("bakedDay.jpg"),
    texture("bakedNight.jpg"),
    texture("lightMap.jpg"),
    texture("googleHomeLedMask.png"),
  ]);

  const baked = useMemo(() => createBakedMaterial({ day, night, lightMap }), [day, night, lightMap]);
  const steamMaterial = useMemo(() => createCoffeeSteamMaterial(), []);
  const programs = useMemo(() => ({ pc: createPcScreen(), mac: createMacScreen(), tv: createTvScreen() }), []);

  const ledItems = useMemo(() => {
    const colors = ["#196aff", "#ff0000", "#ff5d00", "#7db81b"];
    return [...leds.scene.children]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((mesh, index) => {
        mesh.material = new THREE.MeshBasicMaterial({ color: colors[index], transparent: true, alphaMap: ledMask });
        return mesh;
      });
  }, [leds, ledMask]);

  const loupedeckItems = useMemo(
    () =>
      [...loupedeck.scene.children]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((mesh) => {
          mesh.material = new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true });
          return { mesh, next: Math.random() * 3 };
        }),
    [loupedeck]
  );

  useLayoutEffect(() => {
    // In the original scene the chair top swivels toward the room; here it faces the desk, with
    // the avatar sitting in it.
    // Facing the keyboard; the swivel group around it handles any turning
    const chairTop = chair.scene.children[0];
    chairTop.position.set(0, 0, 0);
    chairTop.rotation.y = -Math.PI / 2 + 0.19;
    setMaterial(room.scene, baked);
    setMaterial(chair.scene, baked);
    setMaterial(steam.scene, steamMaterial);
    setMaterial(elgato.scene, new THREE.MeshBasicMaterial({ color: "#ffffff" }));
  }, [room, chair, steam, elgato, baked, steamMaterial]);

  const mug = useMemo(() => liftMug(room.scene.getObjectByProperty("isMesh", true), baked), [room, baked]);
  useLayoutEffect(() => {
    if (!coffeeRef || !mug) return;
    coffeeRef.current.mug = mug;
    coffeeRef.current.steam = steam.scene;
  }, [coffeeRef, mug, steam]);

  // Things in the room that answer for themselves: the TV powers off and on, the guitar plays
  const handle = (action) => {
    if (action === "tv") {
      const on = !programs.tv.on;
      programs.tv.setPower(on, performance.now() / 1000);
      tvSound(on);
      if (tvRef) tvRef.current.on = on;
    } else if (action === "guitar") strum();
    else onAction?.(action);
  };
  const guitarHover = roomInteractive("The guitar · give it a strum", "guitar", handle);
  const guitar = {
    ...guitarHover,
    onPointerOver: (e) => {
      guitarHover.onPointerOver(e);
      strum();
    },
  };

  const tvMesh = useMemo(() => {
    // The TV is part of the baked room; its screen gets a plane just in front of it.
    const geometry = new THREE.PlaneGeometry(4.23, 2.37);
    geometry.rotateY(-Math.PI * 0.5);
    const mesh = new THREE.Mesh(geometry);
    mesh.position.set(4.19, 2.663, 1.819);
    return mesh;
  }, []);

  const drawPc = useScreen(pc.scene.children[0], programs.pc, 0.75);
  const drawMac = useScreen(mac.scene.children[0], programs.mac, 0.65);
  const drawTv = useScreen(tvMesh, programs.tv, 0.5);
  const frustum = useMemo(() => ({ f: new THREE.Frustum(), m: new THREE.Matrix4() }), []);

  const loupedeckColors = ["#af55cf", "#dbd85d", "#e86b24", "#b81b54"];
  const screenClocks = useRef({ pc: 0, mac: 0, tv: 0 });
  const lastCamera = useRef(null);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const time = state.clock.elapsedTime;

    // Day / night (driven by the page: the contact section and the lights switch)
    const u = baked.uniforms;
    const nightTarget = nightRef.current;
    u.uNightMix.value = damp(u.uNightMix.value, nightTarget, 2.5, dt);
    // The TV's glow on the room goes with it when it's switched off
    if (tvRef) tvRef.current.level = damp(tvRef.current.level ?? 1, tvRef.current.on === false ? 0 : 1, 4, dt);
    u.uLightTvStrength.value = u.uNightMix.value * NIGHT_LIGHTS.tv * (tvRef?.current.level ?? 1);
    u.uLightDeskStrength.value = u.uNightMix.value * NIGHT_LIGHTS.desk;
    u.uLightPcStrength.value = u.uNightMix.value * NIGHT_LIGHTS.pc;

    steamMaterial.uniforms.uTime.value = time * 1000;

    ledItems.forEach((mesh, index) => {
      mesh.material.opacity = Math.sin(time * 2 - index * 0.5) * 0.5 + 0.5;
    });

    loupedeckItems.forEach((item) => {
      item.next -= dt;
      if (item.next < 0) {
        item.mesh.material.color.set(loupedeckColors[Math.floor(Math.random() * loupedeckColors.length)]);
        item.next = 0.4 + Math.random() * 2.5;
      }
    });

    programs.pc.setContent(screenRef.current);

    // Screens the camera can see redraw at their own rate, and at most one per frame: a redraw
    // plus its texture upload is the most expensive thing in a frame, and two or three landing
    // together made frames visibly late
    frustum.m.multiplyMatrices(state.camera.projectionMatrix, state.camera.matrixWorldInverse);
    frustum.f.setFromProjectionMatrix(frustum.m);
    const clocks = screenClocks.current;
    // While the camera glides between sections nobody can read the screens: they wait, and catch
    // up (one per frame) as soon as it settles
    lastCamera.current ??= state.camera.position.clone();
    const cameraSpeed = state.camera.position.distanceTo(lastCamera.current) / Math.max(dt, 1e-3);
    lastCamera.current.copy(state.camera.position);
    const gliding = cameraSpeed > 2.5;
    let due = null;
    for (const [key, draw, mesh] of [
      ["pc", drawPc, pc.scene.children[0]],
      ["mac", drawMac, mac.scene.children[0]],
      ["tv", drawTv, tvMesh],
    ]) {
      clocks[key] += dt;
      const fps = programs[key].fps?.(performance.now() / 1000) ?? SCREEN_FPS[key];
      if (fps === 0) continue;
      const overdue = clocks[key] * fps;
      if (overdue < 1) continue;
      if (!frustum.f.intersectsObject(mesh)) {
        clocks[key] = 0;
        continue;
      }
      if (!due || overdue > due.overdue) due = { key, draw, overdue };
    }
    if (due && (!gliding || due.overdue > 3)) {
      due.draw(performance.now() / 1000, clocks[due.key]);
      clocks[due.key] = 0;
    }
  });

  return (
    <group>
      <primitive object={room.scene} />
      <group ref={swivelRef} position={CHAIR_PIVOT}>
        <primitive object={chair.scene} />
        {children}
      </group>
      <primitive object={pc.scene} {...roomInteractive("My monitor · see my work", "work", handle)} />
      <primitive object={mac.scene} {...roomInteractive("MacBook · what I work with", "about", handle)} />
      <primitive object={steam.scene} />
      {mug && <primitive object={mug} {...roomInteractive("My coffee · let him take a sip", "coffee", handle)} />}
      {/* The guitar is part of the baked room: a box around it takes the pointer */}
      <mesh position={[-3.1, 1.3, -3.75]} {...guitar}>
        <boxGeometry args={[0.8, 2.5, 0.8]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      <primitive object={elgato.scene} {...roomInteractive("The ring light · switch the lights", "lights", handle)} />
      <primitive object={leds.scene} />
      <primitive object={loupedeck.scene} />
      <primitive object={tvMesh} {...roomInteractive("The TV · switch it off and on", "tv", handle)} />
    </group>
  );
};
