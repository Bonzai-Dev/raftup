precision highp float;

uniform mat4 worldViewProjection;
uniform float time;
uniform vec2 wave1Values;
uniform vec2 wave2Values;
uniform vec2 wave3Values;

attribute vec3 position;
varying vec3 waveNormal;
varying vec3 wavePosition;

float wave(float speed, float height) {
	return sin(position.x * speed + time) * height;
}

void main() {
	float wave1 = wave(wave1Values.x, wave1Values.y);
	float wave2 = wave(wave2Values.x, wave2Values.y);
	float wave3 = wave(wave3Values.x, wave3Values.y);
	float displacement = wave1 + wave2 + wave3;

	// Chatgpt cook idk calculus so yeah
	float dhdx = wave1Values.y * wave1Values.x * cos(position.x * wave1Values.x + time) +
		wave2Values.y * wave2Values.x * cos(position.x * wave2Values.x + time) +
		wave3Values.y * wave3Values.x * cos(position.x * wave3Values.x + time);
	float dhdz = wave1Values.y * wave1Values.x * cos(position.z * wave1Values.x + time) +
		wave2Values.y * wave2Values.x * cos(position.z * wave2Values.x + time) +
		wave3Values.y * wave3Values.x * cos(position.z * wave3Values.x + time);

	vec3 tangentX = vec3(1.0, dhdx, 0.0);
	vec3 tangentZ = vec3(0.0, 0, 1.0);

	waveNormal = normalize(cross(tangentX, tangentZ));
	wavePosition = vec3(position.x, position.y + displacement, position.z);
	gl_Position = worldViewProjection * vec4(wavePosition, 1.0);
}