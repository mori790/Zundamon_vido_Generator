import {describe, expect, it} from 'vitest';
import {checkVoicevoxConnection, createVoicevoxClient} from '../src/core/voicevox-client';

describe('VOICEVOX live integration', () => {
  it('connects to a running VOICEVOX Engine', async () => {
    await expect(checkVoicevoxConnection(createVoicevoxClient())).resolves.toBeUndefined();
  });
});
