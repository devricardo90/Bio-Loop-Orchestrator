export interface JobSweepResult {
  scanned: number;
  processed: number;
  failed: number;
  retried: number;
  skipped: number;
}

export interface ApiJobsConfig {
  sweepIntervalMs: number;
  initialDelayMs: number;
  maxAttempts: number;
  maxFailureStreak: number;
  staleAfterMs: number;
}

export interface WorkerStatusSnapshot {
  status: "idle" | "running" | "healthy" | "degraded";
  lastStartedAt: string | null;
  lastFinishedAt: string | null;
  lastSuccessAt: string | null;
  lastErrorAt: string | null;
  lastErrorMessage: string | null;
  failureStreak: number;
  lockHeld: boolean;
}
