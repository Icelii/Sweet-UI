import { defineConfig } from 'vitest/config';

// Extra Vitest options for `ng test` (see "runnerConfig" in angular.json).
export default defineConfig({
  test: {
    // Vitest's on-disk module cache keeps stale copies of files that Angular builds,
    // so edited code would not be tested. Angular already rebuilds incrementally.
    fsModuleCache: false,
  },
});