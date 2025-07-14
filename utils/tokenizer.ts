// Use the upgraded GPT-2 tokenizer that loads vocab/merges from the model directory
export async function getTokenizer(modelDir: string) {
  const { getGpt2Tokenizer } = require('./gpt2_tokenizer.js');
  return await getGpt2Tokenizer(modelDir);
}
 