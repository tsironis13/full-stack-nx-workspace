/** Port for turning text into embedding vectors (LM Studio in infrastructure). */
export abstract class EmbeddingClient {
  abstract readonly model: string;
  abstract readonly dimensions: number;

  abstract embed(texts: string[]): Promise<number[][]>;
}
