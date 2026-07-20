export function validateTaskTitle(title: string): string | null {
  if (!title || title.trim().length === 0) return 'Title is required';
  if (title.trim().length > 200) return 'Title must be 200 characters or less';
  return null;
}

export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
