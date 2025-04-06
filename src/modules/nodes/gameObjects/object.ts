import {
  Vector3,
  Mesh,
  PhysicsAggregate,
  PhysicsShapeType,
  PhysicsAggregateParameters,
  StandardMaterial
} from "@babylonjs/core";
import Game from "@/modules/game";

export interface GameObjectParameters {
  mesh: Mesh;
  collider: PhysicsShapeType;
  position?: Vector3;
  rotation?: Vector3;
  physicsMaterial?: PhysicsAggregateParameters;
  material?: StandardMaterial;
}

export default class GameObject {
  protected readonly collider: PhysicsAggregate;
  protected readonly mesh: Mesh;

  constructor(parameters: GameObjectParameters) {
    this.mesh = parameters.mesh;
    this.mesh.position = parameters.position || Vector3.Zero();
    this.mesh.rotation = parameters.rotation || Vector3.Zero();

    this.mesh.material = parameters.material || Game.getInstance().getScene().defaultMaterial;
    this.mesh.receiveShadows = true;

    this.collider = new PhysicsAggregate(
      this.mesh,
      parameters.collider,
      parameters.physicsMaterial,
    );
  }
}
