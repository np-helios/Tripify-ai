import { InferenceSession, Tensor } from 'onnxruntime-react-native';
import { getTokenizer } from './tokenizer';

let session: InferenceSession | null = null;

export const loadModel = async (modelPath: string) => {
    session = await InferenceSession.create(modelPath);
};

const NUM_LAYERS = 32;
const NUM_HEADS = 32;
const HEAD_DIM = 96;

function initializeEmptyPastKeyValues() {
  const pastKeyValues: Record<string, Tensor> = {};
  for (let i = 0; i < NUM_LAYERS; i++) {
    const shape = [1, NUM_HEADS, 0, HEAD_DIM];
    const empty = new Float32Array(1 * NUM_HEADS * 0 * HEAD_DIM);
    pastKeyValues[`past_key_values.${i}.key`] = new Tensor('float32', empty, shape);
    pastKeyValues[`past_key_values.${i}.value`] = new Tensor('float32', empty, shape);
  }
  return pastKeyValues;
}

// Usage: Pass a tokenizer object (with encode/decode) as argument
export const generateText = async (prompt: string, tokenizer: any, maxLength: number = 100): Promise<string> => {
  if (!session) throw new Error('Model not loaded');
  const inputIds = tokenizer.encode(prompt);
  let generatedTokens: number[] = [];
  let pastKeyValues = initializeEmptyPastKeyValues();

  for (let step = 0; step < maxLength; step++) {
    const inputTensor = new Tensor('int64', BigInt64Array.from(inputIds.map(BigInt)), [1, inputIds.length]);
    const attentionMask = new Tensor('int64', BigInt64Array.from(inputIds.map(() => BigInt(1))), [1, inputIds.length]);
    const feeds: Record<string, Tensor> = {
      input_ids: inputTensor,
      attention_mask: attentionMask,
      ...pastKeyValues,
    };

    // Removed verbose log for input tensor shapes

    const results = await session.run(feeds);
    const logits = results['logits']?.data;
    if (!logits) break;

    // Get the last token's logits
    const vocabSize = logits.length;
    let predictedId = 0;
    let maxLogit = logits[0];
    for (let i = 1; i < vocabSize; ++i) {
      if (logits[i] > maxLogit) {
        maxLogit = logits[i];
        predictedId = i;
      }
    }
    generatedTokens.push(predictedId);

    // Prepare past_key_values for next step
    pastKeyValues = {};
    for (let i = 0; i < NUM_LAYERS; i++) {
      pastKeyValues[`past_key_values.${i}.key`] = results[`present.${i}.key`];
      pastKeyValues[`past_key_values.${i}.value`] = results[`present.${i}.value`];
    }

    // For next step, only use the last generated token
    // (for simplicity, not supporting full sequence generation here)
    inputIds.length = 0;
    inputIds.push(predictedId);

    // Optional: break on EOS token
    if (predictedId === 2 || predictedId === 0) break;
  }

  return tokenizer.decode(generatedTokens);
};

// Legacy function for backward compatibility (requires tokenizer argument now)
export const runInference = async (prompt: string, tokenizer: any) => {
  return await generateText(prompt, tokenizer, 50); // Generate up to 50 tokens
};
 