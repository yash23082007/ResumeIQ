/**
 * ResumeIQ — Client-Side Semantic Embeddings (@xenova/transformers)
 * Runs all-MiniLM-L6-v2 locally in the candidate's browser via WebAssembly/ONNX.
 * 100% private, zero server round-trips.
 */

let extractorPipeline = null;
let loadingPromise = null;

export async function getEmbeddingPipeline(onProgress = null) {
  if (extractorPipeline) return extractorPipeline;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      const { pipeline, env } = await import('@xenova/transformers');
      // Allow local and remote huggingface models
      env.allowLocalModels = false;
      env.useBrowserCache = true;

      const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        progress_callback: onProgress,
      });
      extractorPipeline = extractor;
      return extractor;
    } catch (err) {
      console.warn('Client-side @xenova/transformers pipeline initialization failed or unsupported:', err);
      return null;
    } finally {
      loadingPromise = null;
    }
  })();

  return loadingPromise;
}

export function cosineSimilarity(vecA, vecB) {
  let dot = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function computeClientSemanticMatch(bullets, jobRequirements, onProgress = null) {
  const pipe = await getEmbeddingPipeline(onProgress);
  if (!pipe) {
    // Fallback: token Jaccard similarity if WebAssembly/transformers is not supported
    return fallbackLexicalMatch(bullets, jobRequirements);
  }

  try {
    const bulletEmbeddings = [];
    for (const b of bullets) {
      const out = await pipe(b, { pooling: 'mean', normalize: true });
      bulletEmbeddings.push({ text: b, embedding: Array.from(out.data) });
    }

    const requirementMatches = [];
    for (const req of jobRequirements) {
      const reqOut = await pipe(req, { pooling: 'mean', normalize: true });
      const reqVec = Array.from(reqOut.data);

      let bestScore = 0;
      let bestBullet = null;
      for (const item of bulletEmbeddings) {
        const sim = cosineSimilarity(reqVec, item.embedding);
        if (sim > bestScore) {
          bestScore = sim;
          bestBullet = item.text;
        }
      }

      requirementMatches.push({
        requirement: req,
        matchedBullet: bestBullet,
        similarity: Math.round(bestScore * 100),
        status: bestScore >= 0.70 ? 'strong' : bestScore >= 0.50 ? 'moderate' : 'gap',
      });
    }

    const overallSim = requirementMatches.length
      ? Math.round(requirementMatches.reduce((acc, r) => acc + r.similarity, 0) / requirementMatches.length)
      : 0;

    return {
      provider: 'client-side-xenova',
      model: 'Xenova/all-MiniLM-L6-v2',
      overallSemanticMatch: overallSim,
      matches: requirementMatches,
    };
  } catch (exc) {
    console.warn('Transformer inference error, using lexical fallback:', exc);
    return fallbackLexicalMatch(bullets, jobRequirements);
  }
}

function fallbackLexicalMatch(bullets, jobRequirements) {
  const matches = jobRequirements.map((req) => {
    const reqWords = new Set(req.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean));
    let bestScore = 0;
    let bestBullet = null;

    for (const b of bullets) {
      const bWords = new Set(b.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean));
      let intersection = 0;
      for (const w of reqWords) {
        if (bWords.has(w)) intersection++;
      }
      const score = reqWords.size ? intersection / reqWords.size : 0;
      if (score > bestScore) {
        bestScore = score;
        bestBullet = b;
      }
    }

    const simPct = Math.round(bestScore * 100);
    return {
      requirement: req,
      matchedBullet: bestBullet,
      similarity: simPct,
      status: simPct >= 60 ? 'strong' : simPct >= 30 ? 'moderate' : 'gap',
    };
  });

  const overall = matches.length
    ? Math.round(matches.reduce((acc, r) => acc + r.similarity, 0) / matches.length)
    : 0;

  return {
    provider: 'local-token-matcher',
    overallSemanticMatch: overall,
    matches,
  };
}
