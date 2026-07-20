export function formatProgress(progress: number): string {
  return `${progress}%`;
}

export function formatMinutes(minutes: number | null): string {
  if (minutes === null || minutes === undefined) return '';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatTags(tags: string[] | string): string[] {
  if (Array.isArray(tags)) return tags;
  try {
    const parsed = JSON.parse(tags);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parseTags(tags: string[]): string {
  return JSON.stringify(tags);
}

export function parseDependencies(deps: string[] | string): string[] {
  if (Array.isArray(deps)) return deps;
  try {
    const parsed = JSON.parse(deps);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
}

export function generateId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).substr(2, 9);
}
