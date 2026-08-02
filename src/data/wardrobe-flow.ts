import type { WardrobeMode } from '@/types/wardrobe';

export type WardrobeFlowInput = {
  mode: WardrobeMode;
  presetId: string;
  targetImageDataUrl: string;
  referenceImageDataUrl?: string;
};

const pendingFlows = new Map<string, WardrobeFlowInput>();

export function createWardrobeFlow(input: WardrobeFlowInput) {
  const flowId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  pendingFlows.set(flowId, input);
  return flowId;
}

export function getWardrobeFlow(flowId: string) {
  return pendingFlows.get(flowId);
}

export function removeWardrobeFlow(flowId: string) {
  pendingFlows.delete(flowId);
}
