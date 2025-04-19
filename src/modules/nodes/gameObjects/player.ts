import {
  MeshBuilder,
  PhysicsShapeType,
  Vector3,
  StandardMaterial,
  Color3,
  UniversalCamera,
  Quaternion,
} from "@babylonjs/core";
import GameObject, { GameObjectParameters } from "./object";
import Game from "@/modules/game";
import { inputsMap } from "@/config";
import Inputs from "@/modules/inputs";
import { toRad } from "@mathigon/euclid";

export default class Player extends GameObject {
  private readonly camera: UniversalCamera;
  private readonly cameraClampDegrees = 10;

  private readonly speed: number = 5;
  private readonly counterForce = 15000;
  private readonly acceleration = 20000;
  private readonly deceleration = 11000;

  private moveVector = Vector3.Zero();

  constructor() {
    const game = Game.getInstance();
    const scene = game.getScene();

    const playerMaterial = new StandardMaterial("Player", scene);
    playerMaterial.diffuseColor = new Color3(1, 0.584, 0);

    const parameters: GameObjectParameters = {
      mesh: MeshBuilder.CreateCapsule("Player", { height: 2, radius: 0.5 }, scene),
      collider: PhysicsShapeType.CAPSULE,
      physicsMaterial: { mass: 1, restitution: 0, friction: 0 },
      material: playerMaterial,
    };
    super(parameters);

    this.camera = scene.getCamera();

    const glasses = MeshBuilder.CreateBox("Glasses", { height: 0.25, width: 0.8, depth: 0.6 }, scene);
    glasses.parent = this.mesh;
    glasses.position.y = 0.6;
    glasses.position.z = -0.25;
    this.collider.body.setMassProperties({ inertia: Vector3.Zero() });

    this.collider.body.shape!.filterMembershipMask = 2;

    scene.registerBeforeRender(() => {
      const cameraRotation = this.camera.rotation;
      cameraRotation.x = Math.max(
        toRad(-90 + this.cameraClampDegrees),
        Math.min(toRad(90 - this.cameraClampDegrees), cameraRotation.x)
      );

      if (scene.getFreeCameraEnabled()) return;
      const cameraLookDirection = this.camera.getDirection(Vector3.Forward());

      this.movePlayer();

      this.camera.position = new Vector3(
        this.mesh.position.x,
        this.mesh.position.y + glasses.position.y,
        this.mesh.position.z
      );

      this.mesh.rotation = new Vector3(0, Math.atan2(-cameraLookDirection.x, -cameraLookDirection.z), 0);
      this.collider.body.setAngularVelocity(Vector3.Zero());
    });
  }

  private movePlayer() {
    const inputs = Inputs.getInstance();
    const cameraRightDirection = this.camera.getDirection(Vector3.Right());
    const playerLookDirection = this.mesh.getDirection(Vector3.Forward());

    let currentMoveDirection = new Vector3();
    if (inputs.keysDown(inputsMap.moveForward)) currentMoveDirection.z += 1;
    if (inputs.keysDown(inputsMap.moveBackward)) currentMoveDirection.z -= 1;
    if (inputs.keysDown(inputsMap.moveLeft)) currentMoveDirection.x -= 1;
    if (inputs.keysDown(inputsMap.moveRight)) currentMoveDirection.x += 1;
    if (inputs.keysDown(inputsMap.jump) && this.onGround())
      this.collider.body.applyImpulse(new Vector3(0, 10000, 0), this.mesh.position);

    currentMoveDirection = cameraRightDirection
      .scale(currentMoveDirection.x)
      .add(playerLookDirection.scale(-currentMoveDirection.z));
    currentMoveDirection.normalize();
    this.moveVector = currentMoveDirection;

    // Counter force
    if (!this.onGround()) {
      this.collider.body.applyForce(
        new Vector3(-this.moveVector.x * this.counterForce, 0, -this.moveVector.z * this.counterForce),
        this.mesh.position
      );
    }

    // Movement
    if (this.moveVector.length() === 0 && this.onGround()) {
      this.collider.body.applyForce(
        new Vector3(
          -this.collider.body.getLinearVelocity().x * this.deceleration,
          0,
          -this.collider.body.getLinearVelocity().z * this.deceleration
        ),
        this.mesh.position
      );
    } else {
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

  private onGround(): boolean {
    const physicsEngine = Game.getInstance().getScene().getPhysicsEngine()!;
    const rayEnd = this.mesh.position.subtract(new Vector3(0, 1.1, 0));
    return physicsEngine.raycast(this.mesh.position, rayEnd, { collideWith: 1 }).hasHit;
  }
}
