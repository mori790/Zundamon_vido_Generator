import type {Scene} from '../shared/scene-segmentation';

export type EditableScene = Scene & {_key: string};

export function moveScene(scenes: EditableScene[], index: number, direction: 'up' | 'down'): EditableScene[] {
  const swapIndex = direction === 'up' ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= scenes.length) return scenes;
  const next = [...scenes];
  [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  return next;
}

export function addScene(scenes: EditableScene[]): EditableScene[] {
  const _key = `new-${scenes.length}-${Math.random().toString(36).slice(2)}`;
  return [...scenes, {_key, id: '', title: '', narration: '', tags: []}];
}

export function removeScene(scenes: EditableScene[], index: number): EditableScene[] {
  return scenes.filter((_, i) => i !== index);
}

export function updateSceneField(
  scenes: EditableScene[],
  index: number,
  field: 'title' | 'narration' | 'tags',
  value: string | string[],
): EditableScene[] {
  return scenes.map((s, i) => i === index ? {...s, [field]: value} : s);
}

export function finalizeScenes(scenes: EditableScene[]): Scene[] {
  return scenes.map((s, i) => ({
    id: `scene-${String(i + 1).padStart(3, '0')}`,
    title: s.title.trim(),
    narration: s.narration.trim(),
    tags: s.tags.map((t) => t.trim()).filter(Boolean),
  }));
}

export function parseTags(input: string): string[] {
  return input.split(',').map((t) => t.trim()).filter(Boolean);
}
