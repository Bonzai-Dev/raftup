import {
  Vector3,
  Mesh,
  PhysicsAggregate,
  PhysicsShapeType,
  StandardMaterial,
  AbstractMesh,
  Tags,
  PhysicsAggregateParameters
} from "@babylonjs/core";
import { PhysicsMaterial } from "@/types/PhysicsMaterial";
import Game from "@/modules/game";

export interface GameObjectParameters {
  mesh?: Mesh | AbstractMesh;
  collider: PhysicsShapeType;
  position?: Vector3;
  rotation?: Vector3;
  physicsMaterial?: PhysicsMaterial;
  material?: StandardMaterial;
  tags?: string[];
}

export default class GameObject {
  protected readonly collider: PhysicsAggregate;
  protected readonly mesh: Mesh | AbstractMesh;
  protected readonly tags: string[] = [];

  constructor(parameters: GameObjectParameters) {
    this.mesh = parameters.mesh as Mesh | AbstractMesh;
    this.mesh.position = parameters.position || Vector3.Zero();
    this.mesh.rotation = parameters.rotation || Vector3.Zero();

    this.mesh.material = parameters.material || Game.getInstance().getScene().defaultMaterial;
    this.mesh.receiveShadows = true;

    for (let tagIndex = 0; tagIndex < (parameters.tags || []).length; tagIndex++)
      Tags.AddTagsTo(this.mesh, parameters.tags![tagIndex]);

    this.collider = new PhysicsAggregate(
      this.mesh,
      parameters.collider,
      parameters.physicsMaterial as PhysicsAggregateParameters,
    );
  }

  public getMesh(): Mesh | AbstractMesh {
    return this.mesh;
  }
}
