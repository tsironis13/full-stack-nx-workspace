/**
 * OpenAI-compatible client for LM Studio `/v1/embeddings`
 * (`text-embedding-qwen3-embedding-0.6b`, 1024 dimensions).
 */
import { Injectable } from '@nestjs/common';

import { PRODUCT_EMBEDDING_DIMENSIONS } from '../../../db/schema/product-embeddings';
import { EmbeddingClient } from '../domain/embedding-client';

const DEFAULT_BASE_URL = 'http://127.0.0.1:1234/v1';
const DEFAULT_MODEL = 'text-embedding-qwen3-embedding-0.6b';

type LmStudioEmbeddingResponse = {
  model?: string;
  data?: { embedding: number[] }[];
  error?: { message?: string };
};

@Injectable()
export class LmStudioEmbeddingClient extends EmbeddingClient {
  readonly model: string;
  readonly dimensions = PRODUCT_EMBEDDING_DIMENSIONS;

  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    super();
    this.baseUrl = (
      process.env.LM_STUDIO_BASE_URL ?? DEFAULT_BASE_URL
    ).replace(/\/$/, '');
    this.model =
      process.env.LM_STUDIO_EMBEDDING_MODEL ?? DEFAULT_MODEL;
    this.apiKey = process.env.LMSTUDIO_API_KEY ?? '';
  }

  async embed(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }
    if (!this.apiKey) {
      throw new Error(
        'LMSTUDIO_API_KEY is missing; LM Studio requires a Bearer token'
      );
    }

    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        input: texts,
      }),
    });

    const payload = (await response.json()) as LmStudioEmbeddingResponse;
    if (!response.ok) {
      throw new Error(
        payload.error?.message ??
          `LM Studio embeddings failed with HTTP ${response.status}`
      );
    }

    const vectors = payload.data?.map((item) => item.embedding) ?? [];
    if (vectors.length !== texts.length) {
      throw new Error(
        `LM Studio returned ${vectors.length} embeddings for ${texts.length} inputs`
      );
    }

    for (const vector of vectors) {
      if (vector.length !== this.dimensions) {
        throw new Error(
          `Expected ${this.dimensions}-dimensional embedding from ${this.model}, got ${vector.length}`
        );
      }
    }

    return vectors;
  }
}
