import { TOKEN_COLORS, tokenizeLine } from "../lib/highlight";

// Canvas "programs" for the room's screens. Each exposes draw(ctx, w, h, time, dt) and is redrawn
// into a CanvasTexture by <ScreenMesh>.

const MONO = '"JetBrains Mono", Consolas, monospace';
const SANS = '"Inter", system-ui, sans-serif';

const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

// ---------------------------------------------------------------------------------------------
// PC monitor: an editor where code gets typed like a person would, or a project in a browser.

const FILES = [
  {
    name: "Evaluation.java",
    path: "candidature-service/entity",
    lang: "java",
    code: `public void calculateWeightedScore() {
    if (criteriaScores == null || criteriaScores.isEmpty()) return;

    // sum(score * weight) / sum(weight)
    double weightedSum = 0;
    double totalWeight = 0;
    for (CriteriaScore cs : criteriaScores) {
        weightedSum += cs.getScore() * cs.getWeight();
        totalWeight += cs.getWeight();
    }
    this.weightedScore = totalWeight > 0
        ? weightedSum / totalWeight
        : null;
}`,
  },
  {
    name: "app.py",
    path: "pitch-media-service",
    lang: "python",
    code: `def get_whisper():
    global _whisper_model
    if _whisper_model is None:
        from faster_whisper import WhisperModel
        _whisper_model = WhisperModel(
            WHISPER_MODEL,
            device=WHISPER_DEVICE,
            compute_type=WHISPER_COMPUTE,
            download_root="/models",
        )
    return _whisper_model`,
  },
];

const TREE = [
  [0, "medianet-incubator", true],
  [1, "backend", true],
  [2, "api-gateway"],
  [2, "auth-service"],
  [2, "candidature-service", true],
  [2, "pitch-media-service", true],
  [2, "programme-service"],
  [1, "frontend", true],
  [2, "nextjs-backoffice"],
  [2, "nextjs-frontoffice"],
  [1, "docker-compose.yml"],
];

export const createPcScreen = () => {
  const state = {
    file: 0,
    typed: 0,
    wait: 0.6,
    hold: 0,
    typo: null, // { at, wrong, removed }
    project: null, // { image, title, url, since }
    previous: null,
  };

  const images = new Map();
  // Images are decoded off the main thread before their first draw (a first drawImage of an
  // undecoded image decodes it right there, in the middle of a frame)
  const loadImage = (src) => {
    if (!images.has(src)) {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
      img.ready = false;
      img.decode().then(
        () => (img.ready = true),
        () => {}
      );
      images.set(src, img);
    }
    return images.get(src);
  };

  // Typing with human rhythm: uneven speed, pauses at line ends, the odd typo fixed with backspace.
  const advance = (dt) => {
    const file = FILES[state.file];
    if (state.wait > 0) {
      state.wait -= dt;
      return;
    }
    if (state.typed >= file.code.length) {
      state.hold += dt;
      if (state.hold > 3.5) {
        state.file = (state.file + 1) % FILES.length;
        state.typed = 0;
        state.hold = 0;
        state.wait = 0.8;
      }
      return;
    }
    if (state.typo) {
      state.typo.removed += dt;
      if (state.typo.removed > 0.35) state.typo = null;
      return;
    }
    const next = file.code[Math.floor(state.typed)];
    if (next !== " " && next !== "\n" && Math.random() < 0.004) {
      state.typo = { removed: 0 };
      return;
    }
    state.typed += dt * (14 + Math.random() * 26);
    if (next === "\n") state.wait = 0.15 + Math.random() * 0.35;
  };

  const drawEditor = (ctx, w, h, time) => {
    const file = FILES[state.file];
    ctx.fillStyle = "#1e1f24";
    ctx.fillRect(0, 0, w, h);

    // Activity bar + explorer
    ctx.fillStyle = "#18191d";
    ctx.fillRect(0, 0, 52, h);
    ctx.fillStyle = "#202127";
    ctx.fillRect(52, 0, 250, h);
    ["#d4d4d8", "#52525b", "#52525b", "#52525b"].forEach((c, i) => {
      ctx.fillStyle = c;
      roundRect(ctx, 16, 22 + i * 52, 20, 20, 4);
      ctx.fill();
    });
    ctx.font = `600 14px ${SANS}`;
    ctx.fillStyle = "#8b8b95";
    ctx.fillText("EXPLORER", 72, 34);
    ctx.font = `500 16px ${SANS}`;
    TREE.forEach(([depth, name, open], i) => {
      const y = 70 + i * 30;
      const active = (state.file === 0 && name === "candidature-service") || (state.file === 1 && name === "pitch-media-service");
      if (active) {
        ctx.fillStyle = "#2c2d35";
        ctx.fillRect(52, y - 20, 250, 28);
      }
      ctx.fillStyle = active ? "#f4f4f5" : "#a1a1aa";
      ctx.fillText(`${open ? "▾" : name.includes(".") ? " " : "▸"} ${name}`, 70 + depth * 16, y);
    });

    // Tabs
    ctx.fillStyle = "#18191d";
    ctx.fillRect(302, 0, w - 302, 48);
    FILES.forEach((f, i) => {
      const x = 302 + i * 200;
      ctx.fillStyle = i === state.file ? "#1e1f24" : "#18191d";
      ctx.fillRect(x, 0, 198, 48);
      if (i === state.file) {
        ctx.fillStyle = "#e2502c";
        ctx.fillRect(x, 0, 198, 2);
      }
      ctx.font = `500 15px ${SANS}`;
      ctx.fillStyle = i === state.file ? "#f4f4f5" : "#71717a";
      ctx.fillText(f.name, x + 22, 30);
    });
    ctx.font = `400 13px ${SANS}`;
    ctx.fillStyle = "#71717a";
    ctx.fillText(`${file.path} › ${file.name}`, 322, 72);

    // Code
    const shown = file.code.slice(0, Math.floor(state.typed)) + (state.typo ? "e" : "");
    const lines = shown.split("\n");
    const lineH = 31;
    ctx.font = `500 19px ${MONO}`;
    lines.forEach((line, i) => {
      const y = 112 + i * lineH;
      ctx.fillStyle = i === lines.length - 1 ? "#a1a1aa" : "#4b4b55";
      ctx.textAlign = "right";
      ctx.fillText(String(i + 1), 350, y);
      ctx.textAlign = "left";
      if (i === lines.length - 1) {
        ctx.fillStyle = "rgba(255,255,255,0.04)";
        ctx.fillRect(302, y - 22, w - 302, lineH);
      }
      let x = 372;
      for (const token of tokenizeLine(line, file.lang)) {
        ctx.fillStyle = TOKEN_COLORS[token.type];
        ctx.fillText(token.text, x, y);
        x += ctx.measureText(token.text).width;
      }
      if (i === lines.length - 1 && Math.floor(time * 2) % 2 === 0) {
        ctx.fillStyle = "#f4f4f5";
        ctx.fillRect(x + 1, y - 18, 2, 24);
      }
    });

    // Minimap (relative to the current alpha, which may be mid cross-fade)
    const alpha = ctx.globalAlpha;
    ctx.globalAlpha = alpha * 0.35;
    file.code.split("\n").forEach((line, i) => {
      ctx.fillStyle = i < lines.length ? "#a1a1aa" : "#3f3f46";
      ctx.fillRect(w - 110 + line.search(/\S|$/) * 1.5, 70 + i * 6, Math.min(line.trim().length * 1.5, 90), 3);
    });
    ctx.globalAlpha = alpha;

    // Status bar
    ctx.fillStyle = "#e2502c";
    ctx.fillRect(0, h - 30, w, 30);
    ctx.fillStyle = "#fff";
    ctx.font = `600 14px ${SANS}`;
    ctx.fillText("⎇ main", 16, h - 10);
    ctx.fillText("✓ 0 problems", 110, h - 10);
    ctx.textAlign = "right";
    ctx.fillText(`Ln ${lines.length}, Col ${lines[lines.length - 1].length + 1}   ${file.lang.toUpperCase()}`, w - 16, h - 10);
    ctx.textAlign = "left";
  };

  const drawBrowser = (ctx, w, h, project) => {
    ctx.fillStyle = "#ece8e1";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#f7f4ee";
    ctx.fillRect(0, 0, w, 64);
    ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(28 + i * 24, 32, 7, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = "#e4dfd6";
    roundRect(ctx, 120, 14, w - 240, 36, 18);
    ctx.fill();
    ctx.fillStyle = "#57534e";
    ctx.font = `500 17px ${SANS}`;
    ctx.textAlign = "center";
    ctx.fillText(project.url, w / 2, 38);
    ctx.textAlign = "left";
    const img = loadImage(project.image);
    if (img.ready && img.naturalWidth) {
      const areaH = h - 64;
      const aspect = img.naturalWidth / img.naturalHeight;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 64, w, areaH);
      ctx.clip();
      if (aspect >= 1.3) {
        // A page screenshot: cover-fit with a slow drift, like scrolling the page
        const scale = Math.max(w / img.naturalWidth, areaH / img.naturalHeight) * 1.08;
        const dw = img.naturalWidth * scale;
        const dh = img.naturalHeight * scale;
        const t = (performance.now() / 1000 - project.since) * 0.04;
        ctx.drawImage(img, (w - dw) / 2, 64 + (areaH - dh) * (0.5 + 0.5 * Math.sin(t)), dw, dh);
      } else {
        // A square cover or phone shot: shown whole, over a soft, dimmed copy of itself (blurred
        // once and kept: a canvas blur every frame is expensive)
        ctx.drawImage(backdrop(img, w, areaH), 0, 64);
        const scale = (areaH - 48) / img.naturalHeight;
        const dw = img.naturalWidth * scale;
        const dh = img.naturalHeight * scale;
        const x = (w - dw) / 2;
        const y = 64 + 24;
        ctx.shadowColor = "rgba(0,0,0,0.35)";
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 8;
        roundRect(ctx, x, y, dw, dh, 14);
        ctx.fillStyle = "#111";
        ctx.fill();
        ctx.shadowColor = "transparent";
        roundRect(ctx, x, y, dw, dh, 14);
        ctx.clip();
        ctx.drawImage(img, x, y, dw, dh);
      }
      ctx.restore();
    }
  };

  const backdrops = new Map();
  const backdrop = (img, w, h) => {
    if (backdrops.has(img)) return backdrops.get(img);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const c = canvas.getContext("2d");
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * 1.15;
    c.filter = "blur(28px) brightness(0.55)";
    c.drawImage(img, (w - img.naturalWidth * scale) / 2, (h - img.naturalHeight * scale) / 2, img.naturalWidth * scale, img.naturalHeight * scale);
    backdrops.set(img, canvas);
    return canvas;
  };

  // Wrap text into lines that fit `maxWidth` (canvas font must already be set).
  const wrap = (ctx, text, maxWidth) => {
    const lines = [];
    for (const paragraph of text.split("\n")) {
      let line = "";
      for (const word of paragraph.split(" ")) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > maxWidth && line) {
          lines.push(line);
          line = word;
        } else line = test;
      }
      lines.push(line);
    }
    return lines;
  };

  // A mail being written to me, mirroring the contact form as the visitor types.
  const drawMail = (ctx, w, h, mail, time) => {
    ctx.fillStyle = "#f6f3ee";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#ebe6dd";
    ctx.fillRect(0, 0, w, 64);
    ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(28 + i * 24, 32, 7, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = "#3f3a33";
    ctx.font = `600 18px ${SANS}`;
    ctx.textAlign = "center";
    ctx.fillText("New message", w / 2, 39);
    ctx.textAlign = "left";

    const rows = [
      ["To", "yassinecherni9@gmail.com"],
      ["From", mail.name ? `${mail.name}${mail.email ? `  <${mail.email}>` : ""}` : mail.email || ""],
      ["Subject", "Hello from your portfolio"],
    ];
    rows.forEach(([label, value], i) => {
      const y = 112 + i * 52;
      ctx.fillStyle = "#8a8277";
      ctx.font = `500 19px ${SANS}`;
      ctx.fillText(label, 48, y);
      ctx.fillStyle = "#1c1a17";
      ctx.font = `500 20px ${SANS}`;
      ctx.fillText(value || " ", 150, y);
      ctx.fillStyle = "#e0d9cd";
      ctx.fillRect(48, y + 18, w - 96, 1.5);
    });

    ctx.font = `400 24px ${SANS}`;
    const body = mail.message || "";
    const lines = body ? wrap(ctx, body, w - 120).slice(-11) : [];
    const caretOn = Math.floor(time * 2) % 2 === 0;
    if (!body) {
      ctx.fillStyle = "#b3aa9c";
      ctx.fillText("Your message appears here as you type it…", 48, 300);
    }
    let lastX = 48;
    let lastY = 300;
    lines.forEach((line, i) => {
      lastY = 300 + i * 36;
      ctx.fillStyle = "#1c1a17";
      ctx.fillText(line, 48, lastY);
      lastX = 48 + ctx.measureText(line).width;
    });
    if (caretOn) {
      ctx.fillStyle = "#e2502c";
      ctx.fillRect(body ? lastX + 3 : 48, lastY - 22, 2.5, 30);
    }

    ctx.fillStyle = body ? "#e2502c" : "#d8cfc1";
    roundRect(ctx, w - 190, h - 82, 142, 50, 25);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = `600 20px ${SANS}`;
    ctx.textAlign = "center";
    ctx.fillText("Send", w - 119, h - 50);
    ctx.textAlign = "left";

    // Once the form is sent: a quiet confirmation over the mail
    if (mail.sent) {
      ctx.fillStyle = "rgba(246,243,238,0.94)";
      ctx.fillRect(0, 64, w, h - 64);
      ctx.strokeStyle = "#2f9e5b";
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(w / 2, h / 2 - 30, 54, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w / 2 - 24, h / 2 - 30);
      ctx.lineTo(w / 2 - 6, h / 2 - 12);
      ctx.lineTo(w / 2 + 26, h / 2 - 48);
      ctx.stroke();
      ctx.fillStyle = "#1c1a17";
      ctx.font = `600 34px ${SANS}`;
      ctx.textAlign = "center";
      ctx.fillText("Message sent", w / 2, h / 2 + 70);
      ctx.fillStyle = "#6f675d";
      ctx.font = `400 22px ${SANS}`;
      ctx.fillText("Thank you. I'll get back to you soon.", w / 2, h / 2 + 108);
      ctx.textAlign = "left";
    } else if (mail.failed) {
      // It didn't go through: say so, and where to write instead
      ctx.fillStyle = "rgba(246,243,238,0.94)";
      ctx.fillRect(0, 64, w, h - 64);
      ctx.strokeStyle = "#d4472a";
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(w / 2, h / 2 - 30, 54, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w / 2 - 20, h / 2 - 50);
      ctx.lineTo(w / 2 + 20, h / 2 - 10);
      ctx.moveTo(w / 2 + 20, h / 2 - 50);
      ctx.lineTo(w / 2 - 20, h / 2 - 10);
      ctx.stroke();
      ctx.fillStyle = "#1c1a17";
      ctx.font = `600 34px ${SANS}`;
      ctx.textAlign = "center";
      ctx.fillText("Not sent", w / 2, h / 2 + 70);
      ctx.fillStyle = "#6f675d";
      ctx.font = `400 22px ${SANS}`;
      ctx.fillText("Write to yassinecherni9@gmail.com instead", w / 2, h / 2 + 108);
      ctx.textAlign = "left";
    }
  };

  const now = () => performance.now() / 1000;
  const view = { key: "editor", previous: null, previousKey: null, switchedAt: 0 };
  const drawView = (ctx, w, h, key, data, time) => {
    if (key === "editor") drawEditor(ctx, w, h, time);
    else if (key === "mail") drawMail(ctx, w, h, data, time);
    else drawBrowser(ctx, w, h, data, 1);
  };

  return {
    width: 1280,
    height: 720,
    // What the monitor shows: { project } in the work section, { mail } in contact, else the editor.
    setContent({ project, mail }) {
      const key = project ? `project:${project.title}` : mail ? "mail" : "editor";
      if (project) loadImage(project.image);
      if (key !== view.key) {
        view.previousKey = view.key;
        view.previous = view.data;
        view.key = key;
        view.switchedAt = now();
        if (project) state.project = { ...project, since: now() };
      }
      view.data = project ? state.project : mail;
    },
    draw(ctx, w, h, time, dt) {
      advance(dt);
      const fade = Math.min(1, (now() - view.switchedAt) / 0.45);
      if (fade < 1 && view.previousKey) {
        drawView(ctx, w, h, view.previousKey, view.previous, time);
        ctx.globalAlpha = fade;
      }
      drawView(ctx, w, h, view.key, view.data, time);
      ctx.globalAlpha = 1;
    },
  };
};

// ---------------------------------------------------------------------------------------------
// MacBook: a terminal running the platform's build and deploy, line by line.

const SESSION = [
  ["$", "git pull --rebase"],
  ["", "Already up to date."],
  ["$", "docker compose up -d"],
  ["ok", "Container postgres-auth        Started"],
  ["ok", "Container rabbitmq             Started"],
  ["ok", "Container minio                Started"],
  ["ok", "Container eureka-server        Healthy"],
  ["ok", "Container auth-service         Started"],
  ["ok", "Container programme-service    Started"],
  ["ok", "Container candidature-service  Started"],
  ["ok", "Container pitch-media-service  Started"],
  ["ok", "Container api-gateway          Started"],
  ["$", "npm run build --prefix frontend/nextjs-frontoffice"],
  ["", "  ▲ Next.js 14.2.5"],
  ["", "  Creating an optimized production build ..."],
  ["ok", "Compiled successfully"],
  ["$", "git push origin main"],
  ["", "To github.com:yassinecher/Medianet.git"],
  ["", "   35e6f15..9c41a07  main -> main"],
];

export const createMacScreen = () => {
  const state = { line: 0, chars: 0, wait: 0.5, done: false };
  return {
    width: 1024,
    height: 640,
    draw(ctx, w, h, time, dt) {
      if (state.wait > 0) {
        state.wait -= dt;
      } else if (state.done) {
        // Hold the finished session for a moment, then start over
        Object.assign(state, { line: 0, chars: 0, wait: 0.6, done: false });
      } else {
        const current = SESSION[state.line];
        if (current[0] === "$" && state.chars < current[1].length) {
          state.chars += dt * 22;
        } else if (state.line < SESSION.length - 1) {
          state.line += 1;
          state.chars = 0;
          state.wait = SESSION[state.line][0] === "$" ? 1.1 : 0.12 + Math.random() * 0.25;
        } else {
          state.done = true;
          state.wait = 4;
        }
      }

      ctx.fillStyle = "#16161a";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#26262c";
      ctx.fillRect(0, 0, w, 44);
      ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(24 + i * 22, 22, 7, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = "#a1a1aa";
      ctx.font = `500 16px ${SANS}`;
      ctx.textAlign = "center";
      ctx.fillText("yassine@studio: ~/medianet", w / 2, 28);
      ctx.textAlign = "left";

      ctx.font = `500 19px ${MONO}`;
      const visible = SESSION.slice(0, state.line + 1);
      const lineH = 30;
      const maxLines = Math.floor((h - 70) / lineH);
      const start = Math.max(0, visible.length - maxLines);
      visible.slice(start).forEach(([kind, text], i) => {
        const y = 78 + i * lineH;
        const isCurrent = start + i === state.line;
        const shown = kind === "$" && isCurrent ? text.slice(0, Math.floor(state.chars)) : text;
        if (kind === "$") {
          ctx.fillStyle = "#e2502c";
          ctx.fillText("❯", 20, y);
          ctx.fillStyle = "#f4f4f5";
          ctx.fillText(shown, 46, y);
          if (isCurrent && Math.floor(time * 2) % 2 === 0) {
            ctx.fillRect(46 + ctx.measureText(shown).width + 2, y - 17, 11, 22);
          }
        } else if (kind === "ok") {
          ctx.fillStyle = "#4ade80";
          ctx.fillText("✔", 20, y);
          ctx.fillStyle = "#d4d4d8";
          ctx.fillText(text, 46, y);
        } else {
          ctx.fillStyle = "#a1a1aa";
          ctx.fillText(text, 20, y);
        }
      });
    },
  };
};

// ---------------------------------------------------------------------------------------------
// TV: a DVD-style bouncing logo that changes colour on every wall, and celebrates corners.

const LOGO_COLORS = ["#e2502c", "#f2b134", "#5fb0e5", "#7bc47f", "#c084fc", "#f472b6"];

export const createTvScreen = () => {
  const s = { x: 120, y: 90, vx: 150, vy: 105, color: 0, flash: 0 };
  return {
    width: 1024,
    height: 576,
    draw(ctx, w, h, time, dt) {
      const lw = 230;
      const lh = 120;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      let hits = 0;
      if (s.x < 0 || s.x + lw > w) {
        s.vx *= -1;
        s.x = Math.max(0, Math.min(s.x, w - lw));
        hits++;
      }
      if (s.y < 0 || s.y + lh > h) {
        s.vy *= -1;
        s.y = Math.max(0, Math.min(s.y, h - lh));
        hits++;
      }
      if (hits) s.color = (s.color + 1) % LOGO_COLORS.length;
      if (hits === 2) s.flash = 1.5;
      s.flash = Math.max(0, s.flash - dt);

      ctx.fillStyle = "#08080a";
      ctx.fillRect(0, 0, w, h);
      const color = LOGO_COLORS[s.color];
      ctx.strokeStyle = color;
      ctx.lineWidth = 6;
      roundRect(ctx, s.x, s.y, lw, lh, 18);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = `italic 400 76px "Instrument Serif", Georgia, serif`;
      ctx.textAlign = "center";
      ctx.fillText("Yassine", s.x + lw / 2, s.y + 74);
      ctx.font = `600 16px ${MONO}`;
      ctx.fillText("FULL-STACK", s.x + lw / 2, s.y + 102);
      ctx.textAlign = "left";
      if (s.flash > 0) {
        ctx.fillStyle = `rgba(255,255,255,${Math.min(0.5, s.flash / 3)})`;
        ctx.font = `700 40px ${SANS}`;
        ctx.textAlign = "center";
        ctx.fillText("CORNER!", w / 2, h / 2);
        ctx.textAlign = "left";
      }
    },
  };
};
