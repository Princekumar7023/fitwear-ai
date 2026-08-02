import { InlineImage } from '../types/wardrobe.js';

export interface IVirtualTryOnProvider {
  /**
   * Generates a virtual try-on image given a reference clothing image and a target user image.
   * @param referenceImage Clothing reference image object
   * @param targetImage Target person image object
   * @returns InlineImage containing generated base64 image and mimeType
   */
  generateTryOn(
    referenceImage: InlineImage,
    targetImage: InlineImage
  ): Promise<InlineImage>;
}
