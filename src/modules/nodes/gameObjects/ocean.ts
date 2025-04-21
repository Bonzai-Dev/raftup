import { MeshBuilder, ShaderMaterial } from "@babylonjs/core";
import Game from "@/modules/game";
import oceanVertexShader from "@/assets/shaders/ocean/ocean.vert";
import oceanFragmentShader from "@/assets/shaders/ocean/ocean.frag";

export default class Ocean {
  constructor() {
    const scene = Game.getInstance().getScene();

    const shaderMaterial = new ShaderMaterial("oceanShader", scene, {
      vertexSource: oceanVertexShader,
      fragmentSource: oceanFragmentShader,
    }, {
      attributes: ["position", "uv"],
      uniforms: ["worldViewProjection", "uniformTime"],
    });

    const mesh = MeshBuilder.CreateGround("ocean", {
      width: 1000,
      height: 1000,
      subdivisions: 50,
    });
    mesh.position.y = -0.5;
    mesh.material = shaderMaterial;

    let totalTime = 0;
    scene.registerBeforeRender(() => {
      const deltaTime = scene.getEngine().getDeltaTime() / 1000; 
      totalTime += deltaTime; 
      shaderMaterial.setFloat("uniformTime", totalTime); 
      console.log("uniformTime", totalTime);
    });
  }
}
