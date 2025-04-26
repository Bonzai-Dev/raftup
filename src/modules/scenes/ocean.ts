import {
  Vector3,
  PhysicsShapeType,
  HemisphericLight,
  DirectionalLight,
  StandardMaterial,
  Color3,
  Vector2,
} from "@babylonjs/core";
import "@babylonjs/inspector";
import { Button, Control, Image, TextBlock } from "@babylonjs/gui";
import { dayNightCycle, tags } from "@/config";
import Scene, { SceneParameters } from "./scene";
import OceanMesh from "@/modules/nodes/gameObjects/ocean";
import Mesh from "@/modules/nodes/gameObjects/meshes/mesh";
import Player from "@/modules/nodes/gameObjects/player";
import Radio from "@/modules/nodes/gameObjects/meshes/radio";
import { toRad } from "@mathigon/euclid";
import Game, { GameStates } from "../game";
import { animate } from "animejs";
import Menu from "./menu";

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
    const cursor = new Image("cursor", "./assets/cursor.svg");
    cursor.width = "5px";
    cursor.height = "5px";
    cursor.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    cursor.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    cursor.isPointerBlocker = false;
    gui.addControl(cursor);

    const dayCount = new TextBlock("dayCount");
    dayCount.color = "white";
    dayCount.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT; 
    dayCount.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    dayCount.top = "50px";
    dayCount.left = "50px";
    dayCount.fontSize = 20;
    dayCount.fontFamily = "Cal Sans"; 
    gui.addControl(dayCount);

    const gameOverText = new TextBlock("gameOverText", "Game Over");
    gameOverText.color = "red";
    gameOverText.fontSize = 50;
    gameOverText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    gameOverText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    gameOverText.isVisible = false;
    gameOverText.top = "-50px";
    gameOverText.fontFamily = "Cal Sans";
    gui.addControl(gameOverText);

    const restartButton = Button.CreateSimpleButton("restartButton", "RESTART");
    restartButton.color = "white";
    restartButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    restartButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    restartButton.isVisible = false;
    restartButton.width = "100px";
    restartButton.height = "40px";
    restartButton.thickness = 0;
    restartButton.hoverCursor = "pointer";
    restartButton.fontFamily = "Cal Sans";
    gui.addControl(restartButton);

    const mainMenuButton = Button.CreateSimpleButton("mainMenuButton", "MAIN MENU");
    mainMenuButton.color = "white";
    mainMenuButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    mainMenuButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    mainMenuButton.isVisible = false;
    mainMenuButton.width = "120px";
    mainMenuButton.height = "40px";
    mainMenuButton.top = "40px";
    mainMenuButton.thickness = 0;
    mainMenuButton.hoverCursor = "pointer";
    mainMenuButton.fontFamily = "Cal Sans"; 
    gui.addControl(mainMenuButton);

    const hemisphericLight = new HemisphericLight("HemisphericLight", new Vector3(1, 1, 0), this);
    hemisphericLight.intensity = 0.6;
    const directionalLight = new DirectionalLight("DirectionalLight", new Vector3(0.447, -0.895, 0), this);
    directionalLight.position = new Vector3(0, 10, 0);
    directionalLight.intensity = 0.3;
    
    mainMenuButton.onPointerUpObservable.add(() => {
      const game = Game.getInstance();
      game.getMenuMusic().resume();
      game.getRadioMusic().pause();
      game.setCurrentState(GameStates.MENU);
      game.setScene(new Menu({ engine: game.getEngine(), canvas: game.getCanvas() }));

      animate(Game.getInstance().getFadeTransition(), {
        opacity: [0, 1],
        duration: 800, 
        easing: "easeInOutQuad",
      });
    });

    restartButton.onPointerUpObservable.add(() => {
      const game = Game.getInstance();
      game.getMenuMusic().pause();
      game.getRadioMusic().pause();
      game.setCurrentState(GameStates.PLAYING);
      game.setScene(new Ocean({ engine: game.getEngine(), canvas: game.getCanvas() }));

      animate(Game.getInstance().getFadeTransition(), {
        opacity: [0, 1],
        duration: 800, 
        easing: "easeInOutQuad",
      });
    });

    const ocean = new OceanMesh();

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

    new Mesh("./assets/models/trash/constructionBarrel.glb", "constructionBarrel", {
      collider: PhysicsShapeType.CYLINDER,
      position: new Vector3(6, -10, -6),
      physicsMaterial: { mass: 50, restitution: 0, friction: 1 },
      tags: [tags.floating, tags.pickable],
    });

    new Mesh("./assets/models/trash/constructionBarrel.glb", "constructionBarrel", {
      collider: PhysicsShapeType.CYLINDER,
      position: new Vector3(-6, -10, 6),
      physicsMaterial: { mass: 50, restitution: 0, friction: 1 },
      tags: [tags.floating, tags.pickable],
    });

    new Mesh("./assets/models/trash/plasticBarrel.glb", "plasticBarrel", {
      collider: PhysicsShapeType.CYLINDER,
      position: new Vector3(-5, -10, 5),
      physicsMaterial: { mass: 50, restitution: 0, friction: 1 },
      tags: [tags.floating, tags.pickable],
    });

    new Mesh("./assets/models/trash/plasticBarrel.glb", "plasticBarrel", {
      collider: PhysicsShapeType.CYLINDER,
      position: new Vector3(-7, -10, 7),
      physicsMaterial: { mass: 50, restitution: 0, friction: 1 },
      tags: [tags.floating, tags.pickable],
    });

    new Mesh("./assets/models/trash/plasticBarrel.glb", "plasticBarrel", {
      collider: PhysicsShapeType.CYLINDER,
      position: new Vector3(-7, -10, 7),
      physicsMaterial: { mass: 50, restitution: 0, friction: 1 },
      tags: [tags.floating, tags.pickable],
    });

    new Mesh("./assets/models/trash/plasticBarrel.glb", "plasticBarrel", {
      collider: PhysicsShapeType.CYLINDER,
      position: new Vector3(7, -10, 7),
      physicsMaterial: { mass: 50, restitution: 0, friction: 1 },
      tags: [tags.floating, tags.pickable],
    });

    new Mesh("./assets/models/trash/plasticBarrel.glb", "plasticBarrel", {
      collider: PhysicsShapeType.CYLINDER,
      position: new Vector3(-5, -10, -5),
      physicsMaterial: { mass: 50, restitution: 0, friction: 1 },
      tags: [tags.floating, tags.pickable],
    });

    new Mesh("./assets/models/trash/plasticBarrel.glb", "plasticBarrel", {
      collider: PhysicsShapeType.CYLINDER,
      position: new Vector3(5, -10, 5),
      physicsMaterial: { mass: 50, restitution: 0, friction: 1 },
      tags: [tags.floating, tags.pickable],
    });

    new Mesh("./assets/models/trash/plasticBarrel.glb", "plasticBarrel", {
      collider: PhysicsShapeType.CYLINDER,
      position: new Vector3(5, -10, -5),
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

    this.onBeforeRenderObservable.add(() => {
      if (this.daysSurvived > 2) {
        ocean.setWave1Values(new Vector2(1, 0.1 * this.daysSurvived / 5));
        ocean.setWave2Values(new Vector2(0.8, 0.1 * this.daysSurvived / 5));
        ocean.setWave3Values(new Vector2(0.8, 0.1 * this.daysSurvived / 5));
      }

      if (this.currentDayTime <= dayNightCycle.dayDuration) {
        this.currentDayTime += this.getEngine().getDeltaTime() / 1000;
      } else {
        this.currentDayTime = 0;
        this.daysSurvived += 1;
      }

      dayCount.text = `Days Survived: ${this.daysSurvived}`;

      const player = this.getMeshById("player");
      if (player && player.position.y < -20) {
        Game.getInstance().setCurrentState(GameStates.GAME_OVER);
        gameOverText.isVisible = true;
        restartButton.isVisible = true;
        mainMenuButton.isVisible = true;
        cursor.isVisible = false;
        Game.getInstance().getEngine().exitPointerlock();
        animate(Game.getInstance().getFadeTransition(), {
          opacity: [0, 1],
          duration: 800, 
          easing: "easeInOutQuad",
        });
      }
    });
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
