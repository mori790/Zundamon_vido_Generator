import {z} from 'zod';
import {env} from '../core/config';

const emotionSchema = z.enum(['normal', 'happy', 'surprised', 'troubled']);

const imageVisualSchema = z.object({
  type: z.literal('image'),
  src: z.string().min(1),
  position: z.enum(['left', 'center', 'right']).default('center'),
  fit: z.enum(['contain', 'cover']).default('contain'),
});

const codeVisualSchema = z.object({
  type: z.literal('code'),
  language: z.string().optional(),
  code: z.string(),
  fileName: z.string().optional(),
});

const textVisualSchema = z.object({
  type: z.literal('text'),
  heading: z.string().optional(),
  body: z.string(),
});

const noneVisualSchema = z.object({
  type: z.literal('none'),
});

export const visualSchema = z.discriminatedUnion('type', [
  imageVisualSchema,
  codeVisualSchema,
  textVisualSchema,
  noneVisualSchema,
]);

export const videoScriptSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional(),
    speaker: z.object({
      engine: z.literal('voicevox').default('voicevox'),
      speakerId: z.number().default(env.defaultSpeakerId),
      speedScale: z.number().default(1),
      pitchScale: z.number().default(0),
      intonationScale: z.number().default(1),
      volumeScale: z.number().default(1),
    }),
    video: z.object({
      width: z.number().positive().default(env.defaultWidth),
      height: z.number().positive().default(env.defaultHeight),
      fps: z.number().positive().default(env.defaultFps),
      background: z.string().optional(),
      bgm: z.string().optional(),
      bgmVolume: z.number().min(0).max(1).default(0.1),
    }),
    subtitle: z.object({
      enabled: z.boolean().default(true),
      maxCharactersPerLine: z.number().positive().default(24),
      maxLines: z.number().positive().default(2),
      fontSize: z.number().positive().default(56),
      bottom: z.number().nonnegative().default(50),
      highlightKeywords: z.array(z.string()).default([]),
    }),
    scenes: z
      .array(
        z.object({
          id: z.string().min(1),
          type: z.enum(['title', 'explanation', 'code', 'summary', 'ending']),
          text: z.string().min(1),
          emotion: emotionSchema.default('normal'),
          visual: visualSchema.optional(),
          durationBeforeSpeech: z.number().nonnegative().default(0.2),
          durationAfterSpeech: z.number().nonnegative().default(0.3),
          characterVisible: z.boolean().default(true),
        }),
      )
      .min(1),
  })
  .superRefine((script, ctx) => {
    const ids = new Set<string>();
    for (const scene of script.scenes) {
      if (ids.has(scene.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['scenes'],
          message: `シーンIDが重複しています: ${scene.id}`,
        });
      }
      ids.add(scene.id);
    }
  });

export type VideoScriptInput = z.input<typeof videoScriptSchema>;
