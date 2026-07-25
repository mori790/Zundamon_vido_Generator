# Application Design

## Summary

Zundamon Video Generator will be implemented as a TypeScript Node.js and Remotion application. CLI entry points live in `scripts/`; shared validation, generation, timing, rendering orchestration, types, and utilities live in `src/`; Remotion React components live under `src/compositions` and `src/components`.

The design keeps core generation logic independent from Remotion components. CLI scripts orchestrate workflows, core modules perform validation and generation, and Remotion receives prepared input props for rendering.

## Approved Design Decisions

- Code organization follows the specification's `scripts/` plus `src/` structure.
- Runtime validation uses Zod schemas.
- Rendering uses Remotion Node APIs from TypeScript scripts.
- Remotion input is built from script, manifest, and timeline JSON.
- Dependency direction is one-way: CLI to core, Remotion to render data/types, core independent of Remotion.

## Main Components

- Script Schema and Script Loader.
- Asset Checker and Path Resolver.
- VOICEVOX Client, Voice Generator, Manifest Store, and Audio Analyzer.
- Timeline Generator and Timeline Store.
- Render Data Builder and Render Service.
- Remotion composition and scene components.
- CLI Orchestrator and Logger.

## Service Flow

1. `validate` loads the script, validates schema, and checks assets.
2. `voice` validates input, checks VOICEVOX, generates or reuses WAV files, and updates manifest durations.
3. `timeline` builds frame data from script scene settings and manifest audio durations.
4. `video` runs validate, voice, timeline, render data build, and Remotion render.
5. `preview` prepares render data and opens Remotion Studio for iterative review.

## Design Artifact References

- `components.md`: Component definitions and responsibilities.
- `component-methods.md`: High-level method signatures.
- `services.md`: Service definitions and orchestration patterns.
- `component-dependency.md`: Dependency relationships, data flow, and coupling rules.

## Validation Summary

- Required application design artifacts are present.
- Component responsibilities map to approved requirements and user stories.
- Service boundaries cover validation, voice generation, timeline generation, rendering, and preview.
- Dependency rules preserve separation between core generation logic and Remotion rendering.

## Extension Compliance Summary

- Security Baseline: N/A. Disabled during Requirements Analysis.
- Resiliency Baseline: N/A. Disabled during Requirements Analysis.
- Property-Based Testing: N/A. Disabled during Requirements Analysis.

