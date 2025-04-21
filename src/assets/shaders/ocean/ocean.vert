precision highp float;

attribute vec3 position;
attribute vec2 uv;

uniform mat4 worldViewProjection;
uniform float uniformTime;

varying vec2 vUV;

void main() {
	float dispalcement = sin(uniformTime + position.x * 5.) * 5.;
	vec3 pos = vec3(position.x, position.y + dispalcement, position.z);
	gl_Position = worldViewProjection * vec4(pos, 5);

	vUV = uv;
}