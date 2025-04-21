precision highp float;

uniform float uniformTime;

void main(void) {
  gl_FragColor = vec4(abs(sin(uniformTime / 2.)), 0.7725, 0.0431, 1.0);
}
