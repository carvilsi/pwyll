type SnippetObject = {
  snippet: string;
  description: string;
  userID?: string;
  secret?: string;
};

type ConfigSecretPolicies = {
  commonPassword?: boolean;
  passwordLength?: number;
  shannonEntropyBits?: number;
  strengthCode?: string[];
  number?: boolean;
  lower?: boolean;
  upper?: boolean;
  punctuation?: boolean;
  symbol?: boolean;
};

type TestGlobals = {
  __PYWLL_SERVER_URL__: string;
  __SNIPPET_OBJECT__: SnippetObject;
  __SECOND_SNIPPET_OBJECT__: SnippetObject;
  __FAKE_ID__: string;
  __INVALID_ID__: string;
  __EXPORT_FILE__: string;
  __FORBIDDEN_USER_NAMES__: string[];
  __VERY_STRONG_CONGIG_SECRET__: ConfigSecretPolicies;
  __STRONG_SECRET__: string;
  __SECOND_STRONG_SECRET__: string;
  __WEAK_SECRET__: string;
};

const testGlobals: TestGlobals = {
  __PYWLL_SERVER_URL__: 'http://localhost:46521',
  __SNIPPET_OBJECT__: {
    snippet: 'nodemon -e js,ts -x ts-node --files src/index.ts',
    description: 'dev mode nodemon typescript ts-node',
    userID: 'something',
    secret: 'PmeZVly51Zevqiwh+qCy.',
  },
  __SECOND_SNIPPET_OBJECT__: {
    snippet: 'nodemon src/',
    description: 'generic nodemon for source folder changes',
  },
  __INVALID_ID__: '000aa0000a0aa0000a00a23',
  __FAKE_ID__: '625ae0149d0bd9638b60e498',
  __EXPORT_FILE__: 'export-file.json',
  __FORBIDDEN_USER_NAMES__: ['anyone', 'pwyll', 'Anyone', 'PWYLL'],
  __VERY_STRONG_CONGIG_SECRET__: {
    commonPassword: false,
    passwordLength: 20,
    shannonEntropyBits: 80,
    strengthCode: ['STRONG', 'VERY_STRONG'],
    number: true,
    lower: true,
    upper: true,
    punctuation: true,
    symbol: true,
  },
  __STRONG_SECRET__: 'PmeZVly51Zevqiwh+qCy.',
  __SECOND_STRONG_SECRET__: '5meZVly51ZevqIWh+qCy,',
  __WEAK_SECRET__: '12345',
};

export default testGlobals;
