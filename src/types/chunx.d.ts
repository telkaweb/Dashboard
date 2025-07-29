declare module 'chunx' {
  export default class Chunx {
    constructor(options: {
      file: File;
      url: string;
      method: string;
      chunkSize: number;
      headers?: Record<string, string>;
      onProgress: (progress: number) => void;
      onSuccess: (response: any) => void;
      onError: (error: any) => void;
      onChunk: (chunkNumber: number, chunkSize: number, totalChunks: number) => void;
    });

    upload(): void; // Ensure this method exists
    pause(): void;
    resume(): void;
    cancel(): void;
  }
}
