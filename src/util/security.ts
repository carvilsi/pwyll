import config from 'config';
const taiPasswordStrength = require('tai-password-strength');
const strengthTester = new taiPasswordStrength.PasswordStrength();

export function secretExistenceCheck(secret: string): boolean {
  if (!secret.trim().length) throw 'Provide a secret';
  return true;
}

export function secretPoliciesCheck(
  secret: string,
  secretPolicies: { [index: string]: any } = {}
): boolean {
  if (!Object.keys(secretPolicies).length) {
    secretPolicies = Object(
      process.env.SECURITY_SECRET_POLICIES ||
        config.get('security.secretPolicies')
    );
  }

  // Add in extra files for additional checks and better results
  strengthTester.addCommonPasswords(taiPasswordStrength.commonPasswords);
  const results = strengthTester.check(secret);

  for (const property in results) {
    if (property === 'charsets') {
      for (const charts in results[property]) {
        results[charts] = results[property][charts];
      }
    }
  }
  delete results.charsets;

  let passwordWeakness = `The secret: "${secret}" does not meet the security policies:`;
  let weak = false;

  for (const property in secretPolicies) {
    if (Object.hasOwn(results, property)) {
      if (!isNaN(parseFloat(secretPolicies[property]))) {
        if (results[property] < secretPolicies[property]) {
          passwordWeakness = `${passwordWeakness} \n - The ${property} should be greater or equal to ${secretPolicies[property]}`;
          weak = true;
        }
      }
      if (typeof secretPolicies[property] === 'boolean') {
        if (property === 'commonPassword') {
          if (!secretPolicies[property] && results[property]) {
            passwordWeakness = `${passwordWeakness} \n - Should not be a ${property}`;
            weak = true;
          }
        } else if (secretPolicies[property] !== results[property]) {
          passwordWeakness = `${passwordWeakness} \n - Should have ${property}`;
          weak = true;
        }
      }
      if (Array.isArray(secretPolicies[property])) {
        if (!secretPolicies[property].includes(results[property])) {
          passwordWeakness = `${passwordWeakness} \n - Is too weak`;
          weak = true;
        }
      }
    }
  }

  if (weak) {
    throw new Error(passwordWeakness);
  } else {
    return true;
  }
}
