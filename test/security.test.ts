/* eslint-disable node/no-unpublished-import */
/* eslint-disable no-undef */
/* eslint-disable node/no-unpublished-require */
import { describe, expect, test } from '@jest/globals';
import {
  getArgon2Hash,
  secretExistenceCheck,
  secretPoliciesCheck,
  validateArgon2Hash,
} from '../src/util/security';
import testGlobals from './test_globals';

describe('utils', () => {
  let hash: string;

  test('should allow a secret that does match the strong policies', () => {
    const res = secretPoliciesCheck(
      testGlobals.__STRONG_SECRET__,
      testGlobals.__VERY_STRONG_CONGIG_SECRET__
    );
    expect(res).toBe(true);
  });

  test('should allow a secret that does match the default policies', () => {
    const res = secretPoliciesCheck(testGlobals.__STRONG_SECRET__);
    expect(res).toBe(true);
  });

  test('should not allow a secret that does not match the policies', () => {
    try {
      secretPoliciesCheck(
        testGlobals.__WEAK_SECRET__,
        testGlobals.__VERY_STRONG_CONGIG_SECRET__
      );
    } catch (error) {
      expect(String(error)).toMatch(/does not meet the security policies:/i);
      expect(String(error)).toMatch(/- Should not be a commonPassword/i);
      expect(String(error)).toMatch(
        /- The passwordLength should be greater or equal to 20/i
      );
      expect(String(error)).toMatch(
        /- The shannonEntropyBits should be greater or equal to 80/i
      );
      expect(String(error)).toMatch(/- Is too weak/i);
      expect(String(error)).toMatch(/- Should have lower/i);
      expect(String(error)).toMatch(/- Should have upper/i);
      expect(String(error)).toMatch(/- Should have punctuation/i);
      expect(String(error)).toMatch(/- Should have symbol/i);
    }
  });

  test('should not allow an empty or blank secret', () => {
    expect(() => secretExistenceCheck('')).toThrow('Provide a secret');
    expect(() => secretExistenceCheck('  ')).toThrow('Provide a secret');
    const res = secretExistenceCheck('foobar');
    expect(res).toBe(true);
  });

  test('should get the argon2 hash for foobar and validate', async () => {
    const secret = 'foobar';
    hash = await getArgon2Hash(secret);
    const res = await validateArgon2Hash(hash, secret);
    expect(res).toBe(true);
  });

  test('should fail argon2 hash validation', async () => {
    try {
      await validateArgon2Hash(hash, 'secret');
    } catch (error) {
      expect(String(error)).toMatch('Invalid userID or secret');
    }
  });
});
