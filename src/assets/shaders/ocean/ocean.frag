precision highp float;

uniform vec3 baseColor;
uniform vec3 ambientColor;

uniform vec3 lightDirection;
uniform vec3 cameraPosition;

uniform float shininess;
uniform float specularStrength;

varying vec3 waveNormal;
varying vec3 wavePosition;

float lambertDiffuse() {
	return max(0.0, dot(normalize(lightDirection), normalize(waveNormal)));
}

void main() {
	vec3 viewDir = normalize(cameraPosition - wavePosition);
	vec3 normal = normalize(waveNormal);
	vec3 halfwayDirection = normalize(lightDirection + viewDir);

	float diffuse = lambertDiffuse();

	vec3 specular = vec3(0.0);
	if(diffuse != 0.0) {
		float specularValue = pow(max(dot(normal, halfwayDirection), 0.0), shininess);
		specular = vec3(1.0) * specularValue * specularStrength;
	}

	vec3 finalColor = baseColor * diffuse + specular + ambientColor;
	gl_FragColor = vec4(finalColor, 1.0);
}