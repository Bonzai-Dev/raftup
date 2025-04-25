import { Color3, DirectionalLight, MeshBuilder, ShaderMaterial, Vector2, Vector3 } from "@babylonjs/core";
import Game from "@/modules/game";
import oceanVertexShader from "@/public/assets/shaders/ocean/ocean.vert";
import oceanFragmentShader from "@/public/assets/shaders/ocean/ocean.frag";
import { physics, tags } from "@/config";

export default class Ocean {
  private totalTime = 0;
  // Wave values, X for frequency, Y for height
  private readonly wave1Values = new Vector2(0.1, 0.1); // 0.6, 0.8
  private readonly wave2Values = new Vector2(0.1, 0.1); // 0.2, 1
  private readonly wave3Values = new Vector2(0.1, 0.1); // 0.3, 0.5

  private readonly baseColor = new Color3(0, 0.506, 0.62);
  private readonly ambientColor = new Color3(0.212, 0.314, 0.322);

  private readonly windSpeed = 5;
  private readonly specularStrength = 0.14;
  private readonly shininess = 15;
  private readonly oceanPositionY = -10;

  constructor() {
    const scene = Game.getInstance().getScene();
    const directionalLight = scene.lights.find((light) => light instanceof DirectionalLight);
    const camera = scene.getCamera();

    const oceanShader = new ShaderMaterial(
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
          "ambientColor",
          "cameraPosition",
          "shininess",
          "specularStrength",
          "lightPosition",
          "windSpeed",
          "wave1Values",
          "wave2Values",
          "wave3Values",
        ],
      }
    );

    const mesh = MeshBuilder.CreateGround("ocean", {
      width: 300,
      height: 300,
      subdivisions: 800,
    });
    mesh.position.y = this.oceanPositionY;
    mesh.material = oceanShader;
    mesh.isPickable = false;

    oceanShader.setFloat("shininess", this.shininess);
    oceanShader.setFloat("specularStrength", this.specularStrength);
    oceanShader.setFloat("windSpeed", this.windSpeed);

    oceanShader.setVector3("lightPosition", directionalLight!.position!);

    oceanShader.setVector2("wave1Values", this.wave1Values);
    oceanShader.setVector2("wave2Values", this.wave2Values);
    oceanShader.setVector2("wave3Values", this.wave3Values);

    oceanShader.setColor3("baseColor", this.baseColor);
    oceanShader.setColor3("ambientColor", this.ambientColor);

    scene.registerBeforeRender(() => {
      this.totalTime += scene.getEngine().getDeltaTime() / 1000;
      oceanShader.setFloat("time", this.totalTime);
      oceanShader.setVector3("lightDirection", directionalLight!.direction!.normalize());
      oceanShader.setVector3("cameraLookDirection", camera.getDirection(Vector3.Forward()));

      const floatingObjects = scene.getMeshesByTags(tags.floating);
      for (let objectIndex = 0; objectIndex < floatingObjects.length; objectIndex++) {
        const object = floatingObjects[objectIndex];
        const objectPosition = object.getAbsolutePosition();
        const wave1 = this.wave(this.wave1Values.x, this.wave1Values.y, objectPosition, objectPosition.x);
        const wave2 = this.wave(this.wave2Values.x, this.wave2Values.y, objectPosition, objectPosition.x);
        const wave3 = this.wave(this.wave3Values.x, this.wave3Values.y, objectPosition, objectPosition.x);

        const partialDerivativeX = this.partialDerivativeX(this.wave1Values.x, this.wave1Values.y, objectPosition);
        const partialDerivativeZ = this.partialDerivativeZ(this.wave1Values.x, this.wave1Values.y, objectPosition);

        const physicsBody = object.physicsBody!;
        const normal = this.waveNormal(partialDerivativeX, partialDerivativeZ);
        const targetY = wave1 + wave2 + wave3 + 0.5 - Math.abs(this.oceanPositionY);

        const depth = Math.max(0, targetY - objectPosition.y);
        physicsBody.applyForce(
          physics.gravity.scale(depth * physicsBody.getMassProperties().mass!).negate(),
          objectPosition
        );

        physicsBody.setLinearDamping(0.4);
        physicsBody.setAngularVelocity(new Vector3(normal.x, 0, normal.z).scale(depth));
        physicsBody.setLinearVelocity(new Vector3(0, physicsBody.getLinearVelocity().y, 0));
      }
    });
  }

  private waveNormal(derivativeX: number, derivativeZ: number) {
    return new Vector3(derivativeX, -1, derivativeZ).normalize();
  }

  private wave(frequency: number, height: number, wavePosition: Vector3, previousWaveX: number) {
    return (
      Math.pow(
        2,
        Math.sin(previousWaveX * wavePosition.x * frequency + this.totalTime * this.windSpeed) * height +
          Math.cos(wavePosition.z * frequency + this.totalTime * this.windSpeed) * height
      ) * 0.5
    );
  }

  private partialDerivativeX(frequency: number, h: number, wavePosition: Vector3) {
    const a = wavePosition.x * frequency + this.totalTime;
    const b = wavePosition.z * frequency + this.totalTime;
    const wave = Math.pow(2, h * (Math.sin(a) + Math.cos(b))) * 0.5;
    return wave * Math.log(2.0) * h * frequency * Math.cos(a);
  }

  private partialDerivativeZ(frequency: number, h: number, wavePosition: Vector3) {
    const a = wavePosition.x * frequency + this.totalTime;
    const b = wavePosition.z * frequency + this.totalTime;
    const wave = Math.pow(2, h * (Math.sin(a) + Math.cos(b))) * 0.5;
    return wave * Math.log(2.0) * (-h * frequency * Math.sin(b));
  }
}
