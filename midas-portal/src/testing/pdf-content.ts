import { inflateSync } from 'zlib';

/**
 * The text a PDF would draw on the page, read out of its content streams.
 *
 * A PDF is still structurally valid when its table is empty, so asserting on the
 * bytes alone proves very little; this lets a test look for what should be in it.
 */
export function readablePdfText(pdf: Buffer): string {
  const raw = pdf.toString('latin1');
  let text = '';
  for (const match of raw.matchAll(/stream\r?\n([\s\S]*?)endstream/g)) {
    try {
      text += inflateSync(Buffer.from(match[1], 'latin1')).toString('latin1');
    } catch {
      // uncompressed stream
      text += match[1];
    }
  }
  return text;
}
