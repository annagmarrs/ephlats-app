/** Truncate notification body to last complete word before maxLength, append '…' */
export function truncateNotificationBody(body: string, maxLength = 100): string {
  if (body.length <= maxLength) return body;
  const truncated = body.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '…';
}
