# End-to-End Test Instructions

## Clean-Profile Internal Acceptance

Use `docs/internal-acceptance/clean-profile-smoke-checklist.md` as the authoritative checklist.

1. Prepare a new macOS user profile or a clean Apple Silicon Mac.
2. Receive the `local-acceptance` ZIP and SHA-256 directly from the developer.
3. Verify the ZIP SHA-256.
4. Expand the ZIP and launch the app.
5. Select an empty Workspace folder.
6. Open `sample-video`.
7. Run Preview.
8. Run Render if VOICEVOX Engine is available.
9. Confirm `output/sample-video.mp4` exists and is not 0 bytes.
10. Record evidence using `docs/internal-acceptance/acceptance-evidence-template.md`.

## Developer-Assisted VOICEVOX-Absent Path

If VOICEVOX cannot be prepared by the internal user:

1. Mark the normal VOICEVOX render step as `Not Run`.
2. Use a developer-provided Workspace with existing audio, or run the skip-voice render path under developer supervision.
3. Record the path as developer-assisted evidence.

## Rollback Path

1. Keep the user's Workspace unchanged.
2. Replace only the app artifact with the previous known-good ZIP or `.app`.
3. Re-run the minimum smoke check.
4. Record the replaced artifact, timestamp, result, and remaining issue.

## Expected Result

- Internal user can reach sample Preview and, when VOICEVOX is available, a non-empty MP4.
- Evidence contains no token, credential, API key, or unnecessary absolute user path.
- Artifact remains classified as `local-acceptance` and not public distribution.

