import { IVirtualTryOnProvider } from './ai-provider.interface.js';
import { InlineImage } from '../types/wardrobe.js';
import { env } from '../config/env.js';
import {
  base64ToBytes,
  createTransparentMask,
  readImageDimensions,
  parseDataUrl,
  validateImageBeforeUpload,
  arrayBufferToBase64,
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

export class CatVTONProviderService implements IVirtualTryOnProvider {
  private catVTONHeaders(headers: Record<string, string> = {}): Record<string, string> {
    return {
      ...headers,
      ...(env.HF_TOKEN ? { Authorization: `Bearer ${env.HF_TOKEN}` } : {}),
    };
  }

  private providerErrorForStatus(status: number, operation: string): ProviderError {
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

  private async fetchWithTimeoutAndRetry(
    url: string,
    init: RequestInit,
    operation: string,
    timeoutMs = env.CATVTON_TIMEOUT_MS,
    maxRetries = env.HF_MAX_RETRIES
  ): Promise<Response> {
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < maxRetries) {
      attempt += 1;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, { ...init, signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) {
          const err = this.providerErrorForStatus(response.status, operation);
          if ((response.status === 502 || response.status === 503 || response.status === 429) && attempt < maxRetries) {
            const backoffMs = Math.pow(2, attempt) * 1000;
            await new Promise((res) => setTimeout(res, backoffMs));
            continue;
          }
          throw err;
        }

        return response;
      } catch (error) {
        clearTimeout(timeout);
        lastError = error instanceof Error ? error : new Error(String(error));

        if (error instanceof ProviderError) {
          if ((error.status === 502 || error.status === 503 || error.status === 429) && attempt < maxRetries) {
            const backoffMs = Math.pow(2, attempt) * 1000;
            await new Promise((res) => setTimeout(res, backoffMs));
            continue;
          }
          throw error;
        }

        if (error instanceof DOMException && error.name === 'AbortError') {
          if (attempt < maxRetries) {
            continue;
          }
          throw new ProviderError(504, 'provider_timeout', `CatVTON timed out during ${operation}.`);
        }

        if (attempt < maxRetries) {
          const backoffMs = Math.pow(2, attempt) * 1000;
          await new Promise((res) => setTimeout(res, backoffMs));
          continue;
        }
      }
    }

    throw lastError || new ProviderError(502, 'provider_unavailable', `CatVTON is unavailable during ${operation}.`);
  }

  public async urlToInlineImage(url: string): Promise<InlineImage> {
    const response = await this.fetchWithTimeoutAndRetry(url, {}, 'image download');
    const blob = await response.blob();
    return {
      mimeType: blob.type || 'image/png',
      data: arrayBufferToBase64(await blob.arrayBuffer()),
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

  private async catVTONUsesQueue(): Promise<boolean> {
    const response = await this.fetchWithTimeoutAndRetry(CATVTON_CONFIG_URL, {}, 'queue configuration');
    const config = (await response.json()) as CatVTONQueueConfig;
    const submitFunction = config.dependencies?.find(
      (dependency) => dependency.api_name === 'submit_function'
    );

    return config.enable_queue === true && submitFunction?.queue === true;
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
    const result = (await response.json()) as { event_id?: unknown };

    if (typeof result.event_id !== 'string') {
      throw new ProviderError(500, 'provider_failure', 'CatVTON did not return a queue event ID.');
    }

    return result.event_id;
  }

  private parseSseResult(stream: string): unknown {
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

  private async pollQueuedGeneration(eventId: string): Promise<unknown> {
    const response = await this.fetchWithTimeoutAndRetry(
      `${CATVTON_QUEUE_URL}/${encodeURIComponent(eventId)}`,
      { headers: this.catVTONHeaders({ Accept: 'text/event-stream' }) },
      'queue polling'
    );

    return this.parseSseResult(await response.text());
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
    const result = (await response.json()) as { output?: unknown };
    return result.output;
  }

  private getGeneratedImageUrl(result: unknown): string {
    const output = Array.isArray(result) ? result[0] : result;
    const url = typeof output === 'object' && output !== null ? (output as { url?: unknown }).url : undefined;

    if (typeof url !== 'string') {
      throw new ProviderError(500, 'provider_failure', 'CatVTON did not return a generated image URL.');
    }

    return url;
  }

  private async downloadGeneratedImage(url: string): Promise<InlineImage> {
    return url.startsWith('data:') ? parseDataUrl(url) : this.urlToInlineImage(url);
  }

  public async generateTryOn(referenceImage: InlineImage, targetImage: InlineImage): Promise<InlineImage> {
    const transparentMask = createTransparentMask(readImageDimensions(targetImage));
    const [personImage, clothImage, maskImage] = await Promise.all([
      this.uploadImage(targetImage, 'person-image.png'),
      this.uploadImage(referenceImage, 'clothing-reference.png'),
      this.uploadImage(transparentMask, 'transparent-mask.png'),
    ]);

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

    const result = (await this.catVTONUsesQueue())
      ? await this.pollQueuedGeneration(await this.submitQueuedGeneration(inputs))
      : await this.runSynchronousGeneration(inputs);

    return this.downloadGeneratedImage(this.getGeneratedImageUrl(result));
  }
}
