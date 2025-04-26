import { Vector3 } from "@babylonjs/core";
import { minutesToSeconds } from "@/utils/time";
import PhysicsSettings from "@/types/PhysicsSettings";
import DayNightCycleSettings from "@/types/DayNightCycle";

export const physics: PhysicsSettings = {
  gravity: new Vector3(0, -19.62, 0),
};

export const dayNightCycle: DayNightCycleSettings = {
  dayDuration: minutesToSeconds(2),
}

export const tags = {
  pickable: "pickable",
  floating: "floatingObject"
}

interface InputsMap {
  inspector: string[];
  freeCamera: string[];
  moveForward: string[];
  moveBackward: string[];
  moveLeft: string[];
  moveRight: string[];
  jump: string[];
  pickUp: string[];
  drop: string[];
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
  pickUp: ["E"],
  drop: ["Q"],
}