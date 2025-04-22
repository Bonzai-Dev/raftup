precision highp float;

uniform vec3 baseColor;
uniform vec3 ambientColor;

uniform vec3 lightDirection;
uniform vec3 cameraLookDirection;

uniform float shininess;
uniform float specularStrength;

varying vec3 waveNormal;

float lambertDiffuse() {
	return max(0.0, dot(normalize(lightDirection), normalize(waveNormal)));
}

void main() {
	vec3 halfwayDirection = normalize(lightDirection + cameraLookDirection);

	float diffuse = lambertDiffuse();
	vec3 specular = vec3(0.0);
	if(diffuse != 0.0) {
		float specularValue = pow(max(dot(waveNormal, halfwayDirection), 0.0), shininess);
		specular = vec3(1.0) * specularValue * specularStrength;
	}

	gl_FragColor = vec4(baseColor * diffuse + specular + ambientColor, 1.0);
}