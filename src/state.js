import { atom } from "jotai";

// Remembered across route changes so "Back" from a case study lands on the projects section.
// `at` makes every request distinct, so asking for the current section still scrolls to it.
export const homeSectionAtom = atom({ index: 0, at: 0 });

// The section currently on screen, reported by the 3D scene; drives the nav highlight and backdrop tint.
export const activeSectionAtom = atom(0);
