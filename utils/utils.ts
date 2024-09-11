import { MODELS } from "@/constants";
import { InferenceEnum } from "@/types";

export function findInferenceByModelName(
  modelName: string,
): InferenceEnum | undefined {
  for (const key in MODELS) {
    if (MODELS[key as InferenceEnum].includes(modelName)) {
      return key as InferenceEnum;
    }
  }
  return undefined;
}
