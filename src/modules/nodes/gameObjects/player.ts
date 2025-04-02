import GameObject, { GameObjectParameters } from "./";
import { KeyboardEventTypes, PointerEventTypes, MeshBuilder, PhysicsShapeType, Vector3 } from "@babylonjs/core";
import Game from "@/modules/game";

export default class Player extends GameObject {
  private moveVector = Vector3.Zero();

  constructor() {
    const scene = Game.getInstance().getScene();
    const parameters: GameObjectParameters = {
      mesh: MeshBuilder.CreateCapsule("Player", { height: 2, radius: 0.5 }, scene),
      collider: PhysicsShapeType.CAPSULE,
      physicsMaterial: { mass: 1 },
    };

    super(parameters);
    const glasses = MeshBuilder.CreateBox("Glasses", { height: 0.25, width: 0.8, depth: 0.3 }, scene);
    glasses.parent = this.mesh;
    glasses.position.y = 0.6;
    glasses.position.z = -0.35;

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
