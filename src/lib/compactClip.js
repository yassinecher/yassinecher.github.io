import * as THREE from "three";

// Animation clips stored as compact JSON (see public/animations/typing.json): uniform frames at
// `fps`, one value array per track, single-key tracks marked with k: 1. Much smaller than the FBX
// it was exported from, and no FBX loader in the bundle.
export const parseCompactClip = (text) => {
  const data = JSON.parse(text);
  const frames = Math.round(data.duration * data.fps) + 1;
  const times = Float32Array.from({ length: frames }, (_, i) => i / data.fps);
  const tracks = data.tracks.map((track) => {
    const Track = track.t === "q" ? THREE.QuaternionKeyframeTrack : THREE.VectorKeyframeTrack;
    return new Track(track.n, track.k ? [0] : times, track.v);
  });
  return new THREE.AnimationClip(data.name, data.duration, tracks);
};

// Hold some bones still: their tracks keep the value at `time` for the whole clip. (Two identical
// keys rather than one, so the mixer keeps writing them every frame like any other track.)
export const freezeBones = (clip, bones, time) => {
  const frozen = new Set(bones);
  const tracks = clip.tracks.map((track) => {
    const bone = track.name.split(".")[0];
    if (!frozen.has(bone) || track.times.length === 1) return track;
    const value = Array.from(track.createInterpolant().evaluate(time));
    return new track.constructor(track.name, [0, clip.duration], [...value, ...value]);
  });
  return new THREE.AnimationClip(clip.name, clip.duration, tracks);
};
