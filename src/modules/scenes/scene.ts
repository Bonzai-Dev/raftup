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
  UtilityLayerRenderer,
  PositionGizmo,
  RotationGizmo,
  GizmoManager,
  CubeTexture,
  MeshBuilder,
  StandardMaterial,
  Texture,
  Mesh,
} from "@babylonjs/core";
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
  private freeCameraEnabled = false;

  constructor(parameters: SceneParameters) {
    super(parameters.engine);
    registerBuiltInLoaders();
    this.skybox = MeshBuilder.CreateBox("skybox", { size: 5000 }, this);
    const skyboxMaterial = new StandardMaterial("skyBoxMaterial", this);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new CubeTexture("/src/assets/textures/clouds.env", this);
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skyboxMaterial.disableLighting = true;
    this.skybox.material = skyboxMaterial;
    this.environmentTexture = skyboxMaterial.reflectionTexture;

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
    await this.whenReadyAsync();

    if (this.debugMode) {
      const gizmosManager = new GizmoManager(this);
      gizmosManager.positionGizmoEnabled = true;
      gizmosManager.rotationGizmoEnabled = true;
    }
    
    for (let i = 0; i < this.lights.length; i++) {
      const light = this.lights[i];
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

      if (light instanceof DirectionalLight) {
        const shadowGenerator = new CascadedShadowGenerator(1024, light);
        shadowGenerator.lambda = 1;
        shadowGenerator.depthClamp = true;
        shadowGenerator.autoCalcDepthBounds = true;

        shadowGenerator.bias = 0.005;
        this.applyShadowSettings(shadowGenerator);
      } else if (light instanceof PointLight) {
        const shadowGenerator = new ShadowGenerator(1024 * 2, light);

        shadowGenerator.bias = 0.0001;
        shadowGenerator.normalBias = 0.01;

        shadowGenerator.contactHardeningLightSizeUVRatio = 0.1;
        shadowGenerator.useContactHardeningShadow = true;
        this.applyShadowSettings(shadowGenerator);
      } else if (light instanceof SpotLight) {
        const shadowGenerator = new ShadowGenerator(1024 * 2, light);

        shadowGenerator.bias = 0.0001;
        shadowGenerator.normalBias = 0.01;

        shadowGenerator.contactHardeningLightSizeUVRatio = 0.1;
        shadowGenerator.useContactHardeningShadow = true;
        this.applyShadowSettings(shadowGenerator);
      }
    }
  }

  private applyShadowSettings(shadowGenerator: ShadowGenerator | CascadedShadowGenerator) {
    shadowGenerator.usePercentageCloserFiltering = true;
    shadowGenerator.transparencyShadow = true;
    shadowGenerator.enableSoftTransparentShadow = true;
    shadowGenerator.filteringQuality = ShadowGenerator.QUALITY_HIGH;
    shadowGenerator.setDarkness(0.5);
    shadowGenerator.getShadowMap()!.renderList = this.meshes.filter((mesh) => mesh !== this.skybox);
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

  protected async scene() {}

  public getCamera(): UniversalCamera {
    return this.camera;
  }

  public getFreeCameraEnabled(): boolean {
    return this.freeCameraEnabled;
  }
}
