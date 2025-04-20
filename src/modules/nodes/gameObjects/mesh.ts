import { importGlb } from "@/utils/meshImport";
import {
  AbstractMesh,
  PhysicsBody,
  PhysicsMotionType,
  PhysicsShapeBox,
  Quaternion,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import Game from "@/modules/game";

export default class Mesh {
  protected readonly collider: any;
  protected readonly mesh: AbstractMesh;
  private meshRootNode: AbstractMesh | undefined;

  constructor(src: string, name: string) {
    this.loadMesh(src, name);
    this.mesh = this.meshRootNode as AbstractMesh;
  }

  private async loadMesh(src: string, name: string) {
    const scene = Game.getInstance().getScene();
    const mesh = await importGlb(src, name);

    const root = mesh.meshes[0];
    const newRoot = new TransformNode(name);
    root.parent = newRoot;

    const { min, max } = newRoot.getHierarchyBoundingVectors();
    const size = max.subtract(min);
    const center = min.add(max).scale(0.5);

    const shape = new PhysicsShapeBox(new Vector3(center.x, center.y, center.z), Quaternion.Identity(), size, scene);
    const body = new PhysicsBody(newRoot, PhysicsMotionType.DYNAMIC, false, scene);
    body.shape = shape;
    body.setMassProperties({ mass: 5000 });

    for (let i = 0; i < mesh.meshes.length; i++) {
      const child = mesh.meshes[i];
      child.receiveShadows = true;
    }

    return shape;
  }
}
