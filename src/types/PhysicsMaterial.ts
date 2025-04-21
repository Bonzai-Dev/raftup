import { Vector3 } from "@babylonjs/core";

export interface PhysicsMaterial {
  friction?: number;
  restitution?: number;
  mass?: number;
  inertia?: Vector3;
}