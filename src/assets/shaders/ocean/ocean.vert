#ifdef GL_ES
precision highp float;
#endif

// 1) Attributes from your mesh
attribute vec3 position;
attribute vec2 uv;

// 2) Uniforms injected by Babylon.js
uniform mat4 worldViewProjection;
uniform float time;

// 3) Varying to pass UV to the fragment stage
varying vec2 vUV;

void main(void) {
    // Example displacement
    vec3 pos = position;
    pos.y += sin(time + position.x * 0.1);

    // Crucial transform for rendering
    gl_Position = worldViewProjection * vec4(pos, 1.0);

    // Forward UVs
    vUV = uv;
}