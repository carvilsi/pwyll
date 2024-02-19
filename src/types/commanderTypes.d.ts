type Command = {
  command: string;
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
}
