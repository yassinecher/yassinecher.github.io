// Tiny line-based syntax highlighter shared by the 3D code screen and the case-study pages.

const KEYWORDS = {
  java: "public private protected class interface return new if else for while final static void double int long boolean null true false this extends implements import package try catch throw",
  python: "def return if elif else for in import from as class None True False and or not with try except raise global",
  ts: "const let var function return if else for of in new class extends import from export default async await this null undefined true false type interface",
  yaml: "",
};

export const TOKEN_COLORS = {
  plain: "#d4d4d8",
  keyword: "#c792ea",
  string: "#c3e88d",
  comment: "#6b7280",
  number: "#f78c6c",
  annotation: "#fbbf24",
  type: "#82aaff",
  key: "#89ddff",
};

const RULES = [
  { type: "comment", re: /^(\/\/.*|#.*)/ },
  { type: "string", re: /^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/ },
  { type: "annotation", re: /^@[A-Za-z_][\w.]*/ },
  { type: "number", re: /^\d+(\.\d+)?/ },
  { type: "word", re: /^[A-Za-z_$][\w$]*/ },
  { type: "plain", re: /^\s+/ },
  { type: "plain", re: /^./ },
];

export function tokenizeLine(line, lang) {
  if (lang === "yaml") {
    const m = line.match(/^(\s*-?\s*)([\w.-]+)(:)(.*)$/);
    if (m) {
      const rest = m[4];
      const isComment = rest.trim().startsWith("#");
      return [
        { text: m[1], type: "plain" },
        { text: m[2], type: "key" },
        { text: m[3], type: "plain" },
        { text: rest, type: isComment ? "comment" : "string" },
      ];
    }
    if (line.trim().startsWith("#")) return [{ text: line, type: "comment" }];
    return [{ text: line, type: "string" }];
  }

  const keywords = new Set((KEYWORDS[lang] || KEYWORDS.ts).split(" "));
  const tokens = [];
  let rest = line;
  while (rest.length) {
    for (const rule of RULES) {
      const m = rest.match(rule.re);
      if (!m) continue;
      let type = rule.type;
      if (type === "word") {
        if (keywords.has(m[0])) type = "keyword";
        else if (/^[A-Z]/.test(m[0])) type = "type";
        else type = "plain";
      }
      tokens.push({ text: m[0], type });
      rest = rest.slice(m[0].length);
      break;
    }
  }
  return tokens;
}
