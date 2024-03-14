type Snippet = {
  snippet: string;
  description: string;
  _id?: ObjectId;
  user?: User;
  username?: string;
};

type User = {
  username: string;
  _id?: ObjectId;
  secret?: string;
};

type QueryUser = {
  _id: ObjectId;
  secret?: string;
};

type Info = {
  version: string;
  name: string;
};

type ExportSnippetsResposne = {
  streamContent: Readable & AsyncIterable<WithId<Document>>;
  count: number;
};

type Salt = {
  value: string;
};
