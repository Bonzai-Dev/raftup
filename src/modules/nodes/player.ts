import GameObject, { GameObjectParameters } from "./gameObject";
import { KeyboardEventTypes, PointerEventTypes, MeshBuilder, PhysicsShapeType, Vector3 } from "@babylonjs/core";
import Game from "@/modules/game";

export default class Player extends GameObject {
  constructor() {
    const scene = Game.getInstance().getScene();
    const parameters: GameObjectParameters = {
      mesh: MeshBuilder.CreateCapsule("player", { height: 2, radius: 0.5 }, scene),
      collider: PhysicsShapeType.CAPSULE,
      physicsMaterial: { mass: 1 },
    };

    super(parameters);
    this.collider.body.setMassProperties({ inertia: Vector3.Zero() });

    scene.onPointerObservable.add(function (pointerInfo) {
      if (pointerInfo.type === PointerEventTypes.POINTERMOVE) {
        const evt = pointerInfo.event;
        const mouseX = evt.clientX;
        const mouseY = evt.clientY;
        console.log("Mouse moved to position: (" + mouseX + ", " + mouseY + ")");
      }
    });


    // Brother make better input system pls
    scene.onKeyboardObservable.add(function (keyboardInfo) {
      if (keyboardInfo.type === KeyboardEventTypes.KEYDOWN) {
        if (keyboardInfo.event.key === "w") {
          console.log("Moving forward");
        }

        if (
          keyboardInfo.event.shiftKey &&
          keyboardInfo.event.ctrlKey &&
          keyboardInfo.event.altKey &&
          (keyboardInfo.event.key === "I" || keyboardInfo.event.key === "i")
        ) {
          console.log("Toggling Inspector");
          if (scene.debugLayer.isVisible()) scene.debugLayer.hide();
          else scene.debugLayer.show();
        }
      }
    });
  }
}
