import { importGlb } from "@/utils/meshImport";
import {
  MeshBuilder,
  PhysicsBody,
  PhysicsMotionType,
  PhysicsShape,
  Tags,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import Game from "@/modules/game";
import { GameObjectParameters } from "./object";

export default class Mesh {
  protected readonly tags: string[] = [];
  protected readonly startPosition: Vector3;
  protected collider: PhysicsShape | undefined;
  protected mesh: TransformNode | undefined;

  constructor(src: string, name: string, parameters: GameObjectParameters) {
    this.tags = parameters.tags || [];
    this.startPosition = this.mesh?.position || new Vector3(0, 0, 0);
    this.loadMesh(src, name, parameters);
  }

  private async loadMesh(src: string, name: string, parameters: GameObjectParameters) {
    const scene = Game.getInstance().getScene();
    const model = await importGlb(src, name);

    const root = model.meshes[0];
    const { min, max } = root.getHierarchyBoundingVectors();
    const size = max.subtract(min);
    const center = min.add(max).scale(0.5);
    const newRoot = MeshBuilder.CreateBox(name, {
      width: size.x,
      height: size.y,
      depth: size.z,
    });
    newRoot.position = center;
    root.parent = newRoot;
    newRoot.visibility = 0;

    const shape = new PhysicsShape(
      {
        type: parameters.collider,
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
      friction: parameters.physicsMaterial?.friction,
      restitution: parameters.physicsMaterial?.restitution,
    };

    const body = new PhysicsBody(newRoot, PhysicsMotionType.DYNAMIC, false, scene);
    body.setMassProperties({ mass: parameters.physicsMaterial?.mass, inertia: parameters.physicsMaterial?.inertia });
    body.shape = shape;

    this.collider = shape;
    this.mesh = newRoot;

    for (let tagIndex = 0; tagIndex < this.tags.length; tagIndex++) {
      Tags.AddTagsTo(newRoot, this.tags[tagIndex]);
    }
    for (let meshIndex = 0; meshIndex < model.meshes.length; meshIndex++) {
      model.meshes[meshIndex].receiveShadows = true;
      model.meshes[meshIndex].isPickable = true;
    }
  }

  public getStartPosition(): Vector3 {
    return this.startPosition;
  }
}
