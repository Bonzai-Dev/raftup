import { Color3, Color4, DirectionalLight, MeshBuilder, ShaderMaterial, Vector2, Vector4 } from "@babylonjs/core";
import Game from "@/modules/game";
import oceanVertexShader from "@/assets/shaders/ocean/ocean.vert";
import oceanFragmentShader from "@/assets/shaders/ocean/ocean.frag";

export default class Ocean {
  constructor() {
    const scene = Game.getInstance().getScene();
    const directionalLight = scene.lights.find((light) => light instanceof DirectionalLight);
    const camera = scene.getCamera();

    const shaderMaterial = new ShaderMaterial(
      "oceanShader",
      scene,
      {
        vertexSource: oceanVertexShader,
        fragmentSource: oceanFragmentShader,
      },
      {
        attributes: ["position", "normal"],
        uniforms: [
          "worldViewProjection",
          "time",
          "lightDirection",
          "baseColor",
          "cameraPosition",
          "shininess",
          "specularStrength",
          "wave1Values",
          "wave2Values",
          "wave3Values",
        ],
      }
    );

    const mesh = MeshBuilder.CreateGround("ocean", {
      width: 40,
      height: 40,
      subdivisions: 1000,
    });
    mesh.position.y = -0.5;
    mesh.material = shaderMaterial;

    let totalTime = 0;
    shaderMaterial.setColor3("baseColor", new Color3(0.247, 0.278, 0.988));
    shaderMaterial.setVector2("wave1Values", new Vector2(0.6, 0.2));
    shaderMaterial.setVector2("wave2Values", new Vector2(0.2, 0.5));
    shaderMaterial.setVector2("wave3Values", new Vector2(0.3, 0.2));
    shaderMaterial.setFloat("shininess", 1);
    shaderMaterial.setFloat("specularStrength", 0.8);

    scene.registerBeforeRender(() => {
      totalTime += scene.getEngine().getDeltaTime() / 1000;
      shaderMaterial.setFloat("time", totalTime);
      shaderMaterial.setVector3("lightDirection", directionalLight!.direction!.normalize());
      shaderMaterial.setVector3("cameraPosition", camera.position);
    });
  }
}
