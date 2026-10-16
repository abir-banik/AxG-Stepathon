import { describe, it, expect } from 'vitest';
import { sha256Hex, isValidSitePassword, isValidAdminPasscode } from '../utils/passwordHash';
import * as constants from '../constants';

describe('Salted SHA-256 Password Verification (utils/passwordHash.ts)', () => {
  it('computes standard FIPS 180-4 SHA-256 hex digests', () => {
    expect(sha256Hex('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    );
  });

  it('accepts Stepathon2027 (case-insensitive) for participant site access and rejects old/invalid passwords', () => {
    expect(isValidSitePassword('Stepathon2027')).toBe(true);
    expect(isValidSitePassword('STEPATHON2027')).toBe(true);
    expect(isValidSitePassword('  stepathon2027  ')).toBe(true);

    expect(isValidSitePassword('STEPATHON2026')).toBe(false);
    expect(isValidSitePassword('wrongpassword')).toBe(false);
    expect(isValidSitePassword('')).toBe(false);
  });

  it('accepts StepathonAdmin2027?! for host admin access and rejects guesses without ?!', () => {
    expect(isValidAdminPasscode('StepathonAdmin2027?!')).toBe(true);
    expect(isValidAdminPasscode('STEPATHONADMIN2027?!')).toBe(true);
    expect(isValidAdminPasscode('  stepathonadmin2027?! ')).toBe(true);

    expect(isValidAdminPasscode('StepathonAdmin2027')).toBe(false);
    expect(isValidAdminPasscode('STEPATHONADMIN2026')).toBe(false);
    expect(isValidAdminPasscode('')).toBe(false);
  });

  it('does not expose plaintext passwords in constants.ts', () => {
    const exportedValues = Object.values(constants).map(v => String(v));
    expect(exportedValues).not.toContain('STEPATHON2027');
    expect(exportedValues).not.toContain('Stepathon2027');
    expect(exportedValues).not.toContain('STEPATHONADMIN2027?!');
    expect(exportedValues).not.toContain('StepathonAdmin2027?!');
  });
});
