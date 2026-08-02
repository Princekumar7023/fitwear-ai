import { IVirtualTryOnProvider } from './ai-provider.interface.js';
import { InlineImage } from '../types/wardrobe.js';
import { env } from '../config/env.js';
import {
  createTransparentMask,
  readImageDimensions,
  parseDataUrl,
  validateImageBeforeUpload,
  logMemory,
} from '../utils/image.utils.js';

const CATVTON_SPACE_URL = 'https://zhengchong-catvton.hf.space';
const CATVTON_CONFIG_URL = `${CATVTON_SPACE_URL}/config`;
const CATVTON_UPLOAD_URL = `${CATVTON_SPACE_URL}/gradio_api/upload`;
const CATVTON_QUEUE_URL = `${CATVTON_SPACE_URL}/gradio_api/call/submit_function`;
const CATVTON_RUN_URL = `${CATVTON_SPACE_URL}/run/submit_function`;

const CATVTON_SETTINGS = {
  clothType: 'upper',
  showType: 'result only',
  numInferenceSteps: 50,
  guidanceScale: 2.5,
  seed: 42,
} as const;

export class ProviderError extends Error {
  constructor(
    readonly status: 401 | 429 | 500 | 502 | 503 | 504,
    readonly code: string,
    message: string
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}

type CatVTONFile = {
  path: string;
  url?: string;
  meta: { _type: 'gradio.FileData' };
  orig_name: string;
  mime_type?: string;
};

type CatVTONQueueConfig = {
  enable_queue?: unknown;
  dependencies?: Array<{
    api_name?: unknown;
    queue?: unknown;
  }>;
};

export type ProcessedHttpResponse = {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  text: string;
  json: <T>() => T;
};

export class CatVTONProviderService implements IVirtualTryOnProvider {
  private catVTONHeaders(headers: Record<string, string> = {}): Record<string, string> {
    return {
      ...headers,
      ...(env.HF_TOKEN ? { Authorization: `Bearer ${env.HF_TOKEN}` } : {}),
    };
  }

  private sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    const clean: Record<string, string> = {};
    for (const [k, v] of Object.entries(headers)) {
      clean[k] = k.toLowerCase() === 'authorization' ? 'Bearer ***' : v;
    }
    return clean;
  }

  private providerErrorForStatus(status: number, operation: string, bodyText: string): ProviderError {
    const snippet = bodyText.slice(0, 500);

    if (status === 401 || status === 403) {
      return new ProviderError(401, 'provider_authentication_failed', `CatVTON authentication failed (${operation}). Response: ${snippet}`);
    }

    if (status === 429) {
      return new ProviderError(429, 'provider_rate_limited', `CatVTON rate limited (${operation}). Response: ${snippet}`);
    }

    if (status === 504) {
      return new ProviderError(504, 'provider_timeout', `CatVTON timed out (${operation}). Response: ${snippet}`);
    }

    if (status === 502 || status === 503) {
      return new ProviderError(502, 'provider_unavailable', `CatVTON is unavailable (${operation}, status ${status}). Response: ${snippet}`);
    }

    return new ProviderError(500, 'provider_failure', `CatVTON failed (${operation}, status ${status}). Response: ${snippet}`);
  }

  private async fetchWithTimeoutAndRetry(
    url: string,
    init: RequestInit,
    operation: string,
    timeoutMs = env.CATVTON_TIMEOUT_MS,
    maxRetries = env.HF_MAX_RETRIES
  ): Promise<ProcessedHttpResponse> {
    let attempt = 0;
    let lastError: Error | null = null;

    const reqMethod = init.method || 'GET';
    const reqHeaders = this.sanitizeHeaders((init.headers as Record<string, string>) || {});
    console.log(`\n[http req] ${reqMethod} ${url}`);
    console.log(`[http req headers]`, JSON.stringify(reqHeaders));
    if (init.body && typeof init.body === 'string') {
      console.log(`[http req body]`, init.body.length > 1000 ? init.body.slice(0, 1000) + '... (truncated)' : init.body);
    } else if (init.body) {
      console.log(`[http req body] [FormData / binary payload]`);
    }

    while (attempt < maxRetries) {
      attempt += 1;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, { ...init, signal: controller.signal });
        clearTimeout(timeout);

        const resHeaders: Record<string, string> = {};
        response.headers.forEach((val, key) => {
          resHeaders[key] = val;
        });

        const bodyText = await response.text();

        console.log(`[http res] ${response.status} ${response.statusText} (${operation})`);
        console.log(`[http res headers]`, JSON.stringify(resHeaders));
        console.log(`[http res body]`, bodyText.length > 2000 ? bodyText.slice(0, 2000) + '... (truncated)' : bodyText);

        if (!response.ok) {
          const err = this.providerErrorForStatus(response.status, operation, bodyText);
          if ((response.status === 502 || response.status === 503 || response.status === 429) && attempt < maxRetries) {
            const backoffMs = Math.pow(2, attempt) * 1000;
            console.log(`[retry] attempt ${attempt}/${maxRetries} failed with status ${response.status}. Waiting ${backoffMs}ms...`);
            await new Promise((res) => setTimeout(res, backoffMs));
            continue;
          }
          throw err;
        }

        return {
          status: response.status,
          statusText: response.statusText,
          headers: resHeaders,
          text: bodyText,
          json: <T>() => JSON.parse(bodyText) as T,
        };
      } catch (error) {
        clearTimeout(timeout);
        lastError = error instanceof Error ? error : new Error(String(error));

        if (error instanceof ProviderError) {
          if ((error.status === 502 || error.status === 503 || error.status === 429) && attempt < maxRetries) {
            const backoffMs = Math.pow(2, attempt) * 1000;
            console.log(`[retry] attempt ${attempt}/${maxRetries} failed. Waiting ${backoffMs}ms...`);
            await new Promise((res) => setTimeout(res, backoffMs));
            continue;
          }
          throw error;
        }

        if (error instanceof DOMException && error.name === 'AbortError') {
          if (attempt < maxRetries) {
            console.log(`[retry] attempt ${attempt}/${maxRetries} timed out. Retrying...`);
            continue;
          }
          throw new ProviderError(504, 'provider_timeout', `CatVTON timed out during ${operation}.`);
        }

        if (attempt < maxRetries) {
          const backoffMs = Math.pow(2, attempt) * 1000;
          console.log(`[retry] attempt ${attempt}/${maxRetries} error: ${lastError.message}. Waiting ${backoffMs}ms...`);
          await new Promise((res) => setTimeout(res, backoffMs));
          continue;
        }
      }
    }

    throw lastError || new ProviderError(502, 'provider_unavailable', `CatVTON is unavailable during ${operation}.`);
  }

  public async urlToInlineImage(url: string): Promise<InlineImage> {
    const response = await this.fetchWithTimeoutAndRetry(url, {}, 'image download');
    // Re-fetch raw buffer from response text or direct buffer if needed
    const res = await fetch(url, { headers: this.catVTONHeaders() });
    const arrayBuffer = await res.arrayBuffer();
    const mimeType = res.headers.get('content-type')?.split(';')[0] || 'image/png';
    return {
      mimeType,
      data: Buffer.from(arrayBuffer).toString('base64'),
    };
  }

  private async uploadImage(image: InlineImage, fileName: string): Promise<CatVTONFile> {
    const validated = validateImageBeforeUpload(image);
    const formData = new FormData();
    formData.append(
      'files',
      new Blob([Buffer.from(validated.data, 'base64')], { type: validated.mimeType }),
      fileName
    );

    const response = await this.fetchWithTimeoutAndRetry(
      CATVTON_UPLOAD_URL,
      {
        method: 'POST',
        headers: this.catVTONHeaders(),
        body: formData,
      },
      'image upload'
    );

    let uploadedData: unknown;
    try {
      uploadedData = response.json();
    } catch {
      throw new ProviderError(500, 'provider_failure', `CatVTON upload response was not valid JSON: ${response.text}`);
    }

    if (!Array.isArray(uploadedData) || uploadedData.length === 0) {
      throw new ProviderError(500, 'provider_failure', `CatVTON upload returned non-array: ${response.text}`);
    }

    const firstItem = uploadedData[0];
    let filePath = '';
    let fileUrl: string | undefined;

    if (typeof firstItem === 'string') {
      filePath = firstItem;
      fileUrl = `${CATVTON_SPACE_URL}/gradio_api/file=${filePath}`;
    } else if (typeof firstItem === 'object' && firstItem !== null) {
      const itemObj = firstItem as Record<string, unknown>;
      filePath = typeof itemObj.path === 'string' ? itemObj.path : '';
      fileUrl = typeof itemObj.url === 'string' ? itemObj.url : undefined;
      if (!fileUrl && filePath) {
        fileUrl = `${CATVTON_SPACE_URL}/gradio_api/file=${filePath}`;
      }
    }

    if (!filePath) {
      throw new ProviderError(500, 'provider_failure', `CatVTON upload item missing path: ${response.text}`);
    }

    return {
      path: filePath,
      url: fileUrl,
      meta: { _type: 'gradio.FileData' },
      orig_name: fileName,
      mime_type: validated.mimeType,
    };
  }

  private async catVTONUsesQueue(): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeoutAndRetry(CATVTON_CONFIG_URL, {}, 'queue configuration');
      const config = response.json<CatVTONQueueConfig>();
      const submitFunction = config.dependencies?.find(
        (dependency) => dependency.api_name === 'submit_function'
      );

      const usesQueue = config.enable_queue === true && submitFunction?.queue === true;
      console.log(`[config check] enable_queue=${config.enable_queue}, submit_function queue=${submitFunction?.queue} => usesQueue=${usesQueue}`);
      return usesQueue;
    } catch (e) {
      console.log(`[config check fallback] could not fetch config, defaulting to queue=true`, e);
      return true;
    }
  }

  private async submitQueuedGeneration(inputs: unknown[]): Promise<string> {
    const response = await this.fetchWithTimeoutAndRetry(
      CATVTON_QUEUE_URL,
      {
        method: 'POST',
        headers: this.catVTONHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ data: inputs }),
      },
      'queue submission'
    );

    let result: { event_id?: unknown };
    try {
      result = response.json<{ event_id?: unknown }>();
    } catch {
      throw new ProviderError(500, 'provider_failure', `CatVTON queue submission response was not valid JSON: ${response.text}`);
    }

    if (typeof result.event_id !== 'string') {
      throw new ProviderError(500, 'provider_failure', `CatVTON did not return a queue event ID. Response: ${response.text}`);
    }

    console.log(`[queue submit] event_id=${result.event_id}`);
    return result.event_id;
  }

  private parseSseResult(stream: string): unknown {
    console.log(`[sse raw stream length=${stream.length}]\n--- BEGIN SSE STREAM ---\n${stream}\n--- END SSE STREAM ---`);

    let lastErrorDetails = '';

    for (const record of stream.split(/\r?\n\r?\n/)) {
      if (!record.trim()) continue;

      const eventMatch = record.match(/^event:\s*(.+)$/m);
      const event = eventMatch ? eventMatch[1].trim() : '';

      const dataLines = record
        .split(/\r?\n/)
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trimStart());
      
      const rawData = dataLines.join('\n');

      console.log(`[sse record] event="${event}" data="${rawData}"`);

      if (event === 'error') {
        // Extract meaningful error information instead of blindly printing "null"
        let parsedError: unknown = null;
        try {
          parsedError = JSON.parse(rawData);
        } catch {
          parsedError = rawData;
        }

        const errorStr = typeof parsedError === 'object' && parsedError !== null
          ? JSON.stringify(parsedError)
          : String(parsedError);

        lastErrorDetails = (errorStr && errorStr !== 'null') ? errorStr : record;
        console.error(`[sse error detected] event=${event}, parsedError=${errorStr}, record=\n${record}`);
      }

      if (event === 'complete') {
        try {
          return JSON.parse(rawData) as unknown;
        } catch (e) {
          console.error(`[sse complete parse error] data="${rawData}"`, e);
          throw new ProviderError(500, 'provider_failure', `CatVTON completed but returned invalid JSON: ${rawData}`);
        }
      }
    }

    if (lastErrorDetails) {
      throw new ProviderError(500, 'provider_failure', `CatVTON generation failed. Details: ${lastErrorDetails}`);
    }

    throw new ProviderError(500, 'provider_failure', `CatVTON queue completed without a valid result event. Stream preview: ${stream.slice(0, 500)}`);
  }

  private async pollQueuedGeneration(eventId: string): Promise<unknown> {
    const pollUrl = `${CATVTON_QUEUE_URL}/${encodeURIComponent(eventId)}`;
    console.log(`[queue poll] GET ${pollUrl}`);
    const response = await this.fetchWithTimeoutAndRetry(
      pollUrl,
      { headers: this.catVTONHeaders({ Accept: 'text/event-stream' }) },
      'queue polling'
    );

    return this.parseSseResult(response.text);
  }

  private async runSynchronousGeneration(inputs: unknown[]): Promise<unknown> {
    const [personImage, clothImage, clothType, numInferenceSteps, guidanceScale, seed, showType] = inputs;
    const response = await this.fetchWithTimeoutAndRetry(
      CATVTON_RUN_URL,
      {
        method: 'POST',
        headers: this.catVTONHeaders({ 'Content-Type': 'application/json' }),
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
    const result = response.json<{ output?: unknown }>();
    return result.output;
  }

  private getGeneratedImageUrl(result: unknown): string {
    console.log(`[result parsing] result object:`, JSON.stringify(result));
    const output = Array.isArray(result) ? result[0] : result;
    const url = typeof output === 'object' && output !== null ? (output as { url?: unknown }).url : undefined;

    if (typeof url !== 'string') {
      throw new ProviderError(500, 'provider_failure', `CatVTON did not return a generated image URL. Raw result: ${JSON.stringify(result)}`);
    }

    return url;
  }

  private async downloadGeneratedImage(url: string): Promise<InlineImage> {
    return url.startsWith('data:') ? parseDataUrl(url) : this.urlToInlineImage(url);
  }

  public async generateTryOn(referenceImage: InlineImage, targetImage: InlineImage): Promise<InlineImage> {
    logMemory('generateTryOn start');

    console.log('[step] reading image dimensions');
    const dims = readImageDimensions(targetImage);
    console.log(`[step] dimensions resolved: ${dims.width}×${dims.height}`);
    logMemory('after readImageDimensions');

    console.log('[step] creating transparent mask');
    const transparentMask = createTransparentMask(dims);
    logMemory('after createTransparentMask');

    console.log('[step] uploading person image');
    const personImage = await this.uploadImage(targetImage, 'person-image.png');
    console.log(`[uploaded personImage]:`, JSON.stringify(personImage));
    logMemory('after person upload');

    console.log('[step] uploading reference clothing image');
    const clothImage = await this.uploadImage(referenceImage, 'clothing-reference.png');
    console.log(`[uploaded clothImage]:`, JSON.stringify(clothImage));
    logMemory('after cloth upload');

    console.log('[step] uploading mask image');
    const maskImage = await this.uploadImage(transparentMask, 'transparent-mask.png');
    console.log(`[uploaded maskImage]:`, JSON.stringify(maskImage));
    logMemory('after mask upload');

    const inputs = [
      {
        background: personImage,
        layers: [maskImage],
        composite: null,
      },
      clothImage,
      CATVTON_SETTINGS.clothType,
      CATVTON_SETTINGS.numInferenceSteps,
      CATVTON_SETTINGS.guidanceScale,
      CATVTON_SETTINGS.seed,
      CATVTON_SETTINGS.showType,
    ];

    console.log('[step] submitting generation to CatVTON with inputs:', JSON.stringify(inputs));
    const usesQueue = await this.catVTONUsesQueue();
    const result = usesQueue
      ? await this.pollQueuedGeneration(await this.submitQueuedGeneration(inputs))
      : await this.runSynchronousGeneration(inputs);
    logMemory('after CatVTON generation');

    console.log('[step] downloading generated image');
    const generated = await this.downloadGeneratedImage(this.getGeneratedImageUrl(result));
    logMemory('generateTryOn end');

    return generated;
  }
}
