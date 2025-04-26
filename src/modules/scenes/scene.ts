import {
  Scene as BabylonScene,
  Vector3,
  HavokPlugin,
  Engine,
  UniversalCamera,
  FreeCameraKeyboardMoveInput,
  LightGizmo,
  UtilityLayerRenderer,
  PositionGizmo,
  RotationGizmo,
  GizmoManager,
  MeshBuilder,
  Mesh,
  DirectionalLight,
  HemisphericLight,
} from "@babylonjs/core";
import { animate } from "animejs";
import { SkyMaterial } from "@babylonjs/materials";
import { registerBuiltInLoaders } from "@babylonjs/loaders/dynamic";
import HavokPhysics from "@babylonjs/havok";
import "@babylonjs/inspector";
import { physics, inputsMap, dayNightCycle } from "@/config";
import Inputs from "@/modules/inputs";
import { toDeg, toRad } from "@mathigon/euclid";
import { AdvancedDynamicTexture } from "@babylonjs/gui";
import Game, { GameStates } from "../game";

export interface SceneParameters {
  engine: Engine;
  canvas: HTMLCanvasElement;
  debugMode?: boolean;
}

export default class Scene extends BabylonScene {
  protected readonly camera: UniversalCamera;
  protected readonly debugMode: boolean;
  protected readonly skybox: Mesh;
  protected readonly skyMaterial: SkyMaterial;
  protected readonly gui: AdvancedDynamicTexture;
  private freeCameraEnabled = false;
  protected startTime = 0;
  protected currentDayTime = 10;

  constructor(parameters: SceneParameters) {
    super(parameters.engine);
    registerBuiltInLoaders();

    this.gui = AdvancedDynamicTexture.CreateFullscreenUI("UI");

    this.skyMaterial = new SkyMaterial("skyMaterial", this);
    this.skyMaterial.backFaceCulling = false;
    this.skyMaterial.luminance = 0.1;
    this.skyMaterial.turbidity = 5;
    this.skyMaterial.rayleigh = 0.5;
    this.skyMaterial.mieDirectionalG = 0.8;
    this.skyMaterial.mieCoefficient = 0.005;

    this.skybox = MeshBuilder.CreateBox("skyBox", { size: 5000 }, this);
    this.skybox.material = this.skyMaterial;

    const inputs = Inputs.getInstance();

    this.debugMode = parameters.debugMode || false;

    this.camera = new UniversalCamera("Camera", Vector3.Zero(), this);
    this.camera.minZ = 0.01;
    this.camera.maxZ = 5000;
    this.camera.fov = 1.5;
    this.camera.angularSensibility = 500;
    this.camera.inertia = 0;
    this.camera.attachControl(parameters.canvas, true);
    this.camera.inputs.addKeyboard();
    this.camera.inputs.addMouse();
    this.disableFreeCam();

    this.onBeforeRenderObservable.add(() => {
      this.startTime += this.getEngine().getDeltaTime() / 1000;
      const game = Game.getInstance();

      const sunRotation = toRad((this.currentDayTime * 360) / dayNightCycle.dayDuration);
      this.skyMaterial.useSunPosition = true;
      this.skyMaterial.sunPosition = new Vector3(Math.cos(sunRotation), Math.sin(sunRotation));

      if (game.getCurrentState() !== GameStates.MENU) {
        const sunDirection = this.skyMaterial.sunPosition;
        for (let lightIndex = 0; lightIndex < this.lights.length; lightIndex++) {
          const light = this.lights[lightIndex];
          if (light instanceof DirectionalLight) {
            light.direction = sunDirection.normalize().negate();
            light.intensity = Math.abs(Math.cos((toDeg(sunRotation) / 360) * 2) * 0.3);
          } else if (light instanceof HemisphericLight) {
            light.intensity = Math.abs(Math.cos((toDeg(sunRotation) / 360) * 2) * 0.5);
          }
        }
      }
    });

    this.onKeyboardObservable.add(() => {
      if (!this.debugMode) return;

      if (inputs.keysDown(inputsMap.inspector)) {
        if (this.debugLayer.isVisible()) {
          this.debugLayer.hide();
        } else {
          this.debugLayer.show({
            embedMode: true,
            overlay: false,
          });
        }
      }

      if (inputs.keysDown(inputsMap.freeCamera)) {
        if (!this.freeCameraEnabled) {
          this.freeCameraEnabled = true;
          this.enableFreeCam();
        } else {
          this.freeCameraEnabled = false;
          this.disableFreeCam();
        }
      }
    });

    parameters.canvas.addEventListener("click", () => {
      if (!this.freeCameraEnabled && Game.getInstance().getCurrentState() === GameStates.PLAYING) {
        parameters.canvas.requestPointerLock();
        parameters.canvas.focus();
      }
    });

    this.loadScene();
  }

  private async loadScene() {
    await this.loadPhysics();
    await this.scene();
    animate(Game.getInstance().getFadeTransition(), {
      opacity: [1, 0],
      duration: 800, 
      easing: "easeInOutQuad",
    });

    await this.whenReadyAsync();
    this.loadAudio();

    if (this.debugMode) {
      const gizmosManager = new GizmoManager(this);
      gizmosManager.positionGizmoEnabled = true;
      gizmosManager.rotationGizmoEnabled = true;
    }

    for (let lightIndex = 0; lightIndex < this.lights.length; lightIndex++) {
      const light = this.lights[lightIndex];
      if (this.debugMode) {
        const gizmo = new LightGizmo();
        gizmo.light = light;
        gizmo.scaleRatio = 5;

        const utilityLayer = new UtilityLayerRenderer(this);

        const positionGizmo = new PositionGizmo(utilityLayer);
        positionGizmo.attachedNode = light;
        const rotationGizmo = new RotationGizmo(utilityLayer);
        rotationGizmo.attachedNode = light;
      }
    }
  }

  private async loadPhysics() {
    const havokInstance = await HavokPhysics();
    const havokPlugin = new HavokPlugin(false, havokInstance);
    this.enablePhysics(physics.gravity, havokPlugin);
  }

  private enableFreeCam() {
    const camera = this.getCamera();
    camera.inputs.add(new FreeCameraKeyboardMoveInput());
    inputsMap.moveForward.forEach((key) => camera.keysUp.push(key.charCodeAt(0)));
    inputsMap.moveBackward.forEach((key) => camera.keysDown.push(key.charCodeAt(0)));
    inputsMap.moveLeft.forEach((key) => camera.keysLeft.push(key.charCodeAt(0)));
    inputsMap.moveRight.forEach((key) => camera.keysRight.push(key.charCodeAt(0)));
  }

  private disableFreeCam() {
    this.getCamera().inputs.removeByType("FreeCameraKeyboardMoveInput");
  }

  protected async scene() {}

  protected loadAudio() {}

  public getCamera(): UniversalCamera {
    return this.camera;
  }

  public getFreeCameraEnabled(): boolean {
    return this.freeCameraEnabled;
  }

  public getStartTime(): number {
    return this.startTime;
  }

  public getGui(): AdvancedDynamicTexture {
    return this.gui;
  }
}
