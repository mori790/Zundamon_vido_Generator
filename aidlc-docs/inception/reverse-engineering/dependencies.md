# Dependencies

## Internal Dependencies

- CLI scripts depend on `src/core` services.
- `src/core` services depend on `src/types`, `src/schemas`, and `src/utils`.
- Remotion composition depends on generated render data and public assets.
- Tests depend on core utilities and schemas.

## External Dependencies

### `@remotion/bundler`

- **Version**: `^4.0.0`
- **Purpose**: Bundle the Remotion entry point before rendering.

### `@remotion/renderer`

- **Version**: `^4.0.0`
- **Purpose**: Select compositions and render MP4 files.

### `remotion`

- **Version**: `^4.0.0`
- **Purpose**: Composition runtime and media primitives.

### `react` and `react-dom`

- **Version**: `^18.2.0`
- **Purpose**: UI component rendering for Remotion.

### `zod`

- **Version**: `^3.23.8`
- **Purpose**: JSON schema validation.

### `tsx`

- **Version**: `^4.16.0`
- **Purpose**: Run TypeScript CLI scripts directly.

### `vitest`

- **Version**: `^2.0.0`
- **Purpose**: Test execution.

