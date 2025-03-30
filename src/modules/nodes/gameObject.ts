import {
  Scene,
  Vector3,
  Vector2,
  Mesh,
  PhysicsAggregate,
  PhysicsShapeType,
  PhysicsAggregateParameters,
} from "@babylonjs/core";

export interface GameObjectParameters {
  scene: Scene;
  mesh: Mesh;
  collider: PhysicsShapeType;
  position?: Vector3;
  rotation?: Vector3;
  physicsMaterial?: PhysicsAggregateParameters;
}

export default class GameObject {
  protected readonly collider: PhysicsAggregate;
  protected readonly mesh: Mesh;

  constructor(parameters: GameObjectParameters) {
    this.mesh = parameters.mesh;
    this.mesh.position = parameters.position || Vector3.Zero();
    this.mesh.rotation = parameters.rotation || Vector3.Zero();

    this.collider = new PhysicsAggregate(
      this.mesh,
      parameters.collider,
      parameters.physicsMaterial,
      parameters.scene
    );

    // -object
    //   -mesh
    //   -physicsCollider
  }
}
