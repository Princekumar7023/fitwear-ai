import { getWardrobePreset } from '@/data/wardrobe-presets';
import type {
  WardrobeGenerateRequest,
  WardrobeGenerateResponse,
  WardrobeMode,
} from '@/types/wardrobe';

const CATVTON_SPACE_URL = 'https://zhengchong-catvton.hf.space';
const CATVTON_CONFIG_URL = `${CATVTON_SPACE_URL}/config`;
const CATVTON_UPLOAD_URL = `${CATVTON_SPACE_URL}/gradio_api/upload`;
const CATVTON_QUEUE_URL = `${CATVTON_SPACE_URL}/gradio_api/call/submit_function`;
const CATVTON_RUN_URL = `${CATVTON_SPACE_URL}/run/submit_function`;
const CATVTON_REQUEST_TIMEOUT_MS = 180_000;
const CATVTON_SETTINGS = {
  clothType: 'upper',
  showType: 'result only',
  numInferenceSteps: 50,
  guidanceScale: 2.5,
  seed: 42,
} as const;

type RouteError = {
  error: {
    code: string;
    message: string;
  };
};

type InlineImage = {
  mimeType: string;
  data: string;
};

type CatVTONFile = {
  path: string;
  meta: { _type: 'gradio.FileData' };
  orig_name: string;
};

type CatVTONQueueConfig = {
  enable_queue?: unknown;
  dependencies?: Array<{
    api_name?: unknown;
    queue?: unknown;
  }>;
};

class ProviderError extends Error {
  constructor(
    readonly status: 401 | 429 | 500 | 502 | 504,
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

function errorResponse(status: number, code: string, message: string) {
  return Response.json(
    {
      error: { code, message },
    } satisfies RouteError,
    { status }
  );
}

function isValidMode(mode: unknown): mode is WardrobeMode {
  return mode === 'preset' || mode === 'custom';
}

function catVTONHeaders(headers: Record<string, string> = {}) {
  return {
    ...headers,
    ...(process.env.HF_TOKEN ? { Authorization: `Bearer ${process.env.HF_TOKEN}` } : {}),
  };
}

function parseDataUrl(dataUrl: string): InlineImage {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);

  if (!match) {
    throw new Error('Expected a valid base64 data URL.');
  }

  const [, mimeType, data] = match;
  return { mimeType, data };
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  return bytesToBase64(new Uint8Array(buffer));
}

function providerErrorForStatus(status: number, operation: string): ProviderError {
  if (status === 401 || status === 403) {
    return new ProviderError(401, 'provider_authentication_failed', `CatVTON authentication failed during ${operation}.`);
  }

  if (status === 429) {
    return new ProviderError(429, 'provider_rate_limited', `CatVTON rate limited ${operation}.`);
  }

  if (status === 504) {
    return new ProviderError(504, 'provider_timeout', `CatVTON timed out during ${operation}.`);
  }

  if (status === 502 || status === 503) {
    return new ProviderError(502, 'provider_unavailable', `CatVTON is unavailable during ${operation}.`);
  }

  return new ProviderError(500, 'provider_failure', `CatVTON failed during ${operation} (status ${status}).`);
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  operation: string,
  timeoutMs = CATVTON_REQUEST_TIMEOUT_MS
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });

    if (!response.ok) {
      throw providerErrorForStatus(response.status, operation);
    }

    return response;
  } catch (error) {
    if (error instanceof ProviderError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ProviderError(504, 'provider_timeout', `CatVTON timed out during ${operation}.`);
    }

    throw new ProviderError(502, 'provider_unavailable', `CatVTON is unavailable during ${operation}.`);
  } finally {
    clearTimeout(timeout);
  }
}

async function urlToInlineImage(url: string): Promise<InlineImage> {
  const response = await fetchWithTimeout(url, {}, 'image download');
  const blob = await response.blob();

  return {
    mimeType: blob.type || 'image/png',
    data: arrayBufferToBase64(await blob.arrayBuffer()),
  };
}

async function resolveReferenceImage(
  body: WardrobeGenerateRequest
): Promise<InlineImage> {
  if (body.mode === 'preset') {
    if (!body.presetId) {
      throw new Error('presetId is required in preset mode.');
    }

    const preset = getWardrobePreset(body.presetId);

    if (!preset) {
      throw new Error('Preset not found.');
    }

    return urlToInlineImage(preset.referenceUri);
  }

  if (body.referenceImageDataUrl) {
    return parseDataUrl(body.referenceImageDataUrl);
  }

  if (body.referenceImageUrl) {
    return urlToInlineImage(body.referenceImageUrl);
  }

  throw new Error('A reference clothing image is required in custom mode.');
}

async function resolveTargetImage(body: WardrobeGenerateRequest): Promise<InlineImage> {
  if (body.targetImageDataUrl) {
    return parseDataUrl(body.targetImageDataUrl);
  }

  if (body.targetImageUrl) {
    return urlToInlineImage(body.targetImageUrl);
  }

  throw new Error('A target user image is required.');
}

function base64ToBytes(data: string) {
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function uploadImage(image: InlineImage, fileName: string): Promise<CatVTONFile> {
  const formData = new FormData();
  formData.append(
    'files',
    new Blob([base64ToBytes(image.data)], { type: image.mimeType }),
    fileName
  );

  const response = await fetchWithTimeout(
    CATVTON_UPLOAD_URL,
    {
      method: 'POST',
      headers: catVTONHeaders(),
      body: formData,
    },
    'image upload'
  );
  const uploadedPaths = (await response.json()) as unknown;

  if (!Array.isArray(uploadedPaths) || typeof uploadedPaths[0] !== 'string') {
    throw new ProviderError(500, 'provider_failure', 'CatVTON did not return an uploaded image path.');
  }

  return {
    path: uploadedPaths[0],
    meta: { _type: 'gradio.FileData' },
    orig_name: fileName,
  };
}

function readImageDimensions(image: InlineImage) {
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

function crc32(bytes: Uint8Array) {
  let value = 0xffffffff;

  for (const byte of bytes) {
    value ^= byte;

    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
  }

  return (value ^ 0xffffffff) >>> 0;
}

function adler32(bytes: Uint8Array) {
  let a = 1;
  let b = 0;

  for (const byte of bytes) {
    a = (a + byte) % 65521;
    b = (b + a) % 65521;
  }

  return ((b << 16) | a) >>> 0;
}

function deflateUncompressed(bytes: Uint8Array) {
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

function createPngChunk(type: string, data: Uint8Array) {
  const typeBytes = new TextEncoder().encode(type);
  const chunk = new Uint8Array(12 + data.length);
  const view = new DataView(chunk.buffer);

  view.setUint32(0, data.length);
  chunk.set(typeBytes, 4);
  chunk.set(data, 8);
  view.setUint32(8 + data.length, crc32(chunk.subarray(4, 8 + data.length)));

  return chunk;
}

function createTransparentMask({ width, height }: { width: number; height: number }): InlineImage {
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

function createPersonImageInput(personImage: CatVTONFile, maskImage: CatVTONFile) {
  return {
    background: personImage,
    layers: [maskImage],
    composite: null,
  };
}

function createGenerationInputs(personImage: CatVTONFile, clothImage: CatVTONFile, maskImage: CatVTONFile) {
  return [
    createPersonImageInput(personImage, maskImage),
    clothImage,
    CATVTON_SETTINGS.clothType,
    CATVTON_SETTINGS.numInferenceSteps,
    CATVTON_SETTINGS.guidanceScale,
    CATVTON_SETTINGS.seed,
    CATVTON_SETTINGS.showType,
  ];
}

async function catVTONUsesQueue() {
  const response = await fetchWithTimeout(CATVTON_CONFIG_URL, {}, 'queue configuration');
  const config = (await response.json()) as CatVTONQueueConfig;
  const submitFunction = config.dependencies?.find(
    (dependency) => dependency.api_name === 'submit_function'
  );

  return config.enable_queue === true && submitFunction?.queue === true;
}

async function submitQueuedGeneration(inputs: unknown[]) {
  const response = await fetchWithTimeout(
    CATVTON_QUEUE_URL,
    {
      method: 'POST',
      headers: catVTONHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ data: inputs }),
    },
    'queue submission'
  );
  const result = (await response.json()) as { event_id?: unknown };

  if (typeof result.event_id !== 'string') {
    throw new ProviderError(500, 'provider_failure', 'CatVTON did not return a queue event ID.');
  }

  return result.event_id;
}

function parseSseResult(stream: string) {
  for (const record of stream.split(/\r?\n\r?\n/)) {
    const event = record.match(/^event:\s*(.+)$/m)?.[1];
    const data = record
      .split(/\r?\n/)
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trimStart())
      .join('\n');

    if (!data) {
      continue;
    }

    if (event === 'error') {
      throw new ProviderError(500, 'provider_failure', `CatVTON queue failed: ${data}`);
    }

    if (event === 'complete') {
      try {
        return JSON.parse(data) as unknown;
      } catch {
        throw new ProviderError(500, 'provider_failure', 'CatVTON returned an invalid queue result.');
      }
    }
  }

  throw new ProviderError(500, 'provider_failure', 'CatVTON queue ended without a result.');
}

async function pollQueuedGeneration(eventId: string) {
  const response = await fetchWithTimeout(
    `${CATVTON_QUEUE_URL}/${encodeURIComponent(eventId)}`,
    { headers: catVTONHeaders({ Accept: 'text/event-stream' }) },
    'queue polling'
  );

  return parseSseResult(await response.text());
}

function getGeneratedImageUrl(result: unknown) {
  const output = Array.isArray(result) ? result[0] : result;
  const url = typeof output === 'object' && output !== null ? (output as { url?: unknown }).url : undefined;

  if (typeof url !== 'string') {
    throw new ProviderError(500, 'provider_failure', 'CatVTON did not return a generated image URL.');
  }

  return url;
}

async function downloadGeneratedImage(url: string): Promise<InlineImage> {
  return url.startsWith('data:') ? parseDataUrl(url) : urlToInlineImage(url);
}

async function generateTryOn(referenceImage: InlineImage, targetImage: InlineImage) {
  const transparentMask = createTransparentMask(readImageDimensions(targetImage));
  const [personImage, clothImage, maskImage] = await Promise.all([
    uploadImage(targetImage, 'person-image.png'),
    uploadImage(referenceImage, 'clothing-reference.png'),
    uploadImage(transparentMask, 'transparent-mask.png'),
  ]);
  const inputs = createGenerationInputs(personImage, clothImage, maskImage);
  const result = (await catVTONUsesQueue())
    ? await pollQueuedGeneration(await submitQueuedGeneration(inputs))
    : await runSynchronousGeneration(inputs);

  return downloadGeneratedImage(getGeneratedImageUrl(result));
}

async function runSynchronousGeneration(inputs: unknown[]) {
  const [personImage, clothImage, clothType, numInferenceSteps, guidanceScale, seed, showType] = inputs;
  const response = await fetchWithTimeout(
    CATVTON_RUN_URL,
    {
      method: 'POST',
      headers: catVTONHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        person_image: personImage,
        cloth_image: clothImage,
        cloth_type: clothType,
        num_inference_steps: numInferenceSteps,
        guidance_scale: guidanceScale,
        seed,
        show_type: showType,
      }),
    },
    'generation'
  );
  const result = (await response.json()) as { output?: unknown };

  return result.output;
}

export async function POST(request: Request) {
  let body: WardrobeGenerateRequest;

  try {
    body = (await request.json()) as WardrobeGenerateRequest;
  } catch {
    return errorResponse(400, 'invalid_json', 'Request body must be valid JSON.');
  }

  if (!isValidMode(body.mode)) {
    return errorResponse(400, 'invalid_mode', 'mode must be either "preset" or "custom".');
  }

  try {
    const [referenceImage, targetImage] = await Promise.all([
      resolveReferenceImage(body),
      resolveTargetImage(body),
    ]);
    const generated = await generateTryOn(referenceImage, targetImage);

    return Response.json({
      imageDataUrl: `data:${generated.mimeType};base64,${generated.data}`,
      mimeType: generated.mimeType,
      mode: body.mode,
      presetId: body.presetId,
    } satisfies WardrobeGenerateResponse);
  } catch (error) {
    if (error instanceof ProviderError) {
      return errorResponse(error.status, error.code, error.message);
    }

    const message = error instanceof Error ? error.message : 'Invalid wardrobe request.';
    return errorResponse(400, 'invalid_input', message);
  }
}
