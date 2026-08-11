# Debug Session: webgpu-progress-bar

**Status**: [OPEN]
**Date**: 2026-08-11
**Symptom**: Progress bar shows 0.00% or very small percentages, user says "no real download"
**Expected**: Progress bar should visibly fill as model downloads

## Hypotheses

| # | Hypothesis | Status |
|---|-----------|--------|
| 1 | progress_callback never fires | 待验证 |
| 2 | progress values are 0-1 (not 0-100) | 待验证 |
| 3 | Worker→Main thread message drops data | 待验证 |
| 4 | Vite caches old worker.js | 待验证 |

## Steps

1. Add console.log to worker.js progress_callback
2. Add console.log to App.tsx message handler
3. Check browser console for evidence
4. Fix based on evidence
