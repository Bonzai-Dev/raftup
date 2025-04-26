import { AudioEngineV2, CreateAudioEngineAsync, CreateSoundAsync, Engine, StaticSound } from "@babylonjs/core";
import GameScene from "./scenes/scene";
import Menu from "@/modules/scenes/menu";

export enum GameStates {
  MENU,
  PLAYING,
  PAUSED,
  GAME_OVER,
}

export default class Game {
  private static instance: Game;
  private scene: GameScene;
  private readonly engine: Engine;
  protected audioEngine: AudioEngineV2 | undefined;
  private readonly canvas: HTMLCanvasElement;
  private readonly fadeTransition: HTMLDivElement;
  private currentState = GameStates.MENU;
  private menuMusic: StaticSound | undefined;
  private radioMusic: StaticSound | undefined;

  private constructor() {
    this.fadeTransition = document.createElement("div");
    this.fadeTransition.style.position = "absolute";
    this.fadeTransition.style.width = "100vw";
    this.fadeTransition.style.height = "100vh";
    this.fadeTransition.style.backgroundColor = "black";
    this.fadeTransition.style.pointerEvents = "none";
    document.body.appendChild(this.fadeTransition);

    this.canvas = document.createElement("canvas");
    document.body.appendChild(this.canvas);

    this.engine = new Engine(this.canvas, true);
    this.scene = new Menu({ engine: this.engine, canvas: this.canvas });
    this.loadGame();
    this.loadAudio();
  }

  private async loadGame() {
    window.addEventListener("resize", () => {
      this.engine.resize();
    });

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  private async loadAudio() {
    this.audioEngine = this.audioEngine = await CreateAudioEngineAsync({
      volume: 0.5,
      listenerAutoUpdate: true,
      listenerEnabled: true,
    });

    this.radioMusic = await CreateSoundAsync("music", "/assets/sounds/funkyRadioMix.wav", {
      spatialEnabled: true,
      spatialAutoUpdate: true,
      loop: true,
      spatialDistanceModel: "linear",
      spatialMaxDistance: 20,
    });

    this.menuMusic = await CreateSoundAsync("music", "/assets/sounds/funky.wav");

    await this.audioEngine!.unlockAsync();

    this.menuMusic.play({ loop: true });
    this.radioMusic.play({ loop: true, volume: 0 });
  }

  public static getInstance(): Game {
    if (!Game.instance) Game.instance = new this();
    return this.instance;
  }

  public getScene(): GameScene {
    return this.scene as GameScene;
  }

  public getEngine(): Engine {
    return this.engine;
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public getCurrentState(): GameStates {
    return this.currentState;
  }

  public setCurrentState(state: GameStates) {
    this.currentState = state;
  }

  public setScene(scene: GameScene) {
    this.radioMusic?.spatial.attach(null);
    this.scene.dispose();
    this.scene = scene;
  }

  public getFadeTransition(): HTMLDivElement {
    return this.fadeTransition;
  }

  public getAudioEngine(): AudioEngineV2 {
    return this.audioEngine as AudioEngineV2;
  }

  public getMenuMusic(): StaticSound {
    return this.menuMusic as StaticSound;
  }

  public getRadioMusic(): StaticSound {
    return this.radioMusic as StaticSound;
  }
}
