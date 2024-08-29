import { KVCollection } from "./kvCollection";

export const contractCollection = new KVCollection<{
  address: string;
  name: string;
}>("contracts:");
