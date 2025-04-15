import { MeshBuilder, PhysicsShapeType, Vector3, StandardMaterial, Color3 } from "@babylonjs/core";
import GameObject, { GameObjectParameters } from "./object";
import Game from "@/modules/game";
import { inputsMap } from "@/config";
import Inputs from "@/modules/inputs";

export default class Player extends GameObject {
  private moveVector = Vector3.Zero();

  constructor() {
    const game = Game.getInstance();
    const scene = game.getScene();
    const inputs = Inputs.getInstance();

    const playerMaterial = new StandardMaterial("Player", scene);
    playerMaterial.diffuseColor = new Color3(1, 0.584, 0);

    const parameters: GameObjectParameters = {
      mesh: MeshBuilder.CreateCapsule("Player", { height: 2, radius: 0.5 }, scene),
      collider: PhysicsShapeType.CAPSULE,
      physicsMaterial: { mass: 1, restitution: -0.1 },
      material: playerMaterial,
    };

    super(parameters);

    const glasses = MeshBuilder.CreateBox("Glasses", { height: 0.25, width: 0.8, depth: 0.6 }, scene);
    glasses.parent = this.mesh;
    glasses.position.y = 0.6;
    glasses.position.z = -0.25;
    this.collider.body.setMassProperties({ inertia: Vector3.Zero() });

    scene.registerBeforeRender(() => {
      const camera = scene.getCamera();
      const cameraRotation = camera.rotation;

      // Clamping 
      const minPitch = -Math.PI / 2 + (5 * Math.PI) / 180; 
      const maxPitch = Math.PI / 2 - (5 * Math.PI) / 180; 
      cameraRotation.x = Math.max(minPitch, Math.min(maxPitch, cameraRotation.x));
      //


      if (scene.getFreeCameraEnabled()) return;
      const cameraLookDirection = scene.getCamera().getDirection(Vector3.Backward());
      const cameraRightDirection = scene.getCamera().getDirection(Vector3.Right());
      const playerLookDirection = this.mesh.getDirection(Vector3.Forward());

      let currentMoveDirection = new Vector3();
      if (inputs.keyDown(inputsMap.moveForward)) currentMoveDirection.z += 1;
      if (inputs.keyDown(inputsMap.moveBackward)) currentMoveDirection.z -= 1;
      if (inputs.keyDown(inputsMap.moveLeft)) currentMoveDirection.x -= 1;
      if (inputs.keyDown(inputsMap.moveRight)) currentMoveDirection.x += 1;
      if (inputs.keyDown(inputsMap.jump)) this.collider.body.applyImpulse(new Vector3(0, 1000, 0), this.mesh.position);

      currentMoveDirection = cameraRightDirection
        .scale(currentMoveDirection.x)
        .add(playerLookDirection.scale(currentMoveDirection.z));
      currentMoveDirection.normalize();
      this.moveVector = currentMoveDirection;

      // accumulating force when pressed
      this.collider.body.applyForce(
        new Vector3(this.moveVector.x * 10000, 0, this.moveVector.z * 10000),
        this.mesh.position
      );

      scene.getCamera().position = new Vector3(
        this.mesh.position.x,
        this.mesh.position.y + glasses.position.y,
        this.mesh.position.z
      );

      this.mesh.rotation = new Vector3(0, Math.atan2(-cameraLookDirection.x, -cameraLookDirection.z), 0);
    });
  }
}
