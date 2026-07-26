export type RenderOutputStatus = {
  videoId: string;
  outputPath: string;
  exists: boolean;
  nonZero: boolean;
};

export type RenderOutputApi = {
  status(videoId: string): Promise<RenderOutputStatus>;
  confirmOverwrite(videoId: string): Promise<boolean>;
  reveal(videoId: string): Promise<boolean>;
};
