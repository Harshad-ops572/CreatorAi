export class VectorService {
  /**
   * Calculates cosine similarity between two numeric vectors.
   * Returns a value between -1 and 1 (typically 0 to 1 for normalized embeddings).
   */
  public cosineSimilarity(a: number[], b: number[]): number {
    if (!a || !b || a.length === 0 || b.length === 0 || a.length !== b.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Generates a deterministic mock embedding vector (length 384) from a text string
   * when offline or when GEMINI_API_KEY is not yet supplied.
   */
  public generateFallbackEmbedding(text: string, dimensions = 384): number[] {
    const vector: number[] = new Array(dimensions).fill(0);
    const clean = text.toLowerCase().trim();

    for (let i = 0; i < clean.length; i++) {
      const charCode = clean.charCodeAt(i);
      const index = (charCode * 31 + i * 17) % dimensions;
      vector[index] += Math.sin(charCode + i) * 0.5;
    }

    // Normalize
    let norm = 0;
    for (let i = 0; i < dimensions; i++) {
      norm += vector[i] * vector[i];
    }
    const mag = Math.sqrt(norm) || 1;
    return vector.map((v) => v / mag);
  }

  /**
   * Finds the best matching scenes for a given script shot requirement query embedding.
   * Returns matches ranked by confidence percentage (0-100%).
   */
  public rankMatches<T extends { embedding?: number[] }>(
    queryEmbedding: number[],
    items: T[],
    topK = 3
  ): Array<{ item: T; confidencePercent: number }> {
    const scored = items.map((item) => {
      const sim = item.embedding ? this.cosineSimilarity(queryEmbedding, item.embedding) : 0;
      // Map [-1, 1] to a realistic confidence percentage [50% - 98%]
      const confidencePercent = Math.min(99, Math.max(45, Math.round(((sim + 1) / 2) * 100)));
      return { item, confidencePercent };
    });

    scored.sort((a, b) => b.confidencePercent - a.confidencePercent);
    return scored.slice(0, topK);
  }
}

export const vectorService = new VectorService();
