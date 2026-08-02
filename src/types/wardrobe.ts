export type WardrobeMode = "preset" | "custom";

export type PickedImage = {
  uri: string;
  base64: string;
  mimeType: string;
  width: number;
  height: number;
  fileName?: string | null;
};

export type WardrobePreset = {
  id: string;
  name: string;
  styleLabel: string;
  description: string;
  previewUri: string;
  referenceUri: string;
  promptFragment: string;
  tint: string;
};

export type TryOnResult = {
  imageUri: string;
  presetId: string;
  createdAt: string;
};

export type CustomOutfit = {
  referenceImage?: PickedImage;
};

export type WardrobeState = {
  mode: WardrobeMode;
  selectedPreset?: WardrobePreset;
  selectedImage?: PickedImage;
  customOutfit?: CustomOutfit;
};

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
