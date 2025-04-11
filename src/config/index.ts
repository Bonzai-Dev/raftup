import PhysicsSettings from "@/types/PhysicsSettings";
import { Vector3 } from "@babylonjs/core";

export const physics: PhysicsSettings = {
  gravity: new Vector3(0, -9.81, 0),
};

interface InputsMap {
  inspector: string[];
  freeCamera: string[];
  moveForward: string[];
  moveBackward: string[];
  moveLeft: string[];
  moveRight: string[];
  jump: string[];
}

// Map inputs using the javascript key codes
// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
export const inputsMap: InputsMap = {
  inspector: ["Shift", "I", "Control", "Alt"],
  freeCamera: ["Shift", "F", "Control", "Alt"],
  moveForward: ["W"],
  moveBackward: ["S"],
  moveLeft: ["A"],
  moveRight: ["D"],
  jump: [" "],
}