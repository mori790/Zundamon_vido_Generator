# Personas: GUI with Embedded Codex Panel

## Primary Persona

### P1: Individual Technical Video Creator

- **Role**: Solo creator producing recurring technical explainer videos.
- **Environment**: macOS local workspace with Node.js, VOICEVOX, Remotion, and project assets.
- **Goals**:
  - Turn a rough idea into a coherent Zundamon explainer video.
  - Discuss structure and wording with Codex before committing to a script.
  - Review generated JSON in a way that is understandable and editable.
  - Generate audio, preview, and render MP4 without leaving the production app.
- **Pain Points**:
  - Writing valid JSON manually is error-prone.
  - Switching between chat, editor, terminal, file browser, and preview interrupts flow.
  - AI-generated content must be reviewed before it changes actual project files.
  - VOICEVOX, missing assets, and render failures need clear explanations.
- **Success Criteria**:
  - Can go from idea to MP4 through one GUI.
  - Can see and control exactly when Codex changes files or runs commands.
  - Can recover from invalid JSON, missing assets, auth issues, and render errors.

## Persona Mapping

| Persona | Relevant Story Areas |
|---|---|
| P1: Individual Technical Video Creator | All MVP stories |
