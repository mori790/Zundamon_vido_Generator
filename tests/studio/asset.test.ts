import path from 'node:path';
import os from 'node:os';
import * as fs from 'node:fs/promises';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {
  buildPublicVisualPath,
  checkSceneAssets,
  collectAssetReferences,
  isAllowedImageFileName,
  isAssetReferenced,
  MAX_IMAGE_BYTES,
} from '../../src/studio/shared/asset';
import {
  createRendererAssetFileAccess,
  resolvePublicAssetPath,
  resolveVisualDestination,
} from '../../src/studio/renderer/asset-file-access';
import type {VideoScript} from '../../src/types/video';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  vi.restoreAllMocks();
  delete globalThis.localFileApi;
  await Promise.all(temporaryDirectories.splice(0).map((directory) => fs.rm(directory, {recursive: true})));
});

function createScript(image = '/visuals/sample-video/demo.png'): VideoScript {
  return {
    id: 'sample-video',
    title: 'Sample',
    speaker: {
      engine: 'voicevox',
      speakerId: 3,
      speedScale: 1,
      pitchScale: 0,
      intonationScale: 1,
      volumeScale: 1,
    },
    video: {width: 1920, height: 1080, fps: 30, bgmVolume: 0.1},
    subtitle: {
      enabled: true,
      maxCharactersPerLine: 24,
      maxLines: 2,
      fontSize: 56,
      bottom: 50,
      highlightKeywords: [],
    },
    scenes: [
      {
        id: 'scene-001',
        type: 'explanation',
        text: 'Asset',
        emotion: 'normal',
        visual: {type: 'image', src: image, position: 'center', fit: 'contain'},
        durationBeforeSpeech: 0.2,
        durationAfterSpeech: 0.3,
        characterVisible: true,
      },
    ],
  };
}

describe('asset rules', () => {
  it('accepts only path-free PNG and JPEG names', () => {
    expect(isAllowedImageFileName('demo.png')).toBe(true);
    expect(isAllowedImageFileName('demo.JPG')).toBe(true);
    expect(isAllowedImageFileName('../demo.png')).toBe(false);
    expect(isAllowedImageFileName('demo.webp')).toBe(false);
    expect(buildPublicVisualPath('sample-video', 'demo.jpeg')).toBe('/visuals/sample-video/demo.jpeg');
    expect(MAX_IMAGE_BYTES).toBe(20 * 1024 * 1024);
  });

  it('collects references and detects whether an asset remains in use', () => {
    const script = createScript();
    expect(collectAssetReferences(script)).toContainEqual({
      publicPath: '/visuals/sample-video/demo.png',
      sceneId: 'scene-001',
    });
    expect(isAssetReferenced(script, '/visuals/sample-video/demo.png')).toBe(true);
    expect(isAssetReferenced(script, '/visuals/sample-video/unused.png')).toBe(false);
  });

  it('returns independent missing results for all scene images', async () => {
    const script = createScript();
    const result = await checkSceneAssets(script, async () => false, 7);
    expect(result).toEqual({
      generation: 7,
      statuses: [
        {
          publicPath: '/visuals/sample-video/demo.png',
          sceneId: 'scene-001',
          status: 'missing',
        },
      ],
    });
  });
});

describe('renderer asset file access', () => {
  it('copies, detects collision, overwrites, checks existence, and trashes', async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'u5-asset-'));
    temporaryDirectories.push(workspaceRoot);
    const sourcePath = path.join(workspaceRoot, 'source.png');
    await fs.writeFile(sourcePath, 'first');
    const trashItem = vi.fn().mockResolvedValue(undefined);
    const copy = vi.fn()
      .mockResolvedValueOnce({status: 'copied', publicPath: '/visuals/sample-video/source.png'})
      .mockResolvedValueOnce({status: 'replacement-required', publicPath: '/visuals/sample-video/source.png'})
      .mockResolvedValueOnce({status: 'copied', publicPath: '/visuals/sample-video/source.png'});
    globalThis.localFileApi = {
      workspace: {} as never,
      chat: {} as never,
      asset: {
        select: vi.fn(),
        copy,
        exists: vi.fn().mockResolvedValue(true),
        trash: trashItem,
      },
    };
    const file = new File(['first'], 'source.png', {type: 'image/png'});
    const access = createRendererAssetFileAccess({
      decodeImage: vi.fn().mockResolvedValue(undefined),
      trashItem,
      workspaceRoot,
    });
    const selected = {file, fileName: file.name, sourcePath};

    expect(await access.copyImage('sample-video', selected)).toEqual({
      status: 'copied',
      publicPath: '/visuals/sample-video/source.png',
    });
    expect(await access.copyImage('sample-video', selected)).toEqual({
      status: 'replacement-required',
      publicPath: '/visuals/sample-video/source.png',
    });
    expect(await access.copyImage('sample-video', selected, true)).toEqual({
      status: 'copied',
      publicPath: '/visuals/sample-video/source.png',
    });
    expect(await access.exists('/visuals/sample-video/source.png')).toBe(true);
    await access.trash('/visuals/sample-video/source.png');
    expect(trashItem).toHaveBeenCalledWith('/visuals/sample-video/source.png');
  });

  it('rejects oversized images before decode and blocks paths outside public', async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'u5-limit-'));
    temporaryDirectories.push(workspaceRoot);
    const sourcePath = path.join(workspaceRoot, 'large.png');
    await fs.writeFile(sourcePath, '');
    await fs.truncate(sourcePath, MAX_IMAGE_BYTES + 1);
    globalThis.localFileApi = {
      workspace: {} as never,
      chat: {} as never,
      asset: {select: vi.fn(), copy: vi.fn(), exists: vi.fn(), trash: vi.fn()},
    };
    const decodeImage = vi.fn();
    const file = new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], 'large.png', {type: 'image/png'});
    const access = createRendererAssetFileAccess({decodeImage, workspaceRoot});

    expect(await access.copyImage('sample-video', {file, fileName: file.name, sourcePath}))
      .toEqual({status: 'failed', message: '画像は20 MB以下にしてください。'});
    expect(decodeImage).not.toHaveBeenCalled();
    expect(() => resolvePublicAssetPath(workspaceRoot, '/../outside.png', path)).toThrow();
  });

  it('resolves destinations beneath the video visual directory', () => {
    expect(resolveVisualDestination('/workspace', 'sample-video', 'demo.png', path)).toEqual({
      destinationPath: path.resolve('/workspace/public/visuals/sample-video/demo.png'),
      publicPath: '/visuals/sample-video/demo.png',
    });
  });
});
