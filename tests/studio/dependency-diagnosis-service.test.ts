import {describe, expect, it, vi} from 'vitest';
import {createDependencyDiagnosisService} from '../../src/studio/main/dependency-diagnosis-service';

describe('DependencyDiagnosisService', () => {
  it('classifies ready dependencies independently', async () => {
    const execute = vi.fn()
      .mockResolvedValueOnce({stdout: 'codex-cli 0.145.0\n', stderr: ''})
      .mockResolvedValueOnce({stdout: 'Logged in\n', stderr: ''});
    const request = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => '0.25.1',
    });
    const report = await createDependencyDiagnosisService(execute as never, request as never).checkAll();
    expect(report.codex).toMatchObject({status: 'ready', detectedVersion: '0.145.0'});
    expect(report.voicevox).toMatchObject({status: 'ready', detectedVersion: '0.25.1'});
  });

  it('contains a VOICEVOX failure without hiding Codex readiness', async () => {
    const execute = vi.fn()
      .mockResolvedValueOnce({stdout: 'codex-cli 0.145.0\n', stderr: ''})
      .mockResolvedValueOnce({stdout: 'Logged in\n', stderr: ''});
    const report = await createDependencyDiagnosisService(
      execute as never,
      vi.fn().mockRejectedValue(new Error('offline')) as never,
    ).checkAll();
    expect(report.codex.status).toBe('ready');
    expect(report.voicevox).toEqual({
      dependency: 'voicevox',
      status: 'stopped',
      actionCode: 'voicevox-start',
    });
  });
});
