import { PhysicsShapeBox, PhysicsShapeType, Vector3 } from "@babylonjs/core";
import { GameObjectParameters } from "../object";
import Mesh from "./mesh";
import { tags } from "@/config";

export default class Radio extends Mesh {
  constructor(position: Vector3) {
    const parameters: GameObjectParameters = {
      collider: PhysicsShapeType.BOX,
      position: position,
      physicsMaterial: { mass: 5000, restitution: 0, friction: 1 },
      tags: [tags.pickable, tags.floating],
    }
    super("/src/assets/models/trash/radio.glb", "radio", parameters);
    
  }
}