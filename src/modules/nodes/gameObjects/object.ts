import {
  Vector3,
  Mesh,
  PhysicsAggregate,
  PhysicsShapeType,
  PhysicsAggregateParameters,
  StandardMaterial,
  AbstractMesh,
  Tags
} from "@babylonjs/core";
import Game from "@/modules/game";

export interface GameObjectParameters {
  mesh: Mesh | AbstractMesh;
  collider: PhysicsShapeType;
  position?: Vector3;
  rotation?: Vector3;
  physicsMaterial?: PhysicsAggregateParameters;
  material?: StandardMaterial;
  tags?: string[];
}

export default class GameObject {
  protected readonly collider: PhysicsAggregate;
  protected readonly mesh: Mesh | AbstractMesh;
  protected readonly tags: string[] = [];

  constructor(parameters: GameObjectParameters) {
    this.mesh = parameters.mesh;
    this.mesh.position = parameters.position || Vector3.Zero();
    this.mesh.rotation = parameters.rotation || Vector3.Zero();

    this.mesh.material = parameters.material || Game.getInstance().getScene().defaultMaterial;
    this.mesh.receiveShadows = true;

    for (let i = 0; i < (parameters.tags || []).length; i++)
      Tags.AddTagsTo(this.mesh, parameters.tags![i]);

    this.collider = new PhysicsAggregate(
      this.mesh,
      parameters.collider,
      parameters.physicsMaterial,
    );
  }

  public getMesh(): Mesh | AbstractMesh {
    return this.mesh;
  }
}
