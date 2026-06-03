import type { QuestionBankManifest } from "../types";

export class QuestionBankManifestService {
  static manifest: QuestionBankManifest | null = null;
  static loaded: boolean = false;
  static loadError: string = "";
  static pending: Promise<QuestionBankManifest> | null = null;

  static async init(): Promise<QuestionBankManifest> {
    if (this.loaded && this.manifest) {
      return this.manifest;
    }

    if (this.pending) {
      return this.pending;
    }

    const baseUrl = import.meta.env.BASE_URL.endsWith("/")
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;
    const manifestUrl = `${baseUrl}question-bank-manifest.json`;

    this.pending = (async (): Promise<QuestionBankManifest> => {
      const response = await fetch(manifestUrl, { cache: "no-cache" });
      if (!response.ok) {
        throw new Error(`Failed to load question bank manifest (${response.status}).`);
      }

      const payload = await response.json();
      const manifest = payload && typeof payload === "object" ? (payload as QuestionBankManifest) : null;
      this.manifest = manifest;
      this.loaded = !!this.manifest;
      this.loadError = "";

      if (!this.manifest) {
        throw new Error("Question bank manifest payload is invalid.");
      }

      return this.manifest;
    })()
      .catch((error: any) => {
        this.manifest = null;
        this.loaded = false;
        this.loadError = error.message || "Failed to load question bank manifest.";
        throw error;
      })
      .finally(() => {
        this.pending = null;
      });

    return this.pending;
  }
}
