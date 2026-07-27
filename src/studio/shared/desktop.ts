export type DependencyName = 'codex' | 'voicevox';
export type DependencyState =
  | 'ready'
  | 'missing'
  | 'stopped'
  | 'unsupported'
  | 'unauthenticated'
  | 'unreachable';

export type DependencyStatus = {
  dependency: DependencyName;
  status: DependencyState;
  detectedVersion?: string;
  actionCode?: string;
};

export type DependencyReport = {
  codex: DependencyStatus;
  voicevox: DependencyStatus;
};

export type DependencyApi = {
  checkAll(): Promise<DependencyReport>;
  check(name: DependencyName): Promise<DependencyStatus>;
};
