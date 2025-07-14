import { InferenceSession, Tensor } from 'onnxruntime-react-native';

let session: InferenceSession | null = null;

export async function getSession(modelPath: string) {
  if (session) return session;
  session = await InferenceSession.create(modelPath);
  return session;
}

// DistilGPT2: 6 layers, 12 heads, head_dim=64 (for standard distilgpt2)
const NUM_LAYERS = 6;
const NUM_HEADS = 12;
const HEAD_DIM = 64;

function getEmptyPastKeyValues() {
  const past: Record<string, Tensor> = {};
  for (let i = 0; i < NUM_LAYERS; i++) {
    // Shape: [1, num_heads, 0, head_dim] (sequence length 0 for first step)
    const shape = [1, NUM_HEADS, 0, HEAD_DIM];
    const empty = new Float32Array(1 * NUM_HEADS * 0 * HEAD_DIM);
    past[`past_key_values.${i}.key`] = new Tensor('float32', empty, shape);
    past[`past_key_values.${i}.value`] = new Tensor('float32', empty, shape);
  }
  return past;
}

export async function generateNextToken(modelPath: string, inputIds: number[], pastKeyValues?: Record<string, Tensor>): Promise<number> {
  const session = await getSession(modelPath);
  const input = new Tensor('int64', BigInt64Array.from(inputIds.map(BigInt)), [1, inputIds.length]);
  const feeds: Record<string, Tensor> = { [session.inputNames[0]]: input };

  // Add attention_mask (all 1s)
  const attentionMask = new Tensor(
    'int64',
    BigInt64Array.from(inputIds.map(() => BigInt(1))),
    [1, inputIds.length]
  );
  feeds['attention_mask'] = attentionMask;

  // Add position_ids ([0, 1, 2, ...])
  const positionIds = new Tensor(
    'int64',
    BigInt64Array.from(inputIds.map((_, i) => BigInt(i))),
    [1, inputIds.length]
  );
  feeds['position_ids'] = positionIds;

  // Add past_key_values for all layers
  const past = pastKeyValues || getEmptyPastKeyValues();
  Object.assign(feeds, past);

  const output = await session.run(feeds);
  const outputName = session.outputNames[0];
  const logits = output[outputName].data as Float32Array;
  const vocabSize = logits.length / inputIds.length;
  const lastLogits = logits.slice(-vocabSize);
  let maxIdx = 0, maxVal = lastLogits[0];
  for (let i = 1; i < lastLogits.length; i++) {
    if (lastLogits[i] > maxVal) {
      maxVal = lastLogits[i];
      maxIdx = i;
    }
  }
  return maxIdx;
} 