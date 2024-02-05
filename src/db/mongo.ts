import { Collection, Db, MongoClient } from 'mongodb';
import config from 'config';
let mongodb: MongoClient;

export async function connect() {
  const userDb = config.get('mongodb.user');
  const passDb = config.get('mongodb.password');
  const ipDb = config.get('mongodb.ip');
  const portDb = config.get('mongodb.port');

  const url = `mongodb://${userDb}:${passDb}@${ipDb}:${portDb}`;
  const client = new MongoClient(url);
  mongodb = await client.connect();
}

export function getDb(): Db {
  const dbName = String(config.get('mongodb.db'));
  return mongodb.db(dbName);
}

export async function close(): Promise<void> {
  await mongodb.close();
}

export async function getCollection(
  collectionName: string
): Promise<Collection> {
  await connect();
  const db = getDb();
  const collection = db.collection(collectionName);
  return collection;
}
