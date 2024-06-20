import { logger } from '../../util';
import { getCollection } from '../../db/mongo';
import config from 'config';
import { errorControllerHandler } from '../../errorHandlers';
import { ObjectId } from 'mongodb';
import { APActivity, APNote, APRoot } from 'activitypub-types';
import { CREATE } from '../utils/fedi.constants';

const collectionName = String(
  config.get('mongodb.collections.federation.snippets')
);

export async function saveActivityOrNote(
  activityOrNote: APNote | APRoot<APActivity>,
  snippetId: ObjectId
): Promise<ObjectId | undefined> {
  try {
    const collection = await getCollection(collectionName);
    const actOrNote: ActivityOrNote = {
      content: activityOrNote,
      createdAt: new Date().toISOString(),
      snippetId,
    };
    const insertResult = await collection.insertOne(actOrNote);
    logger.debug('Inserted activity or note', insertResult);
    const id: ObjectId = insertResult.insertedId;
    return id;
  } catch (error) {
    errorControllerHandler(error);
  }
}

export async function getActivities(): Promise<Activity[] | undefined> {
  try {
    const collection = await getCollection(collectionName);
    const results = await collection.find({ 'content.type': CREATE }).toArray();
    const activities: Activity[] = [];
    if (results != null) {
      for (const result of results) {
        const activity: Activity = {
          id: result._id,
          content: result.content,
          createdAt: result.createdAt,
        };
        activities.push(activity);
      }
    }
    return activities;
  } catch (error) {
    errorControllerHandler(error);
  }
}

export async function getActivity(id: string): Promise<Activity | undefined> {
  try {
    const collection = await getCollection(collectionName);
    const _id: ObjectId = new ObjectId(id);
    const result = await collection.findOne({ _id });
    if (result != null) {
      const activity: Activity = {
        id: result._id,
        content: result.content,
        createdAt: result.createdAt,
      };
      return activity;
    }
  } catch (error) {
    errorControllerHandler(error);
  }
}

export async function getPwyllSnippetByActivityId(
  id: string
): Promise<ObjectId | undefined> {
  try {
    const collection = await getCollection(collectionName);
    const result = await collection.findOne({
      'content.object.id': id,
    });
    if (result != null) {
      return result.snippetId;
    }
  } catch (error) {
    errorControllerHandler(error);
  }
}
