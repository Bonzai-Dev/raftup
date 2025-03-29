import {
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  Vector3,
  Mesh,
  MeshBuilder,
  HavokPlugin,
} from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";

import * as GUI from "@babylonjs/gui";
import "@babylonjs/inspector";
import Sphere from "@/modules/gameObject/sphere";
import { physics } from "@/config";

export default class Game {
  private scene: Scene;
  private engine: Engine;
  private canvas: HTMLCanvasElement;

  constructor() {
    // create the canvas html element and attach it to the webpage
    this.canvas = document.createElement("canvas");
    document.body.appendChild(this.canvas);

    // initialize babylon scene and engine
    this.engine = new Engine(this.canvas, true);
    this.scene = new Scene(this.engine);

    this.loadScene();
  }

  private async loadScene() {
    await this.loadPhysics();

    const camera: ArcRotateCamera = new ArcRotateCamera(
      "Camera",
      Math.PI / 2,
      Math.PI / 2,
      2,
      Vector3.Zero(),
      this.scene
    );
    camera.attachControl(this.canvas, true);
    var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), this.scene);
    var sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, this.scene);

    new Sphere("sphere", this.scene, 1, new Vector3(0, 5, 0), {
      mass: 1,
      friction: 0.5,
      restitution: 0.7,
    });


    // Create a fullscreen UI
    const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, this.scene);

    // Create a button
    const button = GUI.Button.CreateSimpleButton("button", "Click Me");
    button.width = "150px";
    button.height = "40px";
    button.color = "white";
    button.background = "blue";
    button.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    button.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    button.top = "-20px"; // Position the button slightly above the bottom edge
    // Add an event listener for the button
    button.onPointerClickObservable.add(() => {
      console.log("Button clicked!");
      alert("Button clicked!");
    });
    // Add the button to the UI
    advancedTexture.addControl(button);

    // hide/show the Inspector
    window.addEventListener("keydown", (event) => {
      // Shift+Ctrl+Alt+I
      if (event.shiftKey && event.ctrlKey && event.altKey && (event.key === "I" || event.key === "i")) {
        if (this.scene.debugLayer.isVisible()) {
          this.scene.debugLayer.hide();
        } else {
          this.scene.debugLayer.show();
        }
      }
    });

    window.addEventListener("resize", function () {
      // this.engine.resize();
    });

    // run the main render loop
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  private async loadPhysics() {
    const havokInstance = await HavokPhysics();
    const havokPlugin = new HavokPlugin(true, havokInstance);
    this.scene.enablePhysics(physics.gravity, havokPlugin);
  }
}
