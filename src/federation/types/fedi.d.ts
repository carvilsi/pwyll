type PwyllUser = {
  _id: ObjectId;
  username: string;
};

type Follower = {
  actor: string;
  uri: string;
  createdAt: string;
  pwyllUser?: PwyllUser;
};

type ActivityOrNote = {
  content: object;
  createdAt: string;
};

type Activity = {
  id: ObjectId;
  content: APRoot<APActivity>;
  createdAt: string;
};

type UserResource = {
  username: string;
  resource: string;
  actor: string;
  pwyllUserId: ObjectId;
  fediUser: string;
};
