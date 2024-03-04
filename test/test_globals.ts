type SnippetObject = {
  snippet: string;
  description: string;
  userID?: string;
  secret?: string;
};

type TestGlobals = {
  __PYWLL_SERVER_URL__: string;
  __SNIPPET_OBJECT__: SnippetObject;
  __SECOND_SNIPPET_OBJECT__: SnippetObject;
  __FAKE_ID__: string;
  __INVALID_ID__: string;
  __EXPORT_FILE__: string;
};

const testGlobals: TestGlobals = {
  __PYWLL_SERVER_URL__: 'http://localhost:46520',
  __SNIPPET_OBJECT__: {
    snippet: 'nodemon -e js,ts -x ts-node --files src/index.ts',
    description: 'dev mode nodemon typescript ts-node',
    userID: 'something',
    secret: 'a secret',
  },
  __SECOND_SNIPPET_OBJECT__: {
    snippet: 'nodemon src/',
    description: 'generic nodemon for source folder changes',
  },
  __INVALID_ID__: '000aa0000a0aa0000a00a23',
  __FAKE_ID__: '625ae0149d0bd9638b60e498',
  __EXPORT_FILE__: 'export-file.json',
};

export default testGlobals;
