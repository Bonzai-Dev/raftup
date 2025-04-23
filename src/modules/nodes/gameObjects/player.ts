import {
  MeshBuilder,
  PhysicsShapeType,
  Vector3,
  StandardMaterial,
  Color3,
  UniversalCamera,
  Ray,
  Mesh,
  AbstractMesh,
  PhysicsMotionType,
  Quaternion,
  RayHelper,
} from "@babylonjs/core";
import GameObject, { GameObjectParameters } from "./object";
import Game from "@/modules/game";
import { inputsMap, physics, tags } from "@/config";
import Inputs from "@/modules/inputs";
import { toRad } from "@mathigon/euclid";

export default class Player extends GameObject {
  private readonly camera: UniversalCamera;
  private readonly cameraClampDegrees = 5;

  private readonly playerHeight: number;
  private readonly groundCheckDistance = 0.6;
  private readonly grabRange = 5;
  private readonly pickUpDistance = 2.5;

  private readonly speed: number = 5;
  private readonly jumpForce = 20000;
  private readonly counterForce = 17000;
  private readonly acceleration = 30000;

  private moveVector = Vector3.Zero();
  private pickedUpObject: Mesh | AbstractMesh | undefined;

  constructor(position?: Vector3) {
    const game = Game.getInstance();
    const scene = game.getScene();

    const playerMaterial = new StandardMaterial("Player", scene);
    playerMaterial.diffuseColor = new Color3(1, 0.584, 0);

    const parameters: GameObjectParameters = {
      mesh: MeshBuilder.CreateCapsule("Player", { height: 3.4, radius: 0.5 }, scene),
      collider: PhysicsShapeType.CAPSULE,
      physicsMaterial: { mass: 1, restitution: 0, friction: 0.1 },
      material: playerMaterial,
      position: position || Vector3.Zero(),
    };
    super(parameters);

    this.camera = scene.getCamera();

    const glasses = MeshBuilder.CreateBox("Glasses", { height: 0.25, width: 0.8, depth: 0.6 }, scene);
    glasses.parent = this.mesh;
    glasses.position.y = 1;
    glasses.position.z = -0.25;
    this.collider.body.setMassProperties({ inertia: Vector3.Zero() });

    this.collider.body.shape!.filterMembershipMask = 2;

    const boundingInfo = this.mesh.getBoundingInfo();
    this.playerHeight = boundingInfo.boundingBox.maximumWorld.y - boundingInfo.boundingBox.minimumWorld.y;

    scene.registerBeforeRender(() => {
      const cameraRotation = this.camera.rotation;
      cameraRotation.x = Math.max(
        toRad(-90 + this.cameraClampDegrees),
        Math.min(toRad(90 - this.cameraClampDegrees), cameraRotation.x)
      );

      if (scene.getFreeCameraEnabled()) return;
      this.handleInputs();
      this.movePlayer();

      const cameraLookDirection = this.camera.getDirection(Vector3.Forward());
      this.camera.position = new Vector3(
        this.mesh.position.x,
        this.mesh.position.y + glasses.position.y,
        this.mesh.position.z
      );

      this.mesh.rotation = new Vector3(0, Math.atan2(-cameraLookDirection.x, -cameraLookDirection.z), 0);
      this.collider.body.setAngularVelocity(Vector3.Zero());
    });
  }

  private handleInputs() {
    const inputs = Inputs.getInstance();
    const cameraRightDirection = this.camera.getDirection(Vector3.Right());
    const playerLookDirection = this.mesh.getDirection(Vector3.Forward());

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
      this.collider.body.setLinearDamping(0);
      this.collider.body.applyImpulse(
        new Vector3(this.moveVector.x * this.acceleration, this.jumpForce, this.moveVector.z * this.acceleration),
        this.mesh.position
      );
    }

    if (inputs.keyTapped(inputsMap.pickUp) && this.pickableInView()) {
      this.pickUpObject();
    } else if (this.pickedUpObject) {
      this.pickedUpObject!.physicsBody?.setTargetTransform(
        Vector3.Lerp(
          this.pickedUpObject!.position,
          this.camera.position.add(this.camera.getDirection(Vector3.Forward()).scale(this.pickUpDistance)),
          (10 * Game.getInstance().getScene().deltaTime) / 1000
        ),
        Quaternion.Zero()
      );

      if (
        inputs.keyTapped(inputsMap.drop) //||
        // Vector3.Distance(this.pickedUpObject.position, this.camera.position) > this.pickUpDistance + 2
      )
        this.dropObject();
    }
  }

  private movePlayer() {
    // Counter force
    if (!this.onGround()) {
      this.collider.body.applyForce(
        new Vector3(-this.moveVector.x * this.counterForce, 0, -this.moveVector.z * this.counterForce),
        this.mesh.position
      );
    }

    // Movement
    if (this.moveVector.length() === 0 && this.onGround()) {

    } else if (this.moveVector.length() > 0) {
      // Apply movement force
      this.collider.body.applyForce(
        new Vector3(this.moveVector.x * this.acceleration, 0, this.moveVector.z * this.acceleration),
        this.mesh.position
      );
    }

    // Limit speed
    const linearVelocity = this.collider.body.getLinearVelocity();
    if (new Vector3(linearVelocity.x, 0, linearVelocity.z).length() > this.speed) {
      const fallSpeed = linearVelocity.y;
      const limitedVelocity = linearVelocity.normalize().scale(this.speed);
      this.collider.body.setLinearVelocity(new Vector3(limitedVelocity.x, fallSpeed, limitedVelocity.z));
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
    this.pickedUpObject!.physicsBody!.setLinearVelocity(Vector3.Zero());
    // this.pickedUpObject!.physicsBody!.setMotionType(PhysicsMotionType.DYNAMIC);
    this.pickedUpObject = undefined;
  }

  private pickUpObject() {
    this.pickedUpObject = this.pickableInView();
    // this.pickedUpObject!.physicsBody!.setMotionType(PhysicsMotionType.ANIMATED);
  }

  private onGround(): boolean {
    const physicsEngine = Game.getInstance().getScene().getPhysicsEngine()!;
    const rayEnd = this.mesh.position.subtract(new Vector3(0, this.playerHeight + this.groundCheckDistance, 0));
    return (
      physicsEngine.raycast(this.mesh.position, rayEnd, { collideWith: 1 }).hasHit &&
      Math.abs(this.collider.body.getLinearVelocity().y) <= 1
    );
  }
}
