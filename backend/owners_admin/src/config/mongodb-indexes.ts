import { Db, IndexDescription } from "mongodb";
import definitions from "./mongodb-index-definitions.json";

const indexes = definitions as unknown as Record<string, IndexDescription[]>;

export const ensureMongoIndexes = async (db: Db): Promise<void> => {
  for (const [collectionName, collectionIndexes] of Object.entries(indexes)) {
    await db.collection(collectionName).createIndexes(collectionIndexes);
  }
};
