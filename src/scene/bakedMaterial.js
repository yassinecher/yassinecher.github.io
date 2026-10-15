import * as THREE from "three";

// Room lighting comes from two Blender bakes (day and night) mixed together, plus a light map
// whose RGB channels mark where the TV (red), desk lamp (green) and PC screen (blue) light falls.
// Approach from Bruno Simon's "My Room in 3D", which this room model comes from.

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uBakedDayTexture;
  uniform sampler2D uBakedNightTexture;
  uniform sampler2D uLightMapTexture;
  uniform float uNightMix;
  uniform vec3 uLightTvColor;
  uniform float uLightTvStrength;
  uniform vec3 uLightDeskColor;
  uniform float uLightDeskStrength;
  uniform vec3 uLightPcColor;
  uniform float uLightPcStrength;
  varying vec2 vUv;

  vec3 lighten(vec3 base, vec3 blend, float opacity) {
    return max(base, blend) * opacity + base * (1.0 - opacity);
  }

  void main() {
    vec3 day = texture2D(uBakedDayTexture, vUv).rgb;
    vec3 night = texture2D(uBakedNightTexture, vUv).rgb;
    vec3 color = mix(day, night, uNightMix);
    vec3 lightMap = texture2D(uLightMapTexture, vUv).rgb;

    color = lighten(color, uLightTvColor, lightMap.r * uLightTvStrength);
    color = lighten(color, uLightPcColor, lightMap.b * uLightPcStrength);
    color = lighten(color, uLightDeskColor, lightMap.g * uLightDeskStrength);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export const createBakedMaterial = ({ day, night, lightMap }) => {
  for (const texture of [day, night]) {
    texture.flipY = false;
    texture.encoding = THREE.sRGBEncoding;
  }
  lightMap.flipY = false;

  return new THREE.ShaderMaterial({
    uniforms: {
      uBakedDayTexture: { value: day },
      uBakedNightTexture: { value: night },
      uLightMapTexture: { value: lightMap },
      uNightMix: { value: 0 },
      uLightTvColor: { value: new THREE.Color("#ff115e") },
      uLightTvStrength: { value: 0 },
      uLightDeskColor: { value: new THREE.Color("#ff6700") },
      uLightDeskStrength: { value: 0 },
      uLightPcColor: { value: new THREE.Color("#0082ff") },
      uLightPcStrength: { value: 0 },
    },
    vertexShader,
    fragmentShader,
  });
};

// Full-strength light values at night (from the original scene).
export const NIGHT_LIGHTS = { tv: 1.47, desk: 1.9, pc: 1.4 };
