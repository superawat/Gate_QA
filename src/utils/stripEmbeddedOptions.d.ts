export interface EmbeddedOption {
  label: string;
  text: string;
  html: string;
}

export function hasEmbeddedOptions(html?: string): boolean;
export function extractEmbeddedOptions(html?: string): EmbeddedOption[];
export function stripEmbeddedOptions(html?: string): string;
