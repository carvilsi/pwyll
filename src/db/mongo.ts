import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb';
import config from 'config';

const userDb = config.get('mongodb.user');
const passDb = config.get('mongodb.password');
const ipDb = config.get('mongodb.ip');
const portDb = config.get('mongodb.port');

const url = `mongodb://${userDb}:${passDb}@${ipDb}:${portDb}`;

export const client = new MongoClient(url, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export function getDb(): Db {
  const dbName = String(config.get('mongodb.db'));
  return client.db(dbName);
}

export async function getCollection(
  collectionName: string
): Promise<Collection> {
  await client.connect();
  const db = getDb();
  const collection = db.collection(collectionName);
  return collection;
}
