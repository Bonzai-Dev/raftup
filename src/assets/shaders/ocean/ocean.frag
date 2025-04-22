precision highp float;

uniform vec3 lightDirection;
uniform vec4 uBaseColor;

varying vec3 vNormal;

float lambertDiffuse(vec3 lightDirection, vec3 surfaceNormal) {
  return max(0.0, dot(lightDirection, surfaceNormal));
}

void main() {
  gl_FragColor = lambertDiffuse(lightDirection, vNormal) * uBaseColor;
}