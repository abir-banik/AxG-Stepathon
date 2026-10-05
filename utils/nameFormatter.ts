/**
 * Formats a participant's name to "First L." (full first name + last name initial)
 * for privacy and data compliance (e.g., "Jordan Smith" -> "Jordan S.").
 * Idempotent: calling it on "Jordan S." returns "Jordan S.".
 */
export const formatParticipantName = (rawName: string): string => {
  if (!rawName || typeof rawName !== 'string') return '';
  const cleaned = rawName.trim().replace(/\s+/g, ' ');
  if (!cleaned) return '';

  const parts = cleaned.split(' ');
  if (parts.length === 1) {
    return parts[0];
  }

  const firstName = parts[0];
  const lastPart = parts[parts.length - 1].replace(/[^a-zA-Z0-9]/g, '');
  if (!lastPart) {
    return firstName;
  }

  const lastInitial = lastPart.charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
};
