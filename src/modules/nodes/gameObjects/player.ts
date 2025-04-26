import {
  MeshBuilder,
  PhysicsShapeType,
  Vector3,
  StandardMaterial,
  Color3,
  UniversalCamera,
  Ray,
  AbstractMesh,
  Quaternion,
  ProximityCastResult,
  HavokPlugin,
  Mesh,
  PhysicsShape,
  PhysicsBody,
  PhysicsMotionType,
  TransformNode,
  AnimationGroup,
} from "@babylonjs/core";
import { inputsMap, physics, tags } from "@/config";
import { toDeg, toRad } from "@mathigon/euclid";
import GameObject, { GameObjectParameters } from "./object";
import Game from "@/modules/game";
import Inputs from "@/modules/inputs";
import { importGlb } from "@/utils/meshImport";
import MeshClass from "./meshes/mesh";

export default class Player {
  private readonly camera: UniversalCamera;

  private readonly playerHeight: number = 3.4;
  private readonly groundCheckDistance = 0.2;
  private readonly grabRange = 5;
  private readonly pickUpDistance = 2.5;

  private readonly speed: number = 5;
  private readonly jumpForce = 10;
  private readonly counterForce = 17000;
  private readonly acceleration = 30000;
  private animations: AnimationGroup[] | undefined;

  private moveVector = Vector3.Zero();
  private pickedUpObject: Mesh | AbstractMesh | undefined;
  protected mesh: TransformNode | undefined;

  constructor(position?: Vector3) {
    const game = Game.getInstance();
    const scene = game.getScene();

    const playerMaterial = new StandardMaterial("player", scene);
    playerMaterial.diffuseColor = new Color3(1, 0.584, 0);

    this.camera = scene.getCamera();
    this.loadPlayer(position);
  }

  private async loadPlayer(position?: Vector3) {
    const scene = Game.getInstance().getScene();
    const model = await importGlb("./assets/models/player.glb");

    const root = model.meshes[0];
    const { min, max } = root.getHierarchyBoundingVectors();
    const size = max.subtract(min);
    const center = min.add(max).scale(0.5).add(new Vector3(0, 2.8, 0));
    const newRoot = MeshBuilder.CreateBox("player", {
      width: size.x,
      height: size.y,
      depth: size.z,
    });
    newRoot.position = position || Vector3.Zero();
    root.rotation = new Vector3(0, 0, 0);
    root.parent = newRoot;
    newRoot.visibility = 0;

    newRoot.position = position || Vector3.Zero();

    this.animations = model.animationGroups;

    const shape = new PhysicsShape(
      {
        type: PhysicsShapeType.CAPSULE,
        parameters: {
          center: center,
          extents: size,
          radius: size.x / 2,
          pointA: center.add(new Vector3(0, size.y / 2, 0)),
          pointB: center.subtract(new Vector3(0, size.y / 2, 0)),
        },
      },
      scene
    );

    shape.material = {
      friction: 5,
      restitution: 0,
    };

    const body = new PhysicsBody(newRoot, PhysicsMotionType.DYNAMIC, false, scene);
    body.setMassProperties({ mass: 1, inertia: Vector3.Zero() });
    body.shape = shape;

    this.mesh = newRoot;

    const glasses = MeshBuilder.CreateBox("Glasses", { height: 0.25, width: 0.8, depth: 0.6 }, scene);
    glasses.parent = this.mesh!;
    glasses.position.y = 3;
    glasses.position.z = -1.3;
    glasses.visibility = 0;
    this.mesh!.physicsBody!.shape!.filterMembershipMask = 2;

    scene.onBeforeRenderObservable.add(() => {
      if (scene.getFreeCameraEnabled()) return;
      this.handleInputs();
      this.movePlayer();

      const cameraLookDirection = this.camera.getDirection(Vector3.Forward());

      const glassesWorldPosition = glasses.getAbsolutePosition();
      this.camera.position = glassesWorldPosition;

      if (this.camera.rotation.x >= toRad(90 - 10)) this.dropObject();

      this.mesh!.rotation = new Vector3(0, Math.atan2(-cameraLookDirection.x, -cameraLookDirection.z), 0);
      this.mesh!.physicsBody!.setAngularVelocity(Vector3.Zero());
    });
  }

  private handleInputs() {
    const inputs = Inputs.getInstance();
    const cameraRightDirection = this.camera.getDirection(Vector3.Right());
    const playerLookDirection = this.mesh!.getDirection(Vector3.Forward());

    let currentMoveDirection = new Vector3();
    if (inputs.keyDown(inputsMap.moveForward)) currentMoveDirection.z += 1;
    if (inputs.keyDown(inputsMap.moveBackward)) currentMoveDirection.z -= 1;
    if (inputs.keyDown(inputsMap.moveLeft)) currentMoveDirection.x -= 1;
    if (inputs.keyDown(inputsMap.moveRight)) currentMoveDirection.x += 1;

    currentMoveDirection = cameraRightDirection
      .scale(currentMoveDirection.x)
      .add(playerLookDirection.scale(-currentMoveDirection.z));
    currentMoveDirection.normalize();
    this.moveVector = currentMoveDirection;

    if (inputs.keyTapped(inputsMap.jump) && this.onGround()) {
      const currentVelocity = this.mesh!.physicsBody!.getLinearVelocity();
      this.mesh!.physicsBody!.setLinearVelocity(
        new Vector3(currentVelocity.x, 0, currentVelocity.z) 
      );
      this.mesh!.physicsBody!.applyImpulse(
        new Vector3(0, this.jumpForce, 0),
        this.mesh!.position
      );
    }

    if (inputs.keyTapped(inputsMap.pickUp) && this.pickableInView()) {
      this.pickUpObject();
    } else if (this.pickedUpObject) {
      this.pickedUpObject!.physicsBody!.setTargetTransform(
        Vector3.Lerp(
          this.pickedUpObject!.position,
          this.camera.position.add(this.camera.getDirection(Vector3.Forward()).scale(this.pickUpDistance)),
          (10 * Game.getInstance().getScene().deltaTime) / 1000
        ),
        Quaternion.FromEulerAngles(0, this.camera.rotation.y + toRad(90), 0)
      );

      if (inputs.keyTapped(inputsMap.drop)) this.dropObject();
    }
  }

  private movePlayer() {
    if (!this.onGround())
      this.animations![2].play(true);

    if (this.moveVector.length() === 0 && this.onGround()) {
      this.animations![2].stop();
      this.animations![3].stop();
    } else if (this.moveVector.length() > 0) {
      this.animations![3].play();
      this.mesh!.physicsBody!.setLinearVelocity(
        new Vector3(
          this.moveVector.x * this.speed,
          this.mesh!.physicsBody!.getLinearVelocity().y,
          this.moveVector.z * this.speed
        )
      );
    }
  }

  private pickableInView(): Mesh | AbstractMesh | undefined {
    const scene = Game.getInstance().getScene();
    const ray = new Ray(this.camera.position, this.camera.getDirection(Vector3.Forward()), this.grabRange);
    Ray.Transform(ray, this.camera.getWorldMatrix());

    const pickables = scene.getMeshesByTags(tags.pickable);
    for (let pickableIndex = 0; pickableIndex < pickables.length; pickableIndex++) {
      const pickable = pickables[pickableIndex];
      if (ray.intersectsMesh(pickables[pickableIndex]).hit) return pickable;
    }
    return undefined;
  }

  private dropObject() {
    if (!this.pickedUpObject) return;
    this.pickedUpObject!.physicsBody!.setLinearVelocity(Vector3.Zero());
    this.pickedUpObject = undefined;
  }

  private pickUpObject() {
    this.pickedUpObject = this.pickableInView();
  }

  private onGround(): boolean {
    const havokPlugin = Game.getInstance().getScene().getPhysicsEngine()?.getPhysicsPlugin() as HavokPlugin;
    const position = this.mesh!.position.subtract(new Vector3(0, this.playerHeight + this.groundCheckDistance, 0));
    const result = new ProximityCastResult();
    havokPlugin.pointProximity(
      {
        position: position,
        maxDistance: 1.5,
        collisionFilter: {
          collideWith: 1,
        },
        shouldHitTriggers: true,
      },
      result
    );
    return result.hasHit && this.mesh!.physicsBody!.getLinearVelocity().y <= 1;
  }
}
