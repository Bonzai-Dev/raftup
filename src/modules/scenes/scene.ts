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
  AudioEngineV2,
  ReflectionProbe,
} from "@babylonjs/core";
import { SkyMaterial } from "@babylonjs/materials";
import { registerBuiltInLoaders } from "@babylonjs/loaders/dynamic";
import HavokPhysics from "@babylonjs/havok";
import "@babylonjs/inspector";
import { physics, inputsMap } from "@/config";
import Inputs from "@/modules/inputs";

export interface SceneParameters {
  engine: Engine;
  canvas: HTMLCanvasElement;
  debugMode?: boolean;
}

export default class Scene extends BabylonScene {
  protected readonly camera: UniversalCamera;
  protected readonly debugMode: boolean;
  protected readonly skybox: Mesh;
  protected readonly reflectionProbe: ReflectionProbe;
  protected audioEngine: AudioEngineV2 | undefined;
  private freeCameraEnabled = false;

  constructor(parameters: SceneParameters) {
    super(parameters.engine);
    registerBuiltInLoaders();

    const skyMaterial = new SkyMaterial("skyMaterial", this);
    skyMaterial.backFaceCulling = false;
    skyMaterial.inclination = -0.2; // Adjust for the time of day (e.g., 0 for noon, -0.5 for sunset)
    skyMaterial.luminance = 1.1; // Brightness of the sky
    skyMaterial.turbidity = 5; // Adjust for atmospheric scattering

    skyMaterial.backFaceCulling = false;

    this.skybox = MeshBuilder.CreateBox("skyBox", { size: 5000 }, this);
    this.skybox.material = skyMaterial;
    this.reflectionProbe = new ReflectionProbe("probe", 512, this);
    this.environmentTexture = this.reflectionProbe.cubeTexture;

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
      if (!this.freeCameraEnabled) {
        parameters.canvas.requestPointerLock();
        parameters.canvas.focus();
      }
    });

    this.loadScene();
  }

  private async loadScene() {
    await this.loadPhysics();
    await this.scene();
    await this.loadAudio();
    await this.whenReadyAsync();

    this.reflectionProbe.renderList! = this.meshes;

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

  protected async loadAudio() {}

  public getCamera(): UniversalCamera {
    return this.camera;
  }

  public getFreeCameraEnabled(): boolean {
    return this.freeCameraEnabled;
  }

  public getAudioEngine(): AudioEngineV2 {
    return this.audioEngine as AudioEngineV2;
  }
}
