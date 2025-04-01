import PhysicsSettings from "@/types/PhysicsSettings";
import { Vector3 } from "@babylonjs/core";

export const physics: PhysicsSettings = {
  gravity: new Vector3(0, -9.81, 0),
};
