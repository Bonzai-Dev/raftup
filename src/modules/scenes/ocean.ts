import {
  Vector3,
  PhysicsShapeType,
  HemisphericLight,
  DirectionalLight,
  StandardMaterial,
  Color3,
} from "@babylonjs/core";
import "@babylonjs/inspector";
import { Control, Image, TextBlock } from "@babylonjs/gui";
import { dayNightCycle, tags } from "@/config";
import Scene, { SceneParameters } from "./scene";
import OceanMesh from "@/modules/nodes/gameObjects/ocean";
import Mesh from "@/modules/nodes/gameObjects/meshes/mesh";
import Player from "@/modules/nodes/gameObjects/player";
import Radio from "@/modules/nodes/gameObjects/meshes/radio";
import { toRad } from "@mathigon/euclid";
import Game from "../game";

export default class Ocean extends Scene {
  protected startTime = 0;
  protected daysSurvived = 0;

  constructor(parameters: SceneParameters) {
    super({ engine: parameters.engine, canvas: parameters.canvas });
  }

  protected override async scene() {
    const transparentMaterial = new StandardMaterial("transparentMaterial", this);
    transparentMaterial.diffuseColor = new Color3(1, 0, 0);
    transparentMaterial.alpha = 0.5;

    const gui = this.gui;
    const image = new Image("cursor", "./assets/cursor.svg");
    image.width = "5px";
    image.height = "5px";
    image.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    image.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    image.isPointerBlocker = false;
    gui.addControl(image);

    const dayCount = new TextBlock("dayCount");
    dayCount.color = "white";
    dayCount.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT; 
    dayCount.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    dayCount.top = "50px";
    dayCount.left = "50px"; 
    gui.addControl(dayCount);

    const hemisphericLight = new HemisphericLight("HemisphericLight", new Vector3(1, 1, 0), this);
    hemisphericLight.intensity = 0.6;
    const directionalLight = new DirectionalLight("DirectionalLight", new Vector3(0.447, -0.895, 0), this);
    directionalLight.position = new Vector3(0, 10, 0);
    directionalLight.intensity = 0.3;
    
    this.onBeforeRenderObservable.add(() => {
      if (this.currentDayTime <= dayNightCycle.dayDuration) {
        this.currentDayTime += this.getEngine().getDeltaTime() / 1000;
      } else {
        this.currentDayTime = 0;
        this.daysSurvived += 1;
      }

      dayCount.text = `Days Survived: ${this.daysSurvived}`;
    });

    new OceanMesh();

    new Mesh("./assets/models/raft.glb", "raft", {
      collider: PhysicsShapeType.BOX,
      position: new Vector3(0, -10, 0),
      physicsMaterial: { mass: 5000, restitution: 0, friction: 1 },
      tags: [tags.floating],
    });

    new Radio(new Vector3(-2, -10, -0.5), new Vector3(0, toRad(15), 0));

    new Mesh("./assets/models/plasticChair.glb", "plasticChair", {
      collider: PhysicsShapeType.BOX,
      position: new Vector3(-2, -5, -3),
      rotation: new Vector3(0, toRad(-45), 0),
      physicsMaterial: { mass: 50, restitution: 0, friction: 1 },
      tags: [tags.floating, tags.pickable],
    });

    new Mesh("./assets/models/trash/constructionBarrel.glb", "constructionBarrel", {
      collider: PhysicsShapeType.CYLINDER,
      position: new Vector3(5, -10, 5),
      physicsMaterial: { mass: 50, restitution: 0, friction: 1 },
      tags: [tags.floating, tags.pickable],
    });

    new Mesh("./assets/models/trash/plasticBarrel.glb", "plasticBarrel", {
      collider: PhysicsShapeType.CYLINDER,
      position: new Vector3(-5, -10, 5),
      physicsMaterial: { mass: 50, restitution: 0, friction: 1 },
      tags: [tags.floating, tags.pickable],
    });

    new Mesh("./assets/models/trash/briefcase.glb", "briefcase", {
      collider: PhysicsShapeType.BOX,
      position: new Vector3(1, -10, -2.5),
      rotation: new Vector3(0, toRad(-45), 0),
      physicsMaterial: { mass: 50, restitution: 0, friction: 1 },
      tags: [tags.floating, tags.pickable],
    });

    new Player(new Vector3(0, 2, 0));
  }

  protected override loadAudio() {
    const game = Game.getInstance();
    game.getRadioMusic().volume = 1;
    game.getRadioMusic().resume();
    game.getRadioMusic().spatial.attach(null);
    game.getRadioMusic().spatial.attach(this.getMeshById("radio"));
    game.getAudioEngine().listener.attach(this.activeCamera);
  }
}
