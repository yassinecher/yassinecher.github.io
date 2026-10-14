import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { TOKEN_COLORS, tokenizeLine } from "../lib/highlight";

// Excerpts (lightly trimmed) from the Medianet Incubator code base, typed out live on the desk monitor.
const FILES = [
  {
    name: "Evaluation.java",
    lang: "java",
    code: `public void calculateWeightedScore() {
  double weightedSum = 0;
  double totalWeight = 0;
  for (CriteriaScore cs : criteriaScores) {
    weightedSum += cs.getScore() * cs.getWeight();
    totalWeight += cs.getWeight();
  }
  this.weightedScore = totalWeight > 0
      ? weightedSum / totalWeight : null;
}`,
  },
  {
    name: "app.py",
    lang: "python",
    code: `def get_whisper():
    global _whisper_model
    if _whisper_model is None:
        from faster_whisper import WhisperModel
        _whisper_model = WhisperModel(
            WHISPER_MODEL,
            device=WHISPER_DEVICE,
            compute_type=WHISPER_COMPUTE,
        )
    return _whisper_model`,
  },
  {
    name: "docker-compose.yml",
    lang: "yaml",
    code: `pitch-media-service:
  build: ./backend/pitch-media-service
  expose: ["8087"]
  environment:
    MINIO_INTERNAL_URL: http://minio:9000
    OLLAMA_URL: http://ollama:11434
    WHISPER_MODEL: base
    WHISPER_DEVICE: cpu
    WHISPER_COMPUTE: int8`,
  },
];

const W = 1024;
const H = 640;
const FONT = '"JetBrains Mono", Consolas, monospace';
const CHARS_PER_SECOND = 28;
const HOLD_SECONDS = 2.5;

function draw(ctx, file, fileIndex, typed, cursorOn) {
  ctx.fillStyle = "#0d1117";
  ctx.fillRect(0, 0, W, H);

  // Title bar with window controls and tabs
  ctx.fillStyle = "#161b22";
  ctx.fillRect(0, 0, W, 64);
  ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(32 + i * 28, 32, 9, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.font = `600 22px ${FONT}`;
  let x = 140;
  FILES.forEach((f, i) => {
    const w = ctx.measureText(f.name).width + 40;
    if (i === fileIndex) {
      ctx.fillStyle = "#0d1117";
      ctx.fillRect(x, 12, w, 52);
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(x, 12, w, 3);
    }
    ctx.fillStyle = i === fileIndex ? "#f4f4f5" : "#71717a";
    ctx.fillText(f.name, x + 20, 46);
    x += w + 4;
  });

  // Code
  const lines = file.code.slice(0, typed).split("\n");
  const lineHeight = 50;
  ctx.font = `500 27px ${FONT}`;
  lines.forEach((line, i) => {
    const y = 120 + i * lineHeight;
    ctx.fillStyle = "#3f3f46";
    ctx.textAlign = "right";
    ctx.fillText(String(i + 1), 58, y);
    ctx.textAlign = "left";
    let cx = 84;
    for (const token of tokenizeLine(line, file.lang)) {
      ctx.fillStyle = TOKEN_COLORS[token.type];
      ctx.fillText(token.text, cx, y);
      cx += ctx.measureText(token.text).width;
    }
    if (i === lines.length - 1 && cursorOn) {
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(cx + 2, y - 24, 14, 30);
    }
  });

  // Status bar
  ctx.fillStyle = "#f59e0b";
  ctx.fillRect(0, H - 40, W, 40);
  ctx.fillStyle = "#111";
  ctx.font = `600 20px ${FONT}`;
  ctx.fillText("main  ·  medianet-incubator", 20, H - 13);
  ctx.textAlign = "right";
  ctx.fillText(`Ln ${lines.length}  ·  ${file.lang.toUpperCase()}`, W - 20, H - 13);
  ctx.textAlign = "left";
}

export const CodeScreen = (props) => {
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    return c;
  }, []);
  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 8;
    return t;
  }, [canvas]);
  const state = useRef({ file: 0, typed: 0, hold: 0, last: "" });

  useEffect(() => {
    // Redraw once the editor font is available so the first frame isn't in a fallback face.
    document.fonts?.load(`500 27px "JetBrains Mono"`).then(() => {
      state.current.last = "";
    });
  }, []);

  useFrame((_, delta) => {
    const s = state.current;
    const file = FILES[s.file];
    if (s.typed < file.code.length) {
      s.typed = Math.min(file.code.length, s.typed + delta * CHARS_PER_SECOND);
    } else {
      s.hold += delta;
      if (s.hold > HOLD_SECONDS) {
        s.file = (s.file + 1) % FILES.length;
        s.typed = 0;
        s.hold = 0;
      }
    }
    const typed = Math.floor(s.typed);
    const cursorOn = Math.floor(performance.now() / 500) % 2 === 0;
    const key = `${s.file}:${typed}:${cursorOn}`;
    if (key === s.last) return;
    s.last = key;
    draw(canvas.getContext("2d"), FILES[s.file], s.file, typed, cursorOn);
    texture.needsUpdate = true;
  });

  return (
    <mesh {...props}>
      <planeGeometry args={[1.6, 1]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
};

// A desk monitor (stand, bezel and the live code screen). Its origin sits on the desk top.
export const DeskMonitor = (props) => (
  <group {...props}>
    <mesh position={[0, 0.005, -0.03]}>
      <boxGeometry args={[0.22, 0.012, 0.15]} />
      <meshStandardMaterial color="#18181b" />
    </mesh>
    <mesh position={[0, 0.17, -0.05]}>
      <boxGeometry args={[0.045, 0.33, 0.03]} />
      <meshStandardMaterial color="#18181b" />
    </mesh>
    <mesh position={[0, 0.42, 0]}>
      <boxGeometry args={[0.76, 0.48, 0.03]} />
      <meshStandardMaterial color="#09090b" />
    </mesh>
    <CodeScreen position={[0, 0.42, 0.0155]} scale={0.44} />
  </group>
);
