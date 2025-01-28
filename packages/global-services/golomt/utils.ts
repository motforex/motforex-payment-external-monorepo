import * as crypto from 'crypto';

export function generateSha256Checksum(secretKey: string, args: Array<string>): string {
  const mergedString: string = args.filter(Boolean).join('');
  const hash = crypto.createHmac('sha256', secretKey).update(mergedString);
  return hash.digest('hex');
}
