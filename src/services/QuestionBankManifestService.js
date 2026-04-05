export class QuestionBankManifestService {
  static manifest = null;
  static loaded = false;
  static loadError = "";
  static pending = null;

  static async init() {
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

    this.pending = (async () => {
      const response = await fetch(manifestUrl, { cache: "no-cache" });
      if (!response.ok) {
        throw new Error(`Failed to load question bank manifest (${response.status}).`);
      }

      const payload = await response.json();
      this.manifest = payload && typeof payload === "object" ? payload : null;
      this.loaded = !!this.manifest;
      this.loadError = "";

      if (!this.manifest) {
        throw new Error("Question bank manifest payload is invalid.");
      }

      return this.manifest;
    })()
      .catch((error) => {
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
