# User Stories

## Story Approach

- **Breakdown**: Hybrid journey-based plus feature-based.
- **Persona Scope**: Primary creator only.
- **Acceptance Criteria Style**: Standard Given/When/Then.
- **Priority Labels**: MVP priorities A, B, and C from the specification.
- **Future Extensions**: Out of scope for MVP.

## Story Index

| ID | Priority | Story |
|---|---:|---|
| US-001 | A | Validate a script before generation |
| US-002 | A | Generate VOICEVOX narration for each scene |
| US-003 | A | Reuse cached narration |
| US-004 | A | Measure audio and generate scene timeline |
| US-005 | A | Render synchronized subtitles |
| US-006 | A | Render fixed character art |
| US-007 | A | Render MP4 from one command |
| US-008 | B | Switch character expressions by scene |
| US-009 | B | Display explanation images |
| US-010 | B | Show title and ending scenes |
| US-011 | B | Report actionable errors and logs |
| US-012 | C | Animate simple lip sync |
| US-013 | C | Display code scenes |
| US-014 | C | Play optional BGM |
| US-015 | C | Highlight subtitle keywords |

## US-001: Validate a Script Before Generation

**As a** technical video creator, **I want** the system to validate my JSON script before generation, **so that** I can fix input problems before voice generation or rendering starts.

**Priority**: A

**Acceptance Criteria**

- Given `input/{videoId}.json` is missing, when I run validation, then the system stops and reports the missing script path.
- Given required fields are missing or invalid, when I run validation, then the system lists the invalid fields clearly.
- Given scene IDs are duplicated, when I run validation, then the system stops and identifies the duplicate IDs.
- Given a referenced visual path escapes `public`, when I run validation, then the system rejects the script.

**INVEST Check**: Independent, Negotiable, Valuable, Estimable, Small, Testable.

## US-002: Generate VOICEVOX Narration for Each Scene

**As a** technical video creator, **I want** narration WAV files generated from every scene's text, **so that** I do not need to manually synthesize each line.

**Priority**: A

**Acceptance Criteria**

- Given VOICEVOX Engine is running, when I run `npm run voice -- {videoId}`, then a WAV file is created for each scene under `public/audio/{videoId}/`.
- Given speaker settings are present, when narration is generated, then speed, pitch, intonation, and volume settings are applied.
- Given VOICEVOX Engine is unavailable, when I run voice generation, then the system stops with the specified Japanese connection error.

**INVEST Check**: Independent, Negotiable, Valuable, Estimable, Small, Testable.

## US-003: Reuse Cached Narration

**As a** technical video creator, **I want** unchanged narration to be reused, **so that** repeated generation is faster.

**Priority**: A

**Acceptance Criteria**

- Given a scene's text and voice settings have not changed, when I regenerate voices, then the existing WAV is reused.
- Given a scene's text or voice settings changed, when I regenerate voices, then only that scene's WAV is regenerated.
- Given I pass `--force`, when voice generation runs, then the cache is bypassed.
- Given generation fails partway through, when I run again, then successfully generated WAV files remain available for cache reuse.

**INVEST Check**: Independent, Negotiable, Valuable, Estimable, Small, Testable.

## US-004: Measure Audio and Generate Scene Timeline

**As a** technical video creator, **I want** the system to calculate scene timing from audio duration, **so that** subtitles and scene transitions align automatically.

**Priority**: A

**Acceptance Criteria**

- Given WAV files exist for each scene, when timeline generation runs, then `generated/timelines/{videoId}.timeline.json` is created.
- Given scene wait durations are omitted, when timing is calculated, then default before and after speech durations are applied.
- Given fps is configured, when frame values are calculated, then seconds are multiplied by fps and rounded.
- Given multiple scenes exist, when the timeline is generated, then each scene starts after the previous scene ends.

**INVEST Check**: Independent, Negotiable, Valuable, Estimable, Small, Testable.

## US-005: Render Synchronized Subtitles

**As a** technical video creator, **I want** subtitles to appear during narration, **so that** viewers can read the spoken explanation.

**Priority**: A

**Acceptance Criteria**

- Given subtitles are enabled, when a scene's audio starts, then the scene text appears at the bottom center.
- Given the scene audio ends, when playback continues, then the subtitle for that scene disappears.
- Given text exceeds the configured line length, when rendered, then line breaking uses Japanese punctuation, particles, approximate character length, and forced splitting as fallbacks.
- Given text still exceeds the configured limit, when rendered, then font size is reduced or a warning is logged.

**INVEST Check**: Independent, Negotiable, Valuable, Estimable, Small, Testable.

## US-006: Render Fixed Character Art

**As a** technical video creator, **I want** Zundamon displayed consistently in the video, **so that** every scene has the expected character presence.

**Priority**: A

**Acceptance Criteria**

- Given character visibility is enabled or omitted, when a scene renders, then Zundamon appears in the lower-right default position.
- Given character visibility is false, when a scene renders, then the character is hidden.
- Given real character assets are not yet provided, when using the development setup, then placeholder character assets allow preview and render verification.

**INVEST Check**: Independent, Negotiable, Valuable, Estimable, Small, Testable.

## US-007: Render MP4 From One Command

**As a** technical video creator, **I want** one command to generate the final video, **so that** the full workflow is repeatable.

**Priority**: A

**Acceptance Criteria**

- Given a valid script, required assets, and running VOICEVOX Engine, when I run `npm run video -- {videoId}`, then the system validates input, generates voices, generates a timeline, renders video, and writes `output/{videoId}.mp4`.
- Given video settings specify width, height, and fps, when rendering completes, then the MP4 uses those settings.
- Given an output file already exists, when rendering completes, then the file may be overwritten.

**INVEST Check**: Independent, Negotiable, Valuable, Estimable, Small, Testable.

## US-008: Switch Character Expressions by Scene

**As a** technical video creator, **I want** each scene to select Zundamon's expression, **so that** the video tone matches the narration.

**Priority**: B

**Acceptance Criteria**

- Given a scene emotion is `normal`, `happy`, `surprised`, or `troubled`, when the scene renders, then the matching character image set is used.
- Given emotion is omitted, when the scene renders, then `normal` is used.
- Given an unsupported emotion is provided, when validation runs, then the system stops with a clear validation error.

**INVEST Check**: Independent, Negotiable, Valuable, Estimable, Small, Testable.

## US-009: Display Explanation Images

**As a** technical video creator, **I want** scene-specific explanation images displayed, **so that** technical concepts can be shown visually.

**Priority**: B

**Acceptance Criteria**

- Given a scene visual of type `image`, when the scene renders, then the referenced image is displayed.
- Given image fit is omitted, when rendered, then `contain` is used.
- Given image position is set to left, center, or right, when rendered, then placement follows the selected position.
- Given the image file is missing, when validation runs, then the system stops with a clear asset error.

**INVEST Check**: Independent, Negotiable, Valuable, Estimable, Small, Testable.

## US-010: Show Title and Ending Scenes

**As a** technical video creator, **I want** title and ending scenes rendered from the script, **so that** generated videos have a complete presentation structure.

**Priority**: B

**Acceptance Criteria**

- Given a title scene exists, when rendered, then the video title and character are displayed in a title layout.
- Given an ending scene exists, when rendered, then the closing text and credits are displayed.
- Given title or ending scenes are missing, when validation runs, then the system warns without blocking generation.

**INVEST Check**: Independent, Negotiable, Valuable, Estimable, Small, Testable.

## US-011: Report Actionable Errors and Logs

**As a** technical video creator, **I want** clear logs and error messages, **so that** I can fix problems quickly.

**Priority**: B

**Acceptance Criteria**

- Given generation starts, when each major step completes, then an INFO log is emitted.
- Given a recoverable issue exists, when validation or generation runs, then a WARN log identifies the issue.
- Given a blocking issue occurs, when the process stops, then an ERROR log identifies the failed step and relevant video or scene ID.
- Given rendering fails, when the process stops, then the system reports that Remotion or FFmpeg logs should be checked.

**INVEST Check**: Independent, Negotiable, Valuable, Estimable, Small, Testable.

## US-012: Animate Simple Lip Sync

**As a** technical video creator, **I want** Zundamon's mouth to open and close during speech, **so that** the video feels less static.

**Priority**: C

**Acceptance Criteria**

- Given scene audio has not started, when the scene renders, then the closed-mouth image is used.
- Given scene audio is playing, when frames advance, then open and closed-mouth images alternate by the configured interval.
- Given scene audio has ended, when the scene renders, then the closed-mouth image is used.
- Given the character is speaking, when frames advance, then a slight vertical motion is applied.

**INVEST Check**: Independent, Negotiable, Valuable, Estimable, Small, Testable.

## US-013: Display Code Scenes

**As a** technical video creator, **I want** code visual scenes, **so that** programming concepts can be explained without creating separate images.

**Priority**: C

**Acceptance Criteria**

- Given a scene visual of type `code`, when rendered, then the code block is displayed.
- Given a file name is provided, when rendered, then the file name appears with the code.
- Given code is displayed, when rendered, then line numbers are shown.
- Given a language is provided, when rendered, then syntax highlighting is applied where supported.

**INVEST Check**: Independent, Negotiable, Valuable, Estimable, Small, Testable.

## US-014: Play Optional BGM

**As a** technical video creator, **I want** optional BGM to play under narration, **so that** videos can have a consistent audio bed.

**Priority**: C

**Acceptance Criteria**

- Given BGM is configured and exists, when the video renders, then BGM is included at the configured volume.
- Given BGM is omitted, when the video renders, then generation continues without BGM.
- Given BGM is configured but missing, when validation runs, then the system warns without blocking generation.

**INVEST Check**: Independent, Negotiable, Valuable, Estimable, Small, Testable.

## US-015: Highlight Subtitle Keywords

**As a** technical video creator, **I want** configured subtitle keywords highlighted, **so that** important technical terms stand out.

**Priority**: C

**Acceptance Criteria**

- Given `highlightKeywords` includes matching words, when subtitles render, then those words use the highlight style.
- Given no keywords are configured, when subtitles render, then standard subtitle styling is used.
- Given highlighted text spans wrapped lines, when rendered, then the subtitle remains readable and aligned.

**INVEST Check**: Independent, Negotiable, Valuable, Estimable, Small, Testable.

## MVP Out of Scope

- AI script generation from theme.
- Web image search.
- Generative image creation.
- High-precision phoneme-based lip sync.
- Multiple character conversations.
- GUI editing screen.
- YouTube auto-posting.
- Thumbnail generation.
- Automatic BGM or sound-effect selection.
- VOICEVOX accent auto-correction.

## Extension Compliance Summary

- Security Baseline: N/A. Disabled during Requirements Analysis.
- Resiliency Baseline: N/A. Disabled during Requirements Analysis.
- Property-Based Testing: N/A. Disabled during Requirements Analysis.

