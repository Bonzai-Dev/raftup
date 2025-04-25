import {
  Vector3,
  PhysicsShapeType,
  HemisphericLight,
  DirectionalLight,
  StandardMaterial,
  Color3,
  CreateSoundAsync,
  CreateAudioEngineAsync,
} from "@babylonjs/core";
import "@babylonjs/inspector";
import { Control, Image } from "@babylonjs/gui";
import { tags } from "@/config";
import Scene, { SceneParameters } from "./scene";
import Game from "@/modules/game";
import Ocean from "@/modules/nodes/gameObjects/ocean";
import Mesh from "@/modules/nodes/gameObjects/meshes/mesh";
import Player from "@/modules/nodes/gameObjects/player";
import Radio from "../nodes/gameObjects/meshes/radio";
import { toRad } from "@mathigon/euclid";

export default class Test extends Scene {
  constructor(parameters: SceneParameters) {
    super({ engine: parameters.engine, canvas: parameters.canvas, debugMode: true });
  }

  protected override async scene() {
    const transparentMaterial = new StandardMaterial("transparentMaterial", this);
    transparentMaterial.diffuseColor = new Color3(1, 0, 0);
    transparentMaterial.alpha = 0.5;

    const gui = Game.getInstance().getGui();
    const image = new Image("cursor", "/src/assets/cursor.svg");
    image.width = "5px";
    image.height = "5px";
    image.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    image.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    image.isPointerBlocker = false;
    gui.addControl(image);

    const hemisphericLight = new HemisphericLight("HemisphericLight", new Vector3(1, 1, 0), this);
    hemisphericLight.intensity = 0.6;
    const directionalLight = new DirectionalLight("DirectionalLight", new Vector3(0.447, -0.895, 0), this);
    directionalLight.position = new Vector3(0, 10, 0);
    directionalLight.intensity = 0.3;

    new Ocean();

    new Mesh("/src/assets/models/raft.glb", "raft", {
      collider: PhysicsShapeType.BOX,
      position: new Vector3(0, -10, 0),
      physicsMaterial: { mass: 5000, restitution: 0, friction: 1 },
      tags: [tags.floating],
    });

    new Radio(new Vector3(-2, -10, -0.5), new Vector3(0, toRad(15), 0));

    new Mesh("/src/assets/models/plasticChair.glb", "plasticChair", {
      collider: PhysicsShapeType.BOX,
      position: new Vector3(-2, -5, -3),
      rotation: new Vector3(0, toRad(-45), 0),
      physicsMaterial: { mass: 50, restitution: 0, friction: 1 },
      tags: [tags.floating, tags.pickable],
    });

    new Mesh("/src/assets/models/trash/constructionBarrel.glb", "constructionBarrel", {
      collider: PhysicsShapeType.CYLINDER,
      position: new Vector3(5, -10, 5),
      physicsMaterial: { mass: 50, restitution: 0, friction: 1 },
      tags: [tags.floating, tags.pickable],
    });

    new Mesh("/src/assets/models/trash/plasticBarrel.glb", "plasticBarrel", {
      collider: PhysicsShapeType.CYLINDER,
      position: new Vector3(-5, -10, 5),
      physicsMaterial: { mass: 50, restitution: 0, friction: 1 },
      tags: [tags.floating, tags.pickable],
    });

    new Mesh("/src/assets/models/trash/briefcase.glb", "briefcase", {
      collider: PhysicsShapeType.BOX,
      position: new Vector3(1, -10, -2.5),
      rotation: new Vector3(0, toRad(-45), 0),
      physicsMaterial: { mass: 50, restitution: 0, friction: 1 },
      tags: [tags.floating, tags.pickable],
    });

    new Player(new Vector3(0, 2, 0));
  }

  protected override async loadAudio() {
    this.audioEngine = await CreateAudioEngineAsync({
      volume: 0.5,
      listenerAutoUpdate: true,
      listenerEnabled: true,
    });

    const music = await CreateSoundAsync("music", "/src/assets/sounds/funkyRadioMix.wav", {
      spatialEnabled: true,
      spatialAutoUpdate: true,
      loop: true,
      spatialDistanceModel: "linear",
      spatialMaxDistance: 20,
    });

    music.spatial.attach(this.getMeshById("radio"));
    await this.audioEngine.unlockAsync();

    this.audioEngine.listener.attach(this.activeCamera);

    music.play({ loop: true });
  }
}
