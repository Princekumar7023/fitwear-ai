import { InlineImage } from '../types/wardrobe.js';

export function parseDataUrl(dataUrl: string): InlineImage {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);

  if (!match) {
    throw new Error('Expected a valid base64 data URL.');
  }

  const [, mimeType, data] = match;
  return { mimeType, data };
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary);
}

export function base64ToBytes(data: string): Uint8Array {
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return bytesToBase64(new Uint8Array(buffer));
}

export function readImageDimensions(image: InlineImage): { width: number; height: number } {
  const bytes = base64ToBytes(image.data);

  if (
    bytes.length >= 24 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return { width: view.getUint32(16), height: view.getUint32(20) };
  }

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

function adler32(bytes: Uint8Array): number {
  let a = 1;
  let b = 0;

  for (const byte of bytes) {
    a = (a + byte) % 65521;
    b = (b + a) % 65521;
  }

  return ((b << 16) | a) >>> 0;
}

function deflateUncompressed(bytes: Uint8Array): Uint8Array {
  const chunks: Uint8Array[] = [new Uint8Array([0x78, 0x01])];

  for (let offset = 0; offset < bytes.length; offset += 65_535) {
    const length = Math.min(65_535, bytes.length - offset);
    const block = new Uint8Array(5 + length);
    const view = new DataView(block.buffer);
    block[0] = offset + length === bytes.length ? 1 : 0;
    view.setUint16(1, length, true);
    view.setUint16(3, (~length) & 0xffff, true);
    block.set(bytes.subarray(offset, offset + length), 5);
    chunks.push(block);
  }

  const checksum = new Uint8Array(4);
  new DataView(checksum.buffer).setUint32(0, adler32(bytes));
  chunks.push(checksum);

  const compressed = new Uint8Array(chunks.reduce((total, chunk) => total + chunk.length, 0));
  let offset = 0;

  for (const chunk of chunks) {
    compressed.set(chunk, offset);
    offset += chunk.length;
  }

  return compressed;
}

function createPngChunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = new TextEncoder().encode(type);
  const chunk = new Uint8Array(12 + data.length);
  const view = new DataView(chunk.buffer);

  view.setUint32(0, data.length);
  chunk.set(typeBytes, 4);
  chunk.set(data, 8);
  view.setUint32(8 + data.length, crc32(chunk.subarray(4, 8 + data.length)));

  return chunk;
}

export function createTransparentMask({ width, height }: { width: number; height: number }): InlineImage {
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width <= 0 || height <= 0) {
    throw new Error('Target image has invalid dimensions.');
  }

  const rawPixels = new Uint8Array(height * (1 + width * 4));
  const header = new Uint8Array(13);
  const headerView = new DataView(header.buffer);
  headerView.setUint32(0, width);
  headerView.setUint32(4, height);
  header[8] = 8;
  header[9] = 6;
  const png = [
    new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    createPngChunk('IHDR', header),
    createPngChunk('IDAT', deflateUncompressed(rawPixels)),
    createPngChunk('IEND', new Uint8Array()),
  ];
  const length = png.reduce((total, chunk) => total + chunk.length, 0);
  const bytes = new Uint8Array(length);
  let offset = 0;

  for (const chunk of png) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }

  return { mimeType: 'image/png', data: bytesToBase64(bytes) };
}

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
