import { logger } from '../util';
import { getCollection } from '../db/mongo';
import config from 'config';
import _ from 'lodash';
import { errorControllerHandler } from '../errorHandlers';
import { ObjectId } from 'mongodb';
import { 
    APActivity, 
    APNote, 
    APRoot 
} from 'activitypub-types';
import { CREATE } from './utils/fedi.constants';

export async function createFollower(
  actor: string,
  uri: string,
): Promise<void> {
  try {
    const collectionName = 
    String(config.get('mongodb.collections.federation.followers'));
    const collection = await getCollection(collectionName);
    const follower: Follower = {
      actor,
      uri,
      createdAt: new Date().toISOString(),
    };
    const insertResult = await collection.updateOne(
        { actor: actor },
        { $set: follower },
        { upsert: true });
    logger.debug('Inserted documents =>', insertResult);
  } catch (error) {
    // TODO: check this error handler, maybe too much pwyll oriented for fedi
    errorControllerHandler(error);
  }
}

export async function saveActivityOrNote(
    activityOrNote: APNote | APRoot<APActivity>
): Promise<ObjectId | undefined> {
    try {
        const collectionName = 
        String(config.get('mongodb.collections.federation.snippets'));
        const collection = await getCollection(collectionName);
        const actOrNote: ActivityOrNote = {
            content: activityOrNote,
            createdAt: new Date().toISOString(),
        }
        const insertResult = await collection.insertOne(actOrNote);
        logger.debug('Inserted activity or note', insertResult);
        const id: ObjectId = insertResult.insertedId;
        return id;
    } catch (error) {
        errorControllerHandler(error);
    }
}

export async function unFollower(actor: string): Promise<void> {
    try {
        const collectionName = 
        String(config.get('mongodb.collections.federation.followers'));
        const collection = await getCollection(collectionName);
        const deleteResult = await collection.deleteOne({ actor: actor });
        logger.debug('Deleted follower =>', deleteResult);        
    } catch (error) {
        errorControllerHandler(error);
    }
}

export async function getActivities(): Promise<Activity[]|undefined> {
    try {
        const collectionName = String(config.get('mongodb.collections.federation.snippets'));
        const collection = await getCollection(collectionName);
        const results = await collection.find(
            { 'content.type': CREATE }
        ).toArray();
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

export async function getActivity(
    id: string
): Promise<Activity | undefined> {
    try {
        const collectionName = 
        String(config.get('mongodb.collections.federation.snippets'));
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

export async function getFollowers(): Promise<Follower[]|undefined> {
    try {
        const collectionName = 
        String(config.get('mongodb.collections.federation.followers'));
        const collection = await getCollection(collectionName);
        const results = await collection.find().toArray();
        const followers: Follower[] = [];
        if (results != null) {
            for (const result of results) {
                const follower: Follower = {
                actor: result.actor,
                uri: result.uri,
                createdAt: result.createdAt,
            };
            followers.push(follower);
            }
        }
        return followers;
    } catch (error) {
        errorControllerHandler(error);
    } 
}