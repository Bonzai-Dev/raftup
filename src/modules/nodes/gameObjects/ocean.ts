import { DirectionalLight, MeshBuilder, ShaderMaterial, Vector4 } from "@babylonjs/core";
import Game from "@/modules/game";
import oceanVertexShader from "@/assets/shaders/ocean/ocean.vert";
import oceanFragmentShader from "@/assets/shaders/ocean/ocean.frag";

export default class Ocean {
  constructor() {
    const scene = Game.getInstance().getScene();
    const directionalLight = scene.lights.find((light) => light instanceof DirectionalLight);

    const shaderMaterial = new ShaderMaterial("oceanShader", scene, {
      vertexSource: oceanVertexShader,
      fragmentSource: oceanFragmentShader,
    }, {
      attributes: ["position", "normal"],
      uniforms: ["worldViewProjection", "uTime", "uBaseColor", "lightDirection"],
    });

    const mesh = MeshBuilder.CreateGround("ocean", {
      width: 1000,
      height: 1000,
      subdivisions: 1000,
    });
    mesh.position.y = -0.5;
    mesh.material = shaderMaterial;

    let totalTime = 0;
    shaderMaterial.setVector4("uBaseColor", new Vector4(0.1, 0.2, 0.3, 1));
    scene.registerBeforeRender(() => {
      totalTime += scene.getEngine().getDeltaTime() / 1000; 
      shaderMaterial.setFloat("uTime", totalTime); 
      shaderMaterial.setVector3("lightDirection", directionalLight!.direction!.normalize()); 
    });
  }
}
