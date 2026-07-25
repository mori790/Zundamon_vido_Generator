# Code Generation Summary

## Generated Application Files

- `package.json`
- `tsconfig.json`
- `remotion.config.ts`
- `.gitignore`
- `src/Root.tsx`
- `src/types/video.ts`
- `src/core/config.ts`
- `src/core/errors.ts`
- `src/core/logger.ts`
- `src/core/path-resolver.ts`
- `src/core/script-loader.ts`
- `src/core/asset-checker.ts`
- `src/core/voicevox-client.ts`
- `src/core/manifest-store.ts`
- `src/core/audio-analyzer.ts`
- `src/core/voice-generator.ts`
- `src/core/timeline-generator.ts`
- `src/core/timeline-store.ts`
- `src/core/render-data-builder.ts`
- `src/core/render-service.ts`
- `src/utils/frame.ts`
- `src/utils/file.ts`
- `src/utils/text.ts`
- `src/schemas/video-script.ts`
- `src/compositions/ZundamonVideo.tsx`
- `src/components/Scene.tsx`
- `src/components/Character.tsx`
- `src/components/Subtitle.tsx`
- `src/components/Visual.tsx`
- `src/components/TitleScene.tsx`
- `src/components/EndingScene.tsx`
- `scripts/validate-script.ts`
- `scripts/generate-voices.ts`
- `scripts/generate-timeline.ts`
- `scripts/generate-video.ts`
- `scripts/preview.ts`

## Generated Test Files

- `tests/frame.test.ts`
- `tests/subtitle.test.ts`
- `tests/video-script.test.ts`
- `tests/timeline.test.ts`
- `tests/cache.test.ts`
- `tests/assets.test.ts`
- `tests/character.test.ts`
- `tests/voicevox.integration.test.ts`

## Generated Sample Files and Assets

- `input/sample-video.json`
- `input/samples/sample-video.json`
- `public/backgrounds/default.svg`
- `public/visuals/sample-video/pod-recovery.svg`
- `public/characters/zundamon/*.svg`

## Story Coverage

- US-001 through US-015 are implemented in the MVP code path.

## Notes

- Dependencies must be installed with `npm install` before running TypeScript, tests, or Remotion.
- Live VOICEVOX integration tests fail when VOICEVOX Engine is not running.
- Render verification is optional and exposed through `npm run test:render`.

