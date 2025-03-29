import {
  Scene,
  Vector3,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsShapeType,
  PhysicsAggregateParameters,
} from "@babylonjs/core";

import GameObject from "./object";

export default class Sphere extends GameObject {
  private radius: number;

  constructor(
    name: string,
    scene: Scene,
    radius: number,
    position?: Vector3,
    physicsOptions?: PhysicsAggregateParameters,
  ) {
    super(name, scene, position);
    this.radius = radius;

    this.mesh = MeshBuilder.CreateSphere(name, { diameter: this.radius * 2 }, scene);
    this.mesh.position = this.position;

    this.collider = new PhysicsAggregate(this.mesh, PhysicsShapeType.SPHERE, physicsOptions, scene);
  }
}
