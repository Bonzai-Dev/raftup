import {
  Scene,
  Vector3,
  Mesh,
  MeshBuilder,
  PhysicsAggregate,
} from "@babylonjs/core";

export default abstract class GameObject {
  protected mesh: Mesh;
  protected collider: PhysicsAggregate;
  protected readonly name: string;
  protected readonly position: Vector3;

  constructor(name: string, scene: Scene, position?: Vector3) {
    this.position = position || Vector3.Zero();
    this.name = name;
  }
}
