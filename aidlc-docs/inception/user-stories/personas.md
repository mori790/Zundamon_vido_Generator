# Personas

## Persona P1: Technical Video Creator

### Profile

- **Role**: Individual creator producing recurring technical explanation videos.
- **Primary Goal**: Convert prepared JSON scripts and assets into Zundamon explanation videos with minimal repetitive editing work.
- **Environment**: macOS, Node.js, VOICEVOX Engine, Remotion, FFmpeg.
- **Working Style**: Iterates by editing JSON, previewing output, fixing issues, and rendering MP4.

### Motivations

- Reduce manual editing for narration, subtitles, scene timing, character placement, and rendering.
- Keep video production repeatable across many technical topics.
- Reuse generated voice assets when script lines have not changed.
- Get clear errors that point directly to missing inputs or invalid configuration.

### Pain Points

- Manually generating VOICEVOX audio for each line is repetitive.
- Subtitle timing is tedious when every narration length is different.
- Asset placement and expression switching are easy to forget or apply inconsistently.
- Rendering failures are expensive when the root cause is unclear.

### Success Criteria

- A valid script can be turned into a complete MP4 with one command.
- Re-running unchanged scripts is faster because voice files are cached.
- Input and asset problems are detected before expensive rendering work.
- Preview and validation loops are fast enough for iterative video production.

### Story Mapping

| Persona | Relevant Stories |
|---|---|
| P1 Technical Video Creator | US-001, US-002, US-003, US-004, US-005, US-006, US-007, US-008, US-009, US-010, US-011, US-012, US-013, US-014, US-015 |

## Out-of-Scope Personas

Future GUI users, collaborators, and publishing operators are out of scope for MVP user stories. Future extensions such as AI script generation, GUI editing, thumbnail generation, and YouTube posting remain outside the MVP story set.

