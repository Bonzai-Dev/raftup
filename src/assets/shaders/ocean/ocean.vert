// precision highp float;

// attribute vec3 position;
// attribute vec3 normal;

// uniform mat4 worldViewProjection;
// uniform float uTime;
// uniform mat4 world;

// varying vec3 vNormal;
// varying vec3 vPosition;

// float wave(float waveLength, float amplitude) {
// 	float frequency = 2. / waveLength;
// 	return amplitude * sin(position.x * waveLength + uTime * frequency);
// }

// // void main() {
// // 	float wave1 = wave(0.3, 2.);
// // 	float wave2 = wave(0.8, 5.);
// // 	float wave3 = wave(0.25, 3.5);

// // 	float dispalcement = wave1 + wave2 + wave3;
// // 	vec3 dx = vec3(1.0, wave(0.3, 2.0, position.x + 0.01, position.z) - wave1 +
// // 		wave(0.8, 5.0, position.x + 0.01, position.z) - wave2 +
// // 		wave(0.25, 3.5, position.x + 0.01, position.z) - wave3, 0.0);

// // 	vec3 dz = vec3(0.0, wave(0.3, 2.0) - wave1 +
// // 		wave(0.8, 5.0) - wave2 +
// // 		wave(0.25, 3.5) - wave3, 1.0);

// // 	vec3 normal = normalize(cross(dz, dx));
// // 	vNormal = normal; 

// // 	vec3 pos = vec3(position.x, position.y + displacement, position.z);
// // 	gl_Position = worldViewProjection * vec4(pos, 1.0);
// // }

precision highp float;

attribute vec3 position;
uniform mat4 worldViewProjection;
uniform float uTime;
varying vec3 vNormal;

// Function to calculate wave displacement
float wave(float speed, float height) {
	return sin(position.x * speed + uTime) * height + cos(position.z * speed + uTime) * height;
}

void main() {
	float wave1 = wave(0.3, 2.0);
	float wave2 = wave(0.8, 5.0);
	float wave3 = wave(0.25, 3.5);
	float displacement = wave1 + wave2 + wave3;

	float dhdx = cos(position.x * 0.3 + uTime) * (0.3 * 2.0) + cos(position.x * 0.8 + uTime) * (0.8 * 5.0) + cos(position.x * 0.25 + uTime) * (0.25 * 3.5);

    // ∂/∂z[ cos(pos.z*s + t)*H ] = –sin(pos.z*s + t) * s * H
	float dhdz = -sin(position.z * 0.3 + uTime) * (0.3 * 2.0) - sin(position.z * 0.8 + uTime) * (0.8 * 5.0) - sin(position.z * 0.25 + uTime) * (0.25 * 3.5);

    // 3) Build tangent vectors in local space
	vec3 tX = vec3(1.0, dhdx, 0.0);
	vec3 tZ = vec3(0.0, dhdz, 1.0);

    // 4) Cross‐product gives the unscaled normal
	vNormal = normalize(cross(tZ, tX));

	vec3 pos = vec3(position.x, position.y + displacement, position.z);
	gl_Position = worldViewProjection * vec4(pos, 1.0);
}

// void main() {
//   vec3 pos = position;
// 	float wave1 = wave(0.3, 2.0);
// 	float wave2 = wave(0.8, 5.0);
// 	float wave3 = wave(0.25, 3.5);
// 	float displacement = wave1 + wave2 + wave3;

//   vec4 worldPosition = world * vec4(pos, 1.0);
//   vPosition = worldPosition.xyz;

//   mat3 normalMatrix = mat3(world);
//   vNormal = normalize(normalMatrix * normal);

// 	vec3 pos2 = vec3(position.x, position.y + displacement, position.z);
// 	gl_Position = worldViewProjection * vec4(pos2, 1.0);
// }
