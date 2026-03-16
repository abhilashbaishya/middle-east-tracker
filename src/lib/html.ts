import { decode } from "he";

import { MAX_DESCRIPTION_LENGTH } from "./config";

export function stripHtml(value: string): string {
  return decode(value.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

export function clampDescription(value: string): string {
  if (value.length <= MAX_DESCRIPTION_LENGTH) {
    return value;
  }

  return `${value.slice(0, MAX_DESCRIPTION_LENGTH).trimEnd()}\u2026`;
}
