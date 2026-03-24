export interface JobSweepResult {
  scanned: number;
  processed: number;
}

export interface ApiJobsConfig {
  sweepIntervalMs: number;
  initialDelayMs: number;
}
