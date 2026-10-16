// "Neon Duel": a short looping film for the TV. Two cyber fighters with light blades meet on a
// rooftop in a rainy neon city. Everything is drawn here, frame by frame, on the TV's canvas
// (no video files): the city, the rain, the fighters (jointed silhouettes posed from keyframes),
// the sparks of each clash, letterbox bars and film grain.

const W = 1024;
const H = 576;
const LOOP = 13; // seconds
const GROUND = 452;
const BAR = 46; // letterbox
const CYAN = "#3ef2ff";
const PINK = "#ff3ea8";

const ease = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (t) => Math.max(0, Math.min(1, t));
// a little seeded randomness so the city is the same on every loop
const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

// ------------------------------------------------------------------------------------- poses
// Angles in radians, from straight down, forward (toward the opponent) positive. Arms and legs
// are [upper, bend]; the lower segment's angle is upper + bend. `blade` is the blade's angle
// from the forearm. `air` lifts the whole fighter (a jump).
const POSES = {
  stance: { lean: 0.12, lead: [1.15, -0.75], rear: [0.45, -1.35], front: [0.42, -0.6], back: [-0.4, -0.3], blade: 0.55, air: 0 },
  dash: { lean: 0.55, lead: [-0.55, -0.5], rear: [-0.9, -0.4], front: [1.05, -1.35], back: [-0.75, -0.9], blade: -0.5, air: 0 },
  windup: { lean: -0.06, lead: [2.9, -0.35], rear: [0.9, -1.6], front: [0.35, -0.3], back: [-0.45, -0.3], blade: 0.25, air: 0 },
  strike: { lean: 0.5, lead: [0.8, -0.05], rear: [-0.4, -0.9], front: [0.95, -1.05], back: [-0.85, -0.2], blade: 0.1, air: 0 },
  block: { lean: -0.12, lead: [1.75, -1.55], rear: [1.25, -1.75], front: [0.5, -0.75], back: [-0.5, -0.4], blade: 1.4, air: 0 },
  lunge: { lean: 0.72, lead: [1.55, 0], rear: [-0.75, -0.3], front: [1.3, -0.35], back: [-1.05, -0.05], blade: 0, air: 0 },
  recoil: { lean: -0.45, lead: [0.35, -0.3], rear: [-0.85, -0.6], front: [0.1, -0.25], back: [-0.6, -0.85], blade: -0.6, air: 0 },
  jump: { lean: 0.25, lead: [2.6, -0.6], rear: [1.4, -1.2], front: [1.4, -2.1], back: [0.6, -2.0], blade: 0.4, air: 120 },
  dive: { lean: 0.6, lead: [1.0, -0.1], rear: [-0.3, -0.8], front: [1.1, -1.6], back: [0.2, -1.6], blade: 0.15, air: 40 },
};

// [time in seconds, pose, x on screen]: the fight, for each fighter. The blades meet between them
// (each fighter reaches ~150 toward the other); the last exchange is a pass-through strike: they
// dash past each other and end back to back.
const A = [
  [0, "stance", 200], [3.9, "stance", 240], [4.2, "dash", 370], [4.5, "windup", 400], [4.72, "strike", 415],
  [5.05, "block", 400], [5.45, "recoil", 320], [5.85, "stance", 300], [6.15, "jump", 420], [6.5, "dive", 500],
  [6.75, "stance", 510], [7.6, "stance", 480], [8.3, "stance", 430], [8.7, "dash", 560], [8.95, "lunge", 660],
  [9.4, "lunge", 760], [LOOP, "stance", 200],
];
const B = [
  [0, "stance", 824], [3.9, "stance", 784], [4.2, "dash", 660], [4.5, "block", 640], [4.72, "block", 632],
  [5.05, "lunge", 600], [5.45, "stance", 680], [6.15, "stance", 690], [6.45, "block", 690], [6.75, "recoil", 760],
  [7.3, "stance", 740], [8.3, "stance", 700], [8.7, "dash", 590], [8.95, "lunge", 470], [9.4, "lunge", 380],
  [LOOP, "stance", 824],
];
// when the blades meet, and how hard (the last one is the pass-through, as they cross)
const CLASHES = [
  [4.72, 0.7],
  [5.05, 0.6],
  [6.5, 1],
  [8.95, 1.4],
];

const keyed = (frames, t) => {
  let i = 0;
  while (i < frames.length - 2 && frames[i + 1][0] <= t) i++;
  const [t0, p0, x0] = frames[i];
  const [t1, p1, x1] = frames[i + 1];
  const k = ease(clamp01((t - t0) / Math.max(0.001, t1 - t0)));
  const a = POSES[p0];
  const b = POSES[p1];
  const mix = (u, v) => [lerp(u[0], v[0], k), lerp(u[1], v[1], k)];
  return {
    x: lerp(x0, x1, k),
    lean: lerp(a.lean, b.lean, k),
    lead: mix(a.lead, b.lead),
    rear: mix(a.rear, b.rear),
    front: mix(a.front, b.front),
    back: mix(a.back, b.back),
    blade: lerp(a.blade, b.blade, k),
    air: lerp(a.air, b.air, k),
  };
};

// Joint positions for a pose, facing +1 (right) or -1 (left)
// fighters fill the frame (the TV is small in the room)
const SCALE = 1.7;
const SEG = { torso: 66 * SCALE, neck: 12 * SCALE, upper: 38 * SCALE, fore: 36 * SCALE, thigh: 46 * SCALE, shin: 46 * SCALE, blade: 80 * SCALE };
const rig = (pose, facing) => {
  const dir = (angle, length) => [Math.sin(angle) * facing * length, Math.cos(angle) * length];
  const add = (p, d) => [p[0] + d[0], p[1] + d[1]];
  const hip = [0, 0];
  const chest = add(hip, [Math.sin(pose.lean) * facing * SEG.torso, -Math.cos(pose.lean) * SEG.torso]);
  const head = add(chest, [Math.sin(pose.lean) * facing * (SEG.neck + 12 * SCALE), -Math.cos(pose.lean) * (SEG.neck + 12 * SCALE)]);
  const limb = (from, [upper, bend], a, b) => {
    const mid = add(from, dir(upper, a));
    return [mid, add(mid, dir(upper + bend, b)), upper + bend];
  };
  const [leadElbow, leadHand, foreAngle] = limb(chest, pose.lead, SEG.upper, SEG.fore);
  const [rearElbow, rearHand] = limb(chest, pose.rear, SEG.upper, SEG.fore);
  const [frontKnee, frontFoot] = limb(hip, pose.front, SEG.thigh, SEG.shin);
  const [backKnee, backFoot] = limb(hip, pose.back, SEG.thigh, SEG.shin);
  const tip = add(leadHand, dir(foreAngle + pose.blade, SEG.blade));
  // stand on the roof: the lowest foot on the ground (or up in the air)
  const lift = GROUND - Math.max(frontFoot[1], backFoot[1]) - pose.air * SCALE * 0.8;
  const at = (p) => [p[0] + pose.x, p[1] + lift];
  return {
    hip: at(hip), chest: at(chest), head: at(head),
    leadElbow: at(leadElbow), leadHand: at(leadHand), rearElbow: at(rearElbow), rearHand: at(rearHand),
    frontKnee: at(frontKnee), frontFoot: at(frontFoot), backKnee: at(backKnee), backFoot: at(backFoot),
    tip: at(tip),
  };
};

// --------------------------------------------------------------------------------- the city
const makeCity = () => {
  const random = rng(7);
  const far = document.createElement("canvas");
  far.width = W + 240;
  far.height = H;
  const c = far.getContext("2d");
  // far towers: blue-grey blocks with a few lit windows
  for (let x = -20; x < far.width; ) {
    const w = 40 + random() * 70;
    const top = 120 + random() * 200;
    c.fillStyle = `rgb(${18 + random() * 10},${20 + random() * 12},${44 + random() * 18})`;
    c.fillRect(x, top, w, GROUND - top);
    for (let y = top + 10; y < GROUND - 8; y += 12)
      for (let wx = x + 6; wx < x + w - 6; wx += 10)
        if (random() < 0.16) {
          c.fillStyle = random() < 0.7 ? "rgba(255,214,140,0.55)" : "rgba(120,220,255,0.5)";
          c.fillRect(wx, y, 4, 5);
        }
    x += w + random() * 8;
  }
  // nearer, darker blocks
  for (let x = -40; x < far.width; ) {
    const w = 70 + random() * 110;
    const top = 230 + random() * 140;
    c.fillStyle = "#0b0a16";
    c.fillRect(x, top, w, GROUND - top);
    x += w + 20 + random() * 60;
  }
  return far;
};

const SIGNS = [
  { x: 140, y: 250, w: 28, h: 120, text: "HOTEL", color: PINK, vertical: true, flicker: 0.04 },
  { x: 610, y: 300, w: 92, h: 30, text: "24H", color: CYAN, vertical: false, flicker: 0.0 },
  { x: 860, y: 230, w: 30, h: 110, text: "ネオン", color: "#ffd23e", vertical: true, flicker: 0.08 },
  { x: 380, y: 330, w: 120, h: 28, text: "RAMEN", color: PINK, vertical: false, flicker: 0.02 },
];

const film = { city: null, rain: null, trails: { a: [], b: [] }, lastT: 0, sparks: [] };

const drawSigns = (ctx, t, pan) => {
  for (const sign of SIGNS) {
    const on = Math.sin(t * 37 + sign.x) > -1 + sign.flicker * 25 || Math.random() > sign.flicker * 6;
    ctx.save();
    ctx.translate(sign.x - pan * 0.6, sign.y);
    ctx.strokeStyle = sign.color;
    ctx.fillStyle = sign.color;
    ctx.globalAlpha = on ? 1 : 0.25;
    ctx.shadowColor = sign.color;
    ctx.shadowBlur = on ? 18 : 0;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(0, 0, sign.w, sign.h);
    ctx.font = `700 ${sign.vertical ? 20 : 18}px "JetBrains Mono", monospace`;
    ctx.textAlign = "center";
    if (sign.vertical) [...sign.text].forEach((ch, i) => ctx.fillText(ch, sign.w / 2, 22 + i * (sign.h - 18) / sign.text.length));
    else ctx.fillText(sign.text, sign.w / 2, sign.h / 2 + 6);
    ctx.restore();
  }
};

const drawFighter = (ctx, r, color, facing) => {
  const line = (a, b, width) => {
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.stroke();
  };
  const body = (offset, style) => {
    ctx.strokeStyle = style;
    ctx.fillStyle = style;
    ctx.save();
    ctx.translate(offset, -offset * 0.5);
    line(r.backKnee, r.backFoot, 20);
    line(r.hip, r.backKnee, 26);
    line(r.chest, r.rearElbow, 20);
    line(r.rearElbow, r.rearHand, 17);
    line(r.hip, r.chest, 38);
    line(r.hip, r.frontKnee, 26);
    line(r.frontKnee, r.frontFoot, 20);
    line(r.chest, r.leadElbow, 20);
    line(r.leadElbow, r.leadHand, 17);
    ctx.beginPath();
    ctx.arc(r.head[0], r.head[1], 23, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  ctx.lineCap = "round";
  // rim light from the neon behind, then the dark silhouette over it
  ctx.globalAlpha = 0.9;
  body(-3.5 * facing, color);
  ctx.globalAlpha = 1;
  body(0, "#07060d");
  // visor
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(r.head[0] - 3 * facing, r.head[1] - 3);
  ctx.lineTo(r.head[0] + 19 * facing, r.head[1] - 5);
  ctx.stroke();
  ctx.shadowBlur = 0;
};

const drawBlade = (ctx, r, color, trail) => {
  // a short fading trail of where the blade has been
  trail.unshift([r.leadHand[0], r.leadHand[1], r.tip[0], r.tip[1]]);
  if (trail.length > 5) trail.pop();
  ctx.lineCap = "round";
  trail.forEach(([hx, hy, tx, ty], i) => {
    if (!i) return;
    ctx.globalAlpha = 0.22 * (1 - i / trail.length);
    ctx.fillStyle = color;
    const [phx, phy, ptx, pty] = trail[i - 1];
    ctx.beginPath();
    ctx.moveTo(phx, phy);
    ctx.lineTo(ptx, pty);
    ctx.lineTo(tx, ty);
    ctx.lineTo(hx, hy);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  ctx.shadowColor = color;
  ctx.shadowBlur = 22;
  ctx.strokeStyle = color;
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.moveTo(r.leadHand[0], r.leadHand[1]);
  ctx.lineTo(r.tip[0], r.tip[1]);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;
  ctx.stroke();
};

export const drawFilm = (ctx, w, h, time) => {
  const t = time % LOOP;
  film.city ??= makeCity();
  film.rain ??= Array.from({ length: 150 }, () => ({ x: Math.random() * W, y: Math.random() * H, len: 10 + Math.random() * 16, speed: 520 + Math.random() * 380 }));
  const dt = Math.max(0, Math.min(0.1, t - film.lastT));
  film.lastT = t;

  // Title card at the end
  if (t > 10.1) {
    ctx.fillStyle = "#040308";
    ctx.fillRect(0, 0, w, h);
    const k = clamp01((t - 10.3) / 0.6);
    const flick = Math.random() > 0.08 ? 1 : 0.4;
    ctx.save();
    ctx.globalAlpha = k * flick;
    ctx.textAlign = "center";
    ctx.shadowBlur = 24;
    ctx.shadowColor = PINK;
    ctx.fillStyle = PINK;
    ctx.font = `800 92px "Inter", sans-serif`;
    ctx.fillText("NEON", w / 2 - 128, h / 2 + 14);
    ctx.shadowColor = CYAN;
    ctx.fillStyle = CYAN;
    ctx.fillText("DUEL", w / 2 + 132, h / 2 + 14);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = k * 0.75;
    ctx.fillStyle = "#cfd3ff";
    ctx.font = `500 18px "JetBrains Mono", monospace`;
    ctx.fillText("EPISODE 01  ·  TO BE CONTINUED", w / 2, h / 2 + 64);
    ctx.restore();
    film.trails.a.length = film.trails.b.length = 0;
    return;
  }

  // the camera: a slow pan in, a little push during the fight, and a shake on each clash
  const pan = lerp(160, 0, ease(clamp01(t / 3.5)));
  let shake = 0;
  let flash = 0;
  for (const [at, power] of CLASHES) {
    const since = t - at;
    if (since >= 0 && since < 0.5) {
      shake = Math.max(shake, power * 9 * (1 - since / 0.5));
      flash = Math.max(flash, power * 0.28 * (1 - since / 0.2));
    }
  }
  const lightning = t > 3.2 && t < 3.45 ? (1 - (t - 3.2) / 0.25) * 0.8 : 0;
  const zoom = 1 + 0.07 * ease(clamp01((t - 3.8) / 5));

  ctx.save();
  ctx.translate(w / 2 + (Math.random() - 0.5) * shake, h / 2 + (Math.random() - 0.5) * shake);
  ctx.scale(zoom, zoom);
  ctx.translate(-w / 2, -h / 2);

  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
  sky.addColorStop(0, "#0b0620");
  sky.addColorStop(0.6, "#2a0f3d");
  sky.addColorStop(1, "#4a1640");
  ctx.fillStyle = sky;
  ctx.fillRect(-60, -60, w + 120, h + 120);
  if (lightning > 0) {
    ctx.strokeStyle = `rgba(220,230,255,${lightning})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    let lx = 770;
    ctx.moveTo(lx, 0);
    for (let y = 20; y < 260; y += 26) {
      lx += (Math.sin(y * 13.7) * 0.5) * 40;
      ctx.lineTo(lx, y);
    }
    ctx.stroke();
  }
  // the city, drifting slower than the roof
  ctx.drawImage(film.city, -pan * 0.5 - 120, 0);
  drawSigns(ctx, t, pan);
  // the roof: a dark slab, wet, with the neon smeared in its puddles
  const roof = ctx.createLinearGradient(0, GROUND, 0, h);
  roof.addColorStop(0, "#15111f");
  roof.addColorStop(1, "#05040a");
  ctx.fillStyle = roof;
  ctx.fillRect(-60, GROUND, w + 120, h - GROUND + 60);
  for (const [x, color, width] of [[180, PINK, 120], [520, CYAN, 180], [800, "#ffd23e", 90]]) {
    const smear = ctx.createLinearGradient(0, GROUND, 0, GROUND + 90);
    smear.addColorStop(0, color);
    smear.addColorStop(1, "transparent");
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = smear;
    ctx.fillRect(x - pan * 0.9 - width / 2, GROUND + 4, width, 90);
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "#2b2440";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-60, GROUND);
  ctx.lineTo(w + 60, GROUND);
  ctx.stroke();

  // the fighters
  ctx.save();
  ctx.translate(-pan * 0.9, 0);
  const a = rig(keyed(A, t), 1);
  const b = rig(keyed(B, t), -1);
  drawFighter(ctx, b, PINK, -1);
  drawFighter(ctx, a, CYAN, 1);
  drawBlade(ctx, b, PINK, film.trails.b);
  drawBlade(ctx, a, CYAN, film.trails.a);
  // sparks where the blades meet
  for (const [at, power] of CLASHES) {
    if (t >= at && t - dt < at) {
      const x = (a.tip[0] + b.tip[0] + a.leadHand[0] + b.leadHand[0]) / 4;
      const y = (a.tip[1] + b.tip[1] + a.leadHand[1] + b.leadHand[1]) / 4;
      for (let i = 0; i < 26 * power; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 180 + Math.random() * 560 * power;
        film.sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 80, life: 0.4 + Math.random() * 0.4 });
      }
    }
  }
  ctx.lineCap = "round";
  film.sparks = film.sparks.filter((s) => (s.life -= dt) > 0);
  for (const s of film.sparks) {
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.vy += 900 * dt;
    ctx.strokeStyle = `rgba(255,${200 + Math.random() * 55},150,${Math.min(1, s.life * 2)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x - s.vx * 0.02, s.y - s.vy * 0.02);
    ctx.stroke();
  }
  ctx.restore();

  // rain over everything
  ctx.strokeStyle = "rgba(170,190,255,0.28)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (const drop of film.rain) {
    drop.y += drop.speed * dt;
    drop.x -= drop.speed * 0.18 * dt;
    if (drop.y > h) {
      drop.y = -20;
      drop.x = Math.random() * (w + 100);
    }
    ctx.moveTo(drop.x, drop.y);
    ctx.lineTo(drop.x + drop.len * 0.18, drop.y - drop.len);
  }
  ctx.stroke();
  ctx.restore();

  // opening title over the city
  const title = clamp01((t - 0.5) / 0.6) * (1 - clamp01((t - 2.6) / 0.6));
  if (title > 0) {
    ctx.save();
    ctx.globalAlpha = title;
    ctx.textAlign = "center";
    ctx.font = `600 16px "JetBrains Mono", monospace`;
    ctx.fillStyle = "#cfd3ff";
    ctx.fillText("SECTOR 7  ·  02:47 AM", w / 2, h / 2 - 40);
    ctx.font = `800 64px "Inter", sans-serif`;
    ctx.shadowColor = CYAN;
    ctx.shadowBlur = 20;
    ctx.fillStyle = "#ffffff";
    ctx.fillText("NEON DUEL", w / 2, h / 2 + 24);
    ctx.restore();
  }

  // flashes: lightning, and the white of a hard clash
  const white = Math.max(flash, lightning * 0.5);
  if (white > 0) {
    ctx.fillStyle = `rgba(255,255,255,${Math.min(0.8, white)})`;
    ctx.fillRect(0, 0, w, h);
  }
  // the final clash holds on white for a moment
  if (t > 9.4 && t < 10.1) {
    ctx.fillStyle = `rgba(255,255,255,${1 - (t - 9.4) / 0.7})`;
    ctx.fillRect(0, 0, w, h);
  }
  // film grain, vignette, letterbox
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  for (let i = 0; i < 160; i++) ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
  const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, h * 0.85);
  vignette.addColorStop(0, "transparent");
  vignette.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, BAR);
  ctx.fillRect(0, h - BAR, w, BAR);
};
