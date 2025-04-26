precision highp float;

uniform mat4 worldViewProjection;
uniform float time;
uniform float windSpeed;
uniform vec2 wave1Values;
uniform vec2 wave2Values;
uniform vec2 wave3Values;

attribute vec3 position;
varying vec3 waveNormal;

float wave(float frequency, float height, float previousWaveX) {
	return exp2(sin(previousWaveX * position.x * frequency + time * windSpeed) * height +
		cos(position.z * frequency + time * windSpeed) * height) * 0.5;
}

float partialDerivativeX(float frequency, float h) {
	float a = position.x * frequency + time;
	float b = position.z * frequency + time;
	float wave = exp2(h * (sin(a) + cos(b))) * 0.5;
	return wave * log(2.0) * h * frequency * cos(a);
}

float partialDerivativeZ(float frequency, float h) {
	float a = position.x * frequency + time;
	float b = position.z * frequency + time;
	float wave = exp2(h * (sin(a) + cos(b))) * 0.5;
	return wave * log(2.0) * (-h * frequency * sin(b));
}

void main() {
	// Chatgpt cook here idk calculus so yeah
	float derivativeX = partialDerivativeX(wave1Values.x, wave1Values.y) + partialDerivativeX(wave2Values.x, wave2Values.y) + partialDerivativeX(wave3Values.x, wave3Values.y);
	float derivativeZ = partialDerivativeZ(wave1Values.x, wave1Values.y) + partialDerivativeZ(wave2Values.x, wave2Values.y) + partialDerivativeZ(wave3Values.x, wave3Values.y);
	waveNormal = normalize(vec3(derivativeX, -1, derivativeZ));

	float wave1 = wave(wave1Values.x, wave1Values.y, derivativeX);
	float wave2 = wave(wave2Values.x, wave2Values.y, derivativeX);
	float wave3 = wave(wave3Values.x, wave3Values.y, derivativeX);
	float displacement = wave1 + wave2 + wave3;

	vec3 wavePosition = vec3(position.x, position.y + displacement, position.z);
	gl_Position = worldViewProjection * vec4(wavePosition, 1);
}