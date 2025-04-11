export default class Inputs {
  private static instance: Inputs;
  private readonly pressedKeys: string[] = [];

  private constructor() {
    window.addEventListener("keydown", (event) => {
      const pressedKey = event.key.toLowerCase();
      if (!this.pressedKeys.includes(pressedKey)) this.pressedKeys.push(pressedKey);
    });

    window.addEventListener("keyup", (event) => {
      const releasedKey = event.key.toLowerCase();
      this.pressedKeys.splice(this.pressedKeys.indexOf(releasedKey), 1);
    });

    window.addEventListener("blur", () => {
      this.pressedKeys.length = 0;
    });
  }

  public static getInstance(): Inputs {
    if (!Inputs.instance) Inputs.instance = new this();
    return Inputs.instance;
  }

  // this also returns true if there are other keys pressed along with the provided keys
  public keysDown(keys: string[]): boolean {
    return keys.every((key) => this.pressedKeys.includes(key.toLowerCase()));
  }
}
