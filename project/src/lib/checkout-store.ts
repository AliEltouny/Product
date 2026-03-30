type VerificationRecord = {
  code: string;
  expiresAt: number;
};

const verificationStore = new Map<string, VerificationRecord>();

const TEN_MINUTES_MS = 10 * 60 * 1000;

export function createVerificationCode(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const code = String(Math.floor(100000 + Math.random() * 900000));
  verificationStore.set(normalizedEmail, {
    code,
    expiresAt: Date.now() + TEN_MINUTES_MS,
  });
  return code;
}

export function verifyCode(email: string, code: string) {
  const normalizedEmail = normalizeEmail(email);
  const record = verificationStore.get(normalizedEmail);

  if (!record) {
    return { ok: false, reason: 'No verification code found. Request a new one.' as const };
  }

  if (Date.now() > record.expiresAt) {
    verificationStore.delete(normalizedEmail);
    return { ok: false, reason: 'Verification code expired. Request a new one.' as const };
  }

  if (record.code !== code.trim()) {
    return { ok: false, reason: 'Invalid verification code.' as const };
  }

  verificationStore.delete(normalizedEmail);
  return { ok: true as const };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
