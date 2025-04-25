export default class Inputs {
  private static instance: Inputs;
  private readonly pressedKeys: string[] = [];
  private readonly tappedKeys: string[] = [];

  private constructor() {
    window.addEventListener("keydown", (event) => {
      const pressedKey = event.key.toLowerCase();
      if (!this.pressedKeys.includes(pressedKey)) {
        this.pressedKeys.push(pressedKey);
        this.tappedKeys.push(pressedKey);
      }
    });

    window.addEventListener("keyup", (event) => {
      const releasedKey = event.key.toLowerCase();
      this.pressedKeys.splice(this.pressedKeys.indexOf(releasedKey), 1);
      this.tappedKeys.splice(this.tappedKeys.indexOf(releasedKey), 1);
    });

    window.addEventListener("blur", () => {
      this.pressedKeys.length = 0;
    });
  }

  public static getInstance(): Inputs {
    if (!Inputs.instance) Inputs.instance = new this();
    return Inputs.instance;
  }

  public keyTapped(keys: string[]): boolean {
    return keys.every((key) => {
      if (this.tappedKeys.includes(key.toLowerCase())) {
        this.tappedKeys.splice(this.tappedKeys.indexOf(key.toLowerCase()), 1);
        return true;
      }
    });
  }

  public keyDown(keys: string[]): boolean {
    return keys.every((key) => this.pressedKeys.includes(key.toLowerCase()));
  }

  public keysDown(keys: string[]): boolean {
    if (keys.length !== this.pressedKeys.length) return false;
    return keys.every((key) => this.pressedKeys.includes(key.toLowerCase()));
  }
}
