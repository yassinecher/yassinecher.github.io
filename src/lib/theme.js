import { atom, useAtom, useAtomValue } from "jotai";
import { useEffect, useMemo } from "react";

// Daylight or evening, for the room and the whole site at once. Automatic (evening after 7pm in
// Tunis, and while the home page sits at the desk in the contact section) until the visitor uses
// the switch; from then on the switch decides, for the rest of the visit.
const KEY = "lights";
const NIGHT_PAPER = "#16130f";
const DAY_PAPER = "#f3eee5";

const readChoice = () => {
  try {
    const value = sessionStorage.getItem(KEY);
    return value === "day" || value === "night" ? value : null;
  } catch {
    return null;
  }
};

export const isTunisEvening = () => {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hour12: false, timeZone: "Africa/Tunis" }).format(new Date()));
  return hour >= 19 || hour < 6;
};

const lightChoiceAtom = atom(readChoice());
// Set by the home page while its evening scene (the contact section) is on screen
export const sceneEveningAtom = atom(false);

export const useLights = () => {
  const [choice, setChoice] = useAtom(lightChoiceAtom);
  const sceneEvening = useAtomValue(sceneEveningAtom);
  const tunisEvening = useMemo(isTunisEvening, []);
  const evening = choice ? choice === "night" : tunisEvening || sceneEvening;
  const toggle = () => {
    const next = evening ? "day" : "night";
    setChoice(next);
    try {
      sessionStorage.setItem(KEY, next);
    } catch {
      // Private mode: the choice still holds until the page is closed
    }
  };
  return { evening, toggle };
};

// Puts the current lights on <html data-theme>, which swaps the colour tokens in index.css.
// Colours ease over for a moment on a change instead of snapping.
export const ThemeSync = () => {
  const { evening } = useLights();
  useEffect(() => {
    const root = document.documentElement;
    const theme = evening ? "night" : "day";
    if (root.dataset.theme === theme) return;
    root.classList.add("theme-fade");
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", evening ? NIGHT_PAPER : DAY_PAPER);
    const id = setTimeout(() => root.classList.remove("theme-fade"), 900);
    return () => clearTimeout(id);
  }, [evening]);
  return null;
};
