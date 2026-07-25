# Business Overview

## Business Description

- **Business Description**: Zundamon Video Generator is a local video-generation tool for creators who produce recurring technical explainer videos. It converts authored video script JSON into VOICEVOX audio, calculated scene timelines, Remotion-rendered visuals, and MP4 output.
- **Primary Business User**: Individual technical video creator.
- **Business Goal**: Reduce repeated editing work by automating voice generation, subtitle timing, character display, scene layout, and MP4 rendering.

## Business Transactions

- **Validate Script**: Check a video script JSON and referenced public assets before generation.
- **Generate Voices**: Create or reuse WAV audio files for each scene through VOICEVOX Engine.
- **Generate Timeline**: Convert generated audio durations into frame-accurate Remotion scene timing.
- **Preview Video**: Open Remotion Studio with generated render data for review.
- **Render Video**: Produce an MP4 file under `output/`.

## Business Dictionary

- **Video ID**: Stable identifier matching `input/{videoId}.json`.
- **Scene**: Unit of video content with text, type, emotion, optional visual asset, and timing padding.
- **Manifest**: Cache metadata for generated voice files.
- **Timeline**: Frame timing data generated from audio durations and scene padding.
- **Visual**: Scene explanation material, currently image, code, text, or none.

## Component Level Business Descriptions

### CLI Scripts

- **Purpose**: Expose creator workflows as npm commands.
- **Responsibilities**: Validation, voice generation, timeline generation, preview startup, and MP4 rendering.

### Core Services

- **Purpose**: Implement the reusable generation pipeline.
- **Responsibilities**: Script loading, asset checking, VOICEVOX integration, cache manifests, audio measurement, timeline calculation, and Remotion rendering.

### Remotion Composition

- **Purpose**: Convert render data into video frames.
- **Responsibilities**: Draw background, title or ending scenes, explanation visuals, subtitles, character image, simple lip-sync, and audio.

