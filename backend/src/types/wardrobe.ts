export type WardrobeMode = 'preset' | 'custom';

export type WardrobeGenerateRequest = {
  mode: WardrobeMode;
  presetId?: string;
  referenceImageDataUrl?: string;
  referenceImageUrl?: string;
  targetImageDataUrl?: string;
  targetImageUrl?: string;
};

export type WardrobeGenerateResponse = {
  imageDataUrl: string;
  mimeType: string;
  mode: WardrobeMode;
  presetId?: string;
};

export type RouteError = {
  error: {
    code: string;
    message: string;
  };
};

export type InlineImage = {
  mimeType: string;
  data: string;
};
