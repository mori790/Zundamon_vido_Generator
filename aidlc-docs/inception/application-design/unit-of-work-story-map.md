# Unit of Work Story Map: GUI with Embedded Codex Panel

## Story Mapping Summary

All 20 user stories are assigned to at least one unit. Primary ownership is listed first.

| Story | Primary Unit | Supporting Units |
|---|---|---|
| US-1: Open or create a single video project | U1 | U3 |
| US-2: Preserve CLI compatibility | U8 | U1, U3, U6 |
| US-3: Discuss a video idea with Codex | U2 | U1 |
| US-4: Handle Codex authentication or connection failure | U2 | U1 |
| US-5: Generate a script JSON draft from the planning conversation | U4 | U2, U3 |
| US-6: Review generated JSON in raw and structured views | U3 | U1 |
| US-7: Ask Codex to revise a draft before applying it | U4 | U2, U3 |
| US-8: Apply an approved JSON draft | U3 | U4, U1 |
| US-9: Edit scenes directly in the GUI | U3 | U5 |
| US-10: Select and attach image assets | U5 | U3 |
| US-11: Handle missing asset failures | U5 | U3, U6 |
| US-12: Validate the active script from the GUI | U6 | U3 |
| US-13: Generate voice and timeline artifacts | U6 | U1 |
| US-14: Handle VOICEVOX not running | U6 | U13 Log Panel within U6 |
| US-15: Preview the current video inside the GUI | U7 | U6, U3 |
| US-16: Render MP4 from the GUI | U8 | U6 |
| US-17: Monitor logs for long-running operations | U6 | U8 |
| US-18: Approve Codex-proposed production actions | U4 | U2, U6, U3 |
| US-19: Recover from render failures | U8 | U6, U2 |
| US-20: Continue manually when Codex is unavailable | U1 | U2, U3, U6 |

## Unit Coverage

### U1: Electron App Shell and Workspace Foundation

- Primary stories: US-1, US-20.
- Supports: US-2, US-3, US-4, US-6, US-8, US-13.

### U2: Codex App Server Connection

- Primary stories: US-3, US-4.
- Supports: US-5, US-7, US-18, US-19, US-20.

### U3: JSON Draft Review and Scene Editing

- Primary stories: US-6, US-8, US-9.
- Supports: US-1, US-2, US-5, US-7, US-10, US-11, US-12, US-15, US-18.

### U4: Codex Proposal and Approval Flow

- Primary stories: US-5, US-7, US-18.
- Supports: US-8.

### U5: Asset Selection and Visual Attachment

- Primary stories: US-10, US-11.
- Supports: US-9.

### U6: Command Runner and Log Panel

- Primary stories: US-12, US-13, US-14, US-17.
- Supports: US-2, US-11, US-15, US-16, US-18, US-19, US-20.

### U7: Embedded Remotion Preview

- Primary stories: US-15.
- Supports: none.

### U8: Render Workflow and CLI Compatibility Verification

- Primary stories: US-2, US-16, US-19.
- Supports: US-17.

## First Vertical Slice

The first desired vertical slice is:

1. Open a video ID.
2. Connect to Codex.
3. Discuss a video idea.
4. Receive a JSON draft.
5. Display the draft in the GUI.

This slice spans:

- U1: workspace foundation.
- U2: Codex connection.
- U3: draft display.
- U4: Codex proposal routing.

It intentionally stops before save, validation, audio generation, or rendering.

