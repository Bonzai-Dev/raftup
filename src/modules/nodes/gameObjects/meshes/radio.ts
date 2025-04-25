import { PhysicsShapeType, Vector3 } from "@babylonjs/core";
import { GameObjectParameters } from "../object";
import Mesh from "./mesh";
import { tags } from "@/config";

export default class Radio extends Mesh {
  constructor(position: Vector3, rotation: Vector3) {
    const parameters: GameObjectParameters = {
      collider: PhysicsShapeType.BOX,
      position: position,
      rotation: rotation,
      physicsMaterial: { mass: 50, restitution: 0, friction: 50 },
      tags: [tags.pickable, tags.floating],
    }
    super("/assets/models/radio.glb", "radio", parameters);
  }
}