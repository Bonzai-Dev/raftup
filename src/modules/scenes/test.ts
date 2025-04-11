import { PhysicsShapeType, MeshBuilder, Vector3, SpotLight, DirectionalLight, StandardMaterial, Color3 } from "@babylonjs/core";
import "@babylonjs/inspector";
import { toRad } from "@mathigon/euclid";
import Scene, { SceneParameters } from "./scene";
import GameObject from "@/modules/nodes/gameObjects/object";
import Player from "@/modules/nodes/gameObjects/player";

export default class Test extends Scene {
  constructor(parameters: SceneParameters) {
    super({ engine: parameters.engine, canvas: parameters.canvas, debugMode: true });
  }

  protected override scene() {
    this.camera.position = new Vector3(0, 0, -10);

    // const hemisphericLight = new HemisphericLight("HemisphericLight", new Vector3(1, 1, 0), this);
    // hemisphericLight.intensity = 0.6;
    const directionalLight = new DirectionalLight("DirectionalLight", new Vector3(-1, -2, -1), this);
    directionalLight.position = new Vector3(20, 10, 20);
    directionalLight.intensity = 0.3;
    directionalLight.shadowMinZ = 0.1; // Minimum Z bound for shadows
    directionalLight.shadowMaxZ = 100; // Maximum Z bound for shadows
    // directionalLight.autoCalcShadowZBounds = true;
    // directionalLight.autoUpdateExtends = true;

    const spotLight = new SpotLight("spotLight", new Vector3(0, 2, -4), new Vector3(0, -1, 1), toRad(43), 100, this);
    spotLight.intensity = 0.5;
    // spotLight.shadowMaxZ = 100;
    // spotLight.shadowMinZ = 0.1;
    const spotLight2 = new SpotLight("spotLight2", new Vector3(-10, 2, -4), new Vector3(0, -1, -1), toRad(43), 100, this);
    spotLight2.intensity = 0.5;

    new GameObject({
      mesh: MeshBuilder.CreatePlane("ground", { size: 500 }, this),
      collider: PhysicsShapeType.MESH,
      position: new Vector3(0, -6, 0),
      rotation: new Vector3(toRad(90), 0, 0),
    });

    new GameObject({
      mesh: MeshBuilder.CreateBox("pillar", { width: 0.5, height: 0.5, depth: 8 }, this),
      collider: PhysicsShapeType.MESH,
      position: new Vector3(0, -6, 0),
      rotation: new Vector3(toRad(90), 0, 0),
    });

    const transparentMaterial = new StandardMaterial("transparentMaterial", this);
    transparentMaterial.diffuseColor = new Color3(1, 0, 0); // Red color
    transparentMaterial.alpha = 0.5; // Set transparency (0 is fully transparent, 1 is opaque)
    new GameObject({
      mesh: MeshBuilder.CreateSphere("ball", { diameter: 2 }, this),
      collider: PhysicsShapeType.SPHERE,
      physicsMaterial: { mass: 1 },
      position: new Vector3(0, 5, 0),
      material: transparentMaterial, // Assign the transparent material
    });

    new GameObject({
      mesh: MeshBuilder.CreateSphere("ball2", { diameter: 2 }, this),
      collider: PhysicsShapeType.SPHERE,
      physicsMaterial: { mass: 1 },
      position: new Vector3(5, 5, 0),
    });

    new Player();
  }
}
