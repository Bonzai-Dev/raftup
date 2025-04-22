precision highp float;

uniform vec3 lightDirection;
uniform vec3 baseColor;
uniform vec3 cameraPosition;
uniform float shininess;
uniform float specularStrength;

varying vec3 waveNormal;
varying vec3 displacedPosition;

float lambertDiffuse() {
	return max(0.0, dot(normalize(lightDirection), normalize(waveNormal)));
}

void main() {
	vec3 lookDirection = normalize(cameraPosition - displacedPosition);
	vec3 halfwayDirection = normalize(lightDirection + lookDirection);

	float specularValue = pow(max(dot(waveNormal, halfwayDirection), 0.0), shininess);
	vec3 specular = vec3(1.) * specularValue;

	gl_FragColor = vec4(baseColor.rgb * lambertDiffuse() + specular * specularStrength, 1);
}