import {
  ImportMeshAsync,
  ISceneLoaderAsyncResult,
} from "@babylonjs/core";
import Game from "@/modules/game";

export async function importGlb(src: string): Promise<ISceneLoaderAsyncResult> {
  const scene = Game.getInstance().getScene();
  const result = await ImportMeshAsync(src, scene);
  return result;
}