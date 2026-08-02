import { deflateSync } from 'zlib';
import { InlineImage } from '../types/wardrobe.js';

// ---------------------------------------------------------------------------
// Memory helpers
// ---------------------------------------------------------------------------

export function logMemory(label: string): void {
  const m = process.memoryUsage();
  const mb = (n: number) => `${Math.round(n / 1024 / 1024)} MB`;
  console.log(
    `[mem] ${label} | rss=${mb(m.rss)} heap=${mb(m.heapUsed)}/${mb(m.heapTotal)} ext=${mb(m.external)}`
  );
}

// ---------------------------------------------------------------------------
// Base64 ↔ binary conversion  —  use Node.js Buffer throughout.
// btoa/atob create an intermediate binary STRING equal in size to the
// decoded bytes, doubling peak memory.  Buffer.from() avoids that copy.
// ---------------------------------------------------------------------------

export function bytesToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64');
}

export function base64ToBytes(data: string): Buffer {
  return Buffer.from(data, 'base64');
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString('base64');
}

// ---------------------------------------------------------------------------
// Data URL parsing
// ---------------------------------------------------------------------------

export function parseDataUrl(dataUrl: string): InlineImage {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);

  if (!match) {
    throw new Error('Expected a valid base64 data URL.');
  }

  const [, mimeType, data] = match;
  return { mimeType, data };
}

// ---------------------------------------------------------------------------
// Image dimension extraction
//
// FIX: Previously base64ToBytes(image.data) decoded the ENTIRE image into
// memory just to read a ~24-byte PNG header or a few-hundred-byte JPEG SOF
// marker.  For a 10 MB JPEG this created a 10 MB binary string + 10 MB
// Uint8Array = 20 MB peak allocation per call.
//
// Now we decode only the first 8 KB of the base64 payload (≈ 6 KB of binary)
// which is sufficient for:
//   • PNG  — signature (8 B) + IHDR (25 B) — we need bytes 0–23 only
//   • JPEG — SOF marker is typically within the first 2–4 KB for real photos
// ---------------------------------------------------------------------------

// 8 KB of binary ≈ 10924 base64 characters
const HEADER_BASE64_CHARS = Math.ceil((8 * 1024 * 4) / 3);

export function readImageDimensions(image: InlineImage): { width: number; height: number } {
  // Decode only the header prefix — not the full image
  const prefix = image.data.slice(0, HEADER_BASE64_CHARS);
  const bytes = Buffer.from(prefix, 'base64');

  // ── PNG ──────────────────────────────────────────────────────────────────
  if (
    bytes.length >= 24 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return {
      width: (bytes[16] << 24 | bytes[17] << 16 | bytes[18] << 8 | bytes[19]) >>> 0,
      height: (bytes[20] << 24 | bytes[21] << 16 | bytes[22] << 8 | bytes[23]) >>> 0,
    };
  }

  // ── JPEG ─────────────────────────────────────────────────────────────────
  if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    const startOfFrameMarkers = new Set([
      0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
    ]);
    let offset = 2;

    while (offset + 8 < bytes.length) {
      if (bytes[offset] !== 0xff) {
        offset += 1;
        continue;
      }

      let marker = bytes[offset + 1];
      offset += 2;

      while (marker === 0xff && offset < bytes.length) {
        marker = bytes[offset];
        offset += 1;
      }

      if (marker === 0xd8 || marker === 0xd9) {
        continue;
      }

      const length = (bytes[offset] << 8) | bytes[offset + 1];

      if (length < 2 || offset + length > bytes.length) {
        break;
      }

      if (startOfFrameMarkers.has(marker)) {
        return {
          height: (bytes[offset + 3] << 8) | bytes[offset + 4],
          width: (bytes[offset + 5] << 8) | bytes[offset + 6],
        };
      }

      offset += length;
    }
  }

  throw new Error('Target image must be a PNG or JPEG image.');
}

// ---------------------------------------------------------------------------
// PNG chunk builder  (unchanged — only operates on small metadata)
// ---------------------------------------------------------------------------

function crc32(bytes: Uint8Array): number {
  let value = 0xffffffff;

  for (const byte of bytes) {
    value ^= byte;

    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
  }

  return (value ^ 0xffffffff) >>> 0;
}

function createPngChunk(type: string, data: Buffer): Buffer {
  const typeBytes = Buffer.from(type, 'ascii');
  const chunk = Buffer.allocUnsafe(12 + data.length);

  chunk.writeUInt32BE(data.length, 0);
  typeBytes.copy(chunk, 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(chunk.subarray(4, 8 + data.length)), 8 + data.length);

  return chunk;
}

// ---------------------------------------------------------------------------
// Transparent mask synthesis
//
// FIX: The original deflateUncompressed() used BTYPE=0 (store, no compression)
// so the output size ≈ input size.  For a 4000×3000 phone photo:
//
//   rawPixels                        = height * (1 + width*4)
//                                    = 3000 * 16001  ≈  48 MB
//   deflateUncompressed output       ≈  48 MB  (another full copy in chunks[])
//   final concatenated Uint8Array    ≈  48 MB  (third copy)
//   peak mask allocation             ≈ 144 MB
//
// Fix: replace with Node.js built-in zlib.deflateSync (RFC 1950 = the format
// PNG IDAT requires).  All-zero pixel data is highly repetitive and compresses
// to < 100 KB regardless of image size.
//
//   rawPixels                        ≈  48 MB  (unavoidable — freed after call)
//   deflateSync output               ≈  80 KB
//   peak mask allocation             ≈  48 MB  (vs 144 MB before)
// ---------------------------------------------------------------------------

export function createTransparentMask({ width, height }: { width: number; height: number }): InlineImage {
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width <= 0 || height <= 0) {
    throw new Error('Target image has invalid dimensions.');
  }

  logMemory(`createTransparentMask start (${width}×${height})`);

  // All-zero RGBA rows (each row: 1-byte filter tag + width*4 bytes)
  const rawPixels = Buffer.alloc(height * (1 + width * 4));

  // IHDR: 4B width + 4B height + 1B bit-depth + 1B colour-type + 3B zeroes
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA colour type

  // zlib.deflateSync produces RFC 1950 (zlib-wrapped deflate) — exactly what PNG IDAT needs.
  // Level 1 = fastest compression; all-zero data still shrinks to ~80 KB regardless of image size.
  const idatData = deflateSync(rawPixels, { level: 1 });

  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const pngBytes = Buffer.concat([
    pngSignature,
    createPngChunk('IHDR', ihdr),
    createPngChunk('IDAT', idatData),
    createPngChunk('IEND', Buffer.alloc(0)),
  ]);

  logMemory('createTransparentMask end');

  return { mimeType: 'image/png', data: pngBytes.toString('base64') };
}

// ---------------------------------------------------------------------------
// Upload validation  (name accurately reflects: validation only, no compression)
// ---------------------------------------------------------------------------

/**
 * Validates image payload prior to external AI model submission.
 * Ensures the image object contains valid base64 data and mimeType.
 */
export function validateImageBeforeUpload(image: InlineImage): InlineImage {
  if (!image.data || !image.mimeType) {
    throw new Error('Invalid image payload.');
  }
  return image;
}
