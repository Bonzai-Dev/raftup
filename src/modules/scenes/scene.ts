import {
  Scene as BabylonScene,
  Vector3,
  HavokPlugin,
  Engine,
  UniversalCamera,
  FreeCameraKeyboardMoveInput,
  ShadowGenerator,
  PointLight,
  DirectionalLight,
  SpotLight,
  LightGizmo,
  CascadedShadowGenerator,
} from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";
import "@babylonjs/inspector";
import { physics } from "@/config";
import { inputsMap } from "@/config";
import Inputs from "@/modules/inputs";

export interface SceneParameters {
  engine: Engine;
  canvas: HTMLCanvasElement;
  debugMode?: boolean;
}

export default class Scene extends BabylonScene {
  protected readonly camera: UniversalCamera;
  protected readonly debugMode: boolean;
  private freeCameraEnabled = false;

  constructor(parameters: SceneParameters) {
    super(parameters.engine);
    const inputs = Inputs.getInstance();
    this.debugMode = parameters.debugMode || false;

    this.camera = new UniversalCamera("Camera", Vector3.Zero(), this);
    this.camera.minZ = 0.01;
    this.camera.maxZ = 1000;
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
        if (this.debugLayer.isVisible()) this.debugLayer.hide();
        else this.debugLayer.show();
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

    this.loadScene();
  }

  private async loadScene() {
    await this.loadPhysics();
    this.scene();

    // if (this.debugMode) {
    //   const utilityLayer = new UtilityLayerRenderer(this);
    //   const positionGizmo = new PositionGizmo(utilityLayer);
    //   const rotationGizmo = new RotationGizmo(utilityLayer);
    //   const scaleGizmo = new ScaleGizmo(utilityLayer);

    //   for (let i = 0; i < this.meshes.length; i++) {
    //     const mesh = this.meshes[i];
    //     positionGizmo.attachedMesh = mesh;
    //     rotationGizmo.attachedMesh = mesh;
    //     scaleGizmo.attachedMesh = mesh;
    //   }
    // }

    for (let i = 0; i < this.lights.length; i++) {
      const light = this.lights[i];

      if (this.debugMode) {
        const gizmo = new LightGizmo();
        gizmo.light = light;
        gizmo.scaleRatio = 5;
      }

      if (light instanceof DirectionalLight) {
        const shadowGenerator = new CascadedShadowGenerator(1024 * 2, light); 
        shadowGenerator.lambda = 0.5;
        shadowGenerator.depthClamp = true;
        shadowGenerator.stabilizeCascades = true;
        shadowGenerator.autoCalcDepthBounds = true;

        shadowGenerator.bias = 0.0022;
        shadowGenerator.normalBias = 0.01;

        shadowGenerator.usePercentageCloserFiltering = true;
        shadowGenerator.useContactHardeningShadow = true;
        
        shadowGenerator.transparencyShadow = true;
        shadowGenerator.enableSoftTransparentShadow = true;
        shadowGenerator.filteringQuality = ShadowGenerator.QUALITY_HIGH;

        shadowGenerator.setDarkness(0.5);
        shadowGenerator.getShadowMap()!.renderList = this.meshes;
      } else if (light instanceof PointLight) {
      } else if (light instanceof SpotLight) {
        const shadowGenerator = new ShadowGenerator(1024 * 2, light);

        shadowGenerator.bias = 0.0001;
        shadowGenerator.normalBias = 0.01;
        
        shadowGenerator.contactHardeningLightSizeUVRatio = 0.1;
        shadowGenerator.usePercentageCloserFiltering = true;
        shadowGenerator.useContactHardeningShadow = true;

        shadowGenerator.transparencyShadow = true;
        shadowGenerator.enableSoftTransparentShadow = true;
        shadowGenerator.filteringQuality = ShadowGenerator.QUALITY_HIGH;

        shadowGenerator.setDarkness(0.5);
        shadowGenerator.getShadowMap()!.renderList = this.meshes;
      }
    }
  }

  private async loadPhysics() {
    const havokInstance = await HavokPhysics();
    const havokPlugin = new HavokPlugin(true, havokInstance);
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

  protected scene() {}

  public getCamera(): UniversalCamera {
    return this.camera;
  }

  public getFreeCameraEnabled(): boolean {
    return this.freeCameraEnabled;
  }
}
