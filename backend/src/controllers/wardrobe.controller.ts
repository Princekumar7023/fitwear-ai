import { Request, Response, NextFunction } from 'express';
import { WardrobeGenerateRequest, WardrobeGenerateResponse, InlineImage, WardrobeMode } from '../types/wardrobe.js';
import { getWardrobePreset } from '../data/wardrobe-presets.js';
import { parseDataUrl } from '../utils/image.utils.js';
import { IVirtualTryOnProvider } from '../services/ai-provider.interface.js';
import { CatVTONProviderService } from '../services/catvton-provider.service.js';

const catVTONService = new CatVTONProviderService();

// Easily inject or swap alternative AI provider service if desired in future
let aiProvider: IVirtualTryOnProvider = catVTONService;

export function setAiProvider(provider: IVirtualTryOnProvider) {
  aiProvider = provider;
}

function isValidMode(mode: unknown): mode is WardrobeMode {
  return mode === 'preset' || mode === 'custom';
}

async function resolveReferenceImage(body: WardrobeGenerateRequest): Promise<InlineImage> {
  if (body.mode === 'preset') {
    if (!body.presetId) {
      throw new Error('presetId is required in preset mode.');
    }

    const preset = getWardrobePreset(body.presetId);
    if (!preset) {
      throw new Error('Preset not found.');
    }

    return catVTONService.urlToInlineImage(preset.referenceUri);
  }

  if (body.referenceImageDataUrl) {
    return parseDataUrl(body.referenceImageDataUrl);
  }

  if (body.referenceImageUrl) {
    return catVTONService.urlToInlineImage(body.referenceImageUrl);
  }

  throw new Error('A reference clothing image is required in custom mode.');
}

async function resolveTargetImage(body: WardrobeGenerateRequest): Promise<InlineImage> {
  if (body.targetImageDataUrl) {
    return parseDataUrl(body.targetImageDataUrl);
  }

  if (body.targetImageUrl) {
    return catVTONService.urlToInlineImage(body.targetImageUrl);
  }

  throw new Error('A target user image is required.');
}

export async function handleWardrobeGenerate(
  req: Request<{}, {}, WardrobeGenerateRequest>,
  res: Response<WardrobeGenerateResponse | { error: { code: string; message: string } }>,
  next: NextFunction
): Promise<void> {
  try {
    const body = req.body;

    if (!body || typeof body !== 'object') {
      res.status(400).json({ error: { code: 'invalid_json', message: 'Request body must be valid JSON.' } });
      return;
    }

    if (!isValidMode(body.mode)) {
      res.status(400).json({ error: { code: 'invalid_mode', message: 'mode must be either "preset" or "custom".' } });
      return;
    }

    const [referenceImage, targetImage] = await Promise.all([
      resolveReferenceImage(body),
      resolveTargetImage(body),
    ]);

    const generated = await aiProvider.generateTryOn(referenceImage, targetImage);

    res.status(200).json({
      imageDataUrl: `data:${generated.mimeType};base64,${generated.data}`,
      mimeType: generated.mimeType,
      mode: body.mode,
      presetId: body.presetId,
    });
  } catch (error) {
    next(error);
  }
}
