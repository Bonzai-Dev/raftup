import {
  ImportMeshAsync,
  ISceneLoaderAsyncResult,
} from "@babylonjs/core";
import Game from "@/modules/game";

export async function importGlb(src: string, name: string): Promise<ISceneLoaderAsyncResult> {
  const scene = Game.getInstance().getScene();
  const result = await ImportMeshAsync(src, scene);
  result.meshes[0].name = name;
  return result;
}