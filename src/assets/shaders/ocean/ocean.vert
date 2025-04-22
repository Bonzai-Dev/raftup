precision highp float;

uniform mat4 worldViewProjection;
uniform float time;
uniform vec2 wave1Values;
uniform vec2 wave2Values;
uniform vec2 wave3Values;

attribute vec3 position;
varying vec3 waveNormal;

float wave(float speed, float height) {
	return pow(2., sin(position.x * speed + time) * height);
}

float partialDerivativeX(vec2 waveValues) {
	float speed = waveValues.x;
	float height = waveValues.y;
	float u = sin(position.x * speed + time) * height;
	float du_dx = cos(position.x * speed + time) * speed * height;
	return log(2.0) * pow(2.0, u) * du_dx;
}

float partialDerivativeZ(vec2 waveValues) {
	float speed = waveValues.x;
	float height = waveValues.y;
	float u = sin(position.z * speed + time) * height;
	float du_dz = cos(position.z * speed + time) * speed * height;
	return log(2.0) * pow(2.0, u) * du_dz;
}

void main() {
	float wave1 = wave(wave1Values.x, wave1Values.y);
	float wave2 = wave(wave2Values.x, wave2Values.y);
	float wave3 = wave(wave3Values.x, wave3Values.y);
	float displacement = wave1 + wave2 + wave3;

	// Chatgpt cook idk calculus so yeah
	float dhdx = partialDerivativeX(wave1Values) +
		partialDerivativeX(wave2Values) +
		partialDerivativeX(wave3Values);

	float dhdz = partialDerivativeZ(wave1Values) +
		partialDerivativeZ(wave2Values) +
		partialDerivativeZ(wave3Values);

	vec3 tangentX = vec3(1.0, dhdx, 0.0);
	vec3 tangentZ = vec3(0.0, dhdz, 1.0);
	waveNormal = normalize(cross(tangentX, tangentZ));

	vec3 wavePosition = vec3(position.x, position.y + displacement, position.z);
	gl_Position = worldViewProjection * vec4(wavePosition, 1.0);
}