import crypto from "node:crypto";
import express from 'express';
import fetch from 'node-fetch';
import { assert } from "superstruct";
import { Actor } from "./activityPubTypes";
import { 
    APActivity, 
    APNote, 
    APRoot 
} from "activitypub-types";
import config  from "config";
import { 
    getFollowers, 
    saveActivityOrNote 
} from "./db";
import { 
    CONTEXT, 
    CREATE, 
    TO_PUBLIC 
} from "./utils/fedi.constants";

const DOMAIN = config.get('federation.domain');
const ACCOUNT = config.get('federation.account');
const actor: string = `https://${DOMAIN}/${ACCOUNT}`;

export async function createFediSnippet(
    snippet: Snippet, 
    user: User
): Promise<void> {
    const date = new Date();
    const content = 
        `<p><b>${user.username}</b> created a snippet:</p>` +
        `<p><i>- ${snippet.description}:</p></i>` +
        `<p><b>$</b> <code>${snippet.snippet}</code></p>`; 
    const apNote: APNote = {
        type: "Note",
        content: content,
        contentMap: {
            en: content,
        },
        // TODO: use the pwyll user
        attributedTo: actor,
        to: [ TO_PUBLIC ],
        cc: [ `${actor}/followers` ],
        published: date.toISOString(),
    };
    
    const noteId = await saveActivityOrNote(apNote);
    apNote.id = `${actor}/posts/${noteId}`;

    const activity: APRoot<APActivity> = {
        ...CONTEXT,
        type: CREATE,
        published: date.toISOString(),
        actor,
        to: [ TO_PUBLIC ],
        cc: [ `${actor}/followers` ],
        object: apNote,
    };

    const activityId = await saveActivityOrNote(activity);
    const followers = await getFollowers();
    if (followers?.length) {
        for (const follower of followers) {
            await send(actor, follower.actor, {
                ...activity,
                id: `${actor}/posts/${activityId}`,
                cc: [ follower.actor ],
            });
        }
    }
}

// TODO: deal with this in cofiguration
const keypair = crypto.generateKeyPairSync("rsa", { modulusLength: 4096 });
export const PUBLIC_KEY = keypair.publicKey.export({ type: "spki", format: "pem" });
const PRIVATE_KEY = keypair.privateKey.export({ type: "pkcs8", format: "pem" });

/** Fetches and returns an actor at a URL. */
// TODO: this s giving issues on a mastodon real server
// maybe we can blame ngrok about the dealy
// Also maybe swap to another fetch alternative, axios?
async function fetchActor(url: string) {
    console.dir(url);
    const res = await fetch(url, {
        headers: { accept: "application/activity+json" },
    });

    console.log('00000000------0000000')
    console.dir(res);

    if (res.status < 200 || 299 < res.status)
        throw new Error(`Received ${res.status} fetching actor.`);

    const body = await res.json();
    assert(body, Actor);
    console.dir(body);
    return body;
}

/** Sends a signed message from the sender to the recipient.
 * @param sender The sender's actor URL.
 * @param recipient The recipient's actor URL.
 * @param message the body of the request to send.
 */
export async function send(
    sender: string, 
    recipient: string, 
    message: object
) {
  const url = new URL(recipient);
  const actor = await fetchActor(recipient);
  const fragment = actor.inbox.replace("https://" + url.hostname, "");
  const body = JSON.stringify(message);
  const digest = crypto.createHash("sha256").update(body).digest("base64");
  const d = new Date();

  const key = crypto.createPrivateKey(PRIVATE_KEY.toString());
  const data = [
    `(request-target): post ${fragment}`,
    `host: ${url.hostname}`,
    `date: ${d.toUTCString()}`,
    `digest: SHA-256=${digest}`,
  ].join("\n");
  const signature = crypto
    .sign("sha256", Buffer.from(data), key)
    .toString("base64");

  const res = await fetch(actor.inbox, {
    method: "POST",
    headers: {
      host: url.hostname,
      date: d.toUTCString(),
      digest: `SHA-256=${digest}`,
      "content-type": "application/json",
      signature: `keyId="${sender}#main-key",headers="(request-target) host date digest",signature="${signature}"`,
      accept: "application/json",
    },
    body,
  });

  if (res.status < 200 || 299 < res.status) {
    throw new Error(res.statusText + ": " + (await res.text()));
  }

  return res;
}

/** Verifies that a request came from an actor.
 * Returns the actor's ID if the verification succeeds; throws otherwise.
 * @param req An Express request.
 * @returns The actor's ID. */
export async function verify(
    req: express.Request
): Promise<string> {
  // get headers included in signature
  const included: Record<string, string> = {};
  for (const header of req.get("signature")?.split(",") ?? []) {
    const [key, value] = header.split("=");
    if (!key || !value) continue;

    included[key] = value.replace(/^"|"$/g, "");
  }

  /** the URL of the actor document containing the signature's public key */
  const keyId = included.keyId;
  if (!keyId) throw new Error(`Missing "keyId" in signature header.`);

  /** the signed request headers */
  const signedHeaders = included.headers;
  if (!signedHeaders) throw new Error(`Missing "headers" in signature header.`);

  /** the signature itself */
  const signature = Buffer.from(included.signature ?? "", "base64");
  if (!signature) throw new Error(`Missing "signature" in signature header.`);

  // ensure that the digest header matches the digest of the body
  const digestHeader = req.get("digest");
  if (digestHeader) {
    const digestBody = crypto
      .createHash("sha256")
      .update(Buffer.from(req.body))
      .digest("base64");
    if (digestHeader !== "SHA-256=" + digestBody) {
      throw new Error(`Incorrect digest header.`);
    }
  }

  // get the actor's public key
  const actor = await fetchActor(keyId);
  if (!actor.publicKey) throw new Error("No public key found.");
  const key = crypto.createPublicKey(actor.publicKey.publicKeyPem);

  // reconstruct the signed header string
  const comparison = signedHeaders
    .split(" ")
    .map((header) => {
      if (header === "(request-target)")
        return "(request-target): post " + req.baseUrl + req.path;
      return `${header}: ${req.get(header)}`;
    })
    .join("\n");
  const data = Buffer.from(comparison);

  // verify the signature against the headers using the actor's public key
  const verified = crypto.verify("sha256", data, key, signature);
  if (!verified) throw new Error("Invalid request signature.");

  // ensure the request was made recently
  const now = new Date();
  const date = new Date(req.get("date") ?? 0);
  if (now.getTime() - date.getTime() > 30_000)
    throw new Error("Request date too old.");

  return actor.id;
}