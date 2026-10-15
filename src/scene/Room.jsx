import { useGLTF, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { asset } from "../lib/asset";
import { NIGHT_LIGHTS, createBakedMaterial } from "./bakedMaterial";
import { createCoffeeSteamMaterial } from "./coffeeSteamMaterial";
import { createMacScreen, createPcScreen, createTvScreen } from "./screens";

// "My Room in 3D" by Bruno Simon (models and bakes), assembled in its original coordinates.

// How far the chair (and the avatar in it) is pulled toward the desk, in room units (x, z).
export const CHAIR_PULL = [-0.15, -0.25];

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
const SCREEN_FPS = { pc: 15, mac: 10, tv: 20 };

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
    onAction?.(action);
  },
});

export const Room = ({ nightRef, screenRef, onAction }) => {
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
    const chairTop = chair.scene.children[0];
    chairTop.rotation.y = -Math.PI / 2 + 0.19;
    // Pulled in toward the desk, like someone about to type
    if (!chairTop.userData.pulled) {
      chairTop.position.x += CHAIR_PULL[0];
      chairTop.position.z += CHAIR_PULL[1];
      chairTop.userData.pulled = true;
    }
    setMaterial(room.scene, baked);
    setMaterial(chair.scene, baked);
    setMaterial(steam.scene, steamMaterial);
    setMaterial(elgato.scene, new THREE.MeshBasicMaterial({ color: "#ffffff" }));
  }, [room, chair, steam, elgato, baked, steamMaterial]);

  const tvMesh = useMemo(() => {
    // The TV is part of the baked room; its screen gets a plane just in front of it.
    const geometry = new THREE.PlaneGeometry(4.23, 2.37);
    geometry.rotateY(-Math.PI * 0.5);
    const mesh = new THREE.Mesh(geometry);
    mesh.position.set(4.19, 2.663, 1.819);
    return mesh;
  }, []);

  const drawPc = useScreen(pc.scene.children[0], programs.pc, 0.85);
  const drawMac = useScreen(mac.scene.children[0], programs.mac, 0.75);
  const drawTv = useScreen(tvMesh, programs.tv, 0.6);
  const frustum = useMemo(() => ({ f: new THREE.Frustum(), m: new THREE.Matrix4() }), []);

  const loupedeckColors = ["#af55cf", "#dbd85d", "#e86b24", "#b81b54"];
  const screenClocks = useRef({ pc: 0, mac: 0, tv: 0 });

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const time = state.clock.elapsedTime;

    // Day / night (driven by the page: the contact section and the lights switch)
    const u = baked.uniforms;
    const nightTarget = nightRef.current;
    u.uNightMix.value = damp(u.uNightMix.value, nightTarget, 2.5, dt);
    u.uLightTvStrength.value = u.uNightMix.value * NIGHT_LIGHTS.tv;
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

    // Screens redraw at ~30 fps: plenty for text, half the work
    // Only redraw screens the camera can see, each at its own rate
    frustum.m.multiplyMatrices(state.camera.projectionMatrix, state.camera.matrixWorldInverse);
    frustum.f.setFromProjectionMatrix(frustum.m);
    const clocks = screenClocks.current;
    for (const [key, draw, mesh] of [
      ["pc", drawPc, pc.scene.children[0]],
      ["mac", drawMac, mac.scene.children[0]],
      ["tv", drawTv, tvMesh],
    ]) {
      clocks[key] += dt;
      if (clocks[key] < 1 / SCREEN_FPS[key]) continue;
      if (frustum.f.intersectsObject(mesh)) draw(time, clocks[key]);
      clocks[key] = 0;
    }
  });

  return (
    <group>
      <primitive object={room.scene} />
      <primitive object={chair.scene} />
      <primitive object={pc.scene} {...roomInteractive("My monitor · see my work", "work", onAction)} />
      <primitive object={mac.scene} {...roomInteractive("MacBook · what I work with", "about", onAction)} />
      <primitive object={steam.scene} />
      <primitive object={elgato.scene} />
      <primitive object={leds.scene} />
      <primitive object={loupedeck.scene} />
      <primitive object={tvMesh} {...roomInteractive("The TV · switch the lights", "lights", onAction)} />
    </group>
  );
};
