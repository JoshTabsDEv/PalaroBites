declare module "browser-image-compression" {
  export interface ImageCompressionOptions {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    useWebWorker?: boolean;
    initialQuality?: number;
  }

  export default function imageCompression(
    file: File,
    options?: ImageCompressionOptions
  ): Promise<File>;

  export function getDataUrlFromFile(file: File): Promise<string>;
}


