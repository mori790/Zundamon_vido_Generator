import type {AssetCopyResult} from './asset';

export type LocalAssetSelection = {token: string; fileName: string; bytes: Uint8Array};

export type LocalFileApi = {
  workspace: {
    listInput(): Promise<Array<{name: string; kind: 'file' | 'directory'; mtime?: string}>>;
    readScript(fileName: string): Promise<string | null>;
    writeScript(fileName: string, data: string): Promise<void>;
  };
  chat: {
    read(videoId: string): Promise<string | null>;
    write(videoId: string, data: string): Promise<void>;
  };
  asset: {
    select(): Promise<LocalAssetSelection | null>;
    copy(videoId: string, token: string, overwrite: boolean): Promise<AssetCopyResult>;
    exists(publicPath: string): Promise<boolean>;
    trash(publicPath: string): Promise<void>;
  };
  draft: {
    read(videoId: string): Promise<string | null>;
    write(videoId: string, data: string): Promise<void>;
  };
};

export type TextInputFileApi = {
  openFileDialog(): Promise<{filePath: string; fileName: string} | null>;
  readTextFile(filePath: string): Promise<{content: string; byteSize: number}>;
};
