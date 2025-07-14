import * as FileSystem from 'expo-file-system';

// Helper to read and parse vocab.json
async function loadVocab(modelDir) {
  const vocabPath = modelDir + 'vocab.json';
  const vocabStr = await FileSystem.readAsStringAsync(vocabPath);
  return JSON.parse(vocabStr);
}

// Helper to read and parse merges.txt
async function loadMerges(modelDir) {
  const mergesPath = modelDir + 'merges.txt';
  const mergesStr = await FileSystem.readAsStringAsync(mergesPath);
  // Skip the first line (header)
  return mergesStr.split('\n').slice(1).map(line => line.split(' ')).filter(pair => pair.length === 2);
}

// BPE encode implementation (simplified for demo)
function getPairs(word) {
  const pairs = new Set();
  for (let i = 0; i < word.length - 1; ++i) {
    pairs.add(word[i] + ' ' + word[i + 1]);
  }
  return pairs;
}

function bpe(token, bpeRanks, cache) {
  if (cache[token]) return cache[token];
  let word = token.split('');
  while (true) {
    const pairs = Array.from(getPairs(word));
    if (!pairs.length) break;
    let minPair = null;
    let minRank = Infinity;
    for (const pair of pairs) {
      if (bpeRanks[pair] !== undefined && bpeRanks[pair] < minRank) {
        minRank = bpeRanks[pair];
        minPair = pair;
      }
    }
    if (minPair === null) break;
    const [a, b] = minPair.split(' ');
    const newWord = [];
    let i = 0;
    while (i < word.length) {
      const j = word.indexOf(a, i);
      if (j === -1) {
        newWord.push(...word.slice(i));
        break;
      }
      newWord.push(...word.slice(i, j));
      if (j < word.length - 1 && word[j + 1] === b) {
        newWord.push(a + b);
        i = j + 2;
      } else {
        newWord.push(word[j]);
        i = j + 1;
      }
    }
    word = newWord;
  }
  cache[token] = word;
  return word;
}

export async function getGpt2Tokenizer(modelDir) {
  const vocab = await loadVocab(modelDir);
  const merges = await loadMerges(modelDir);
  const bpeRanks = {};
  merges.forEach((pair, idx) => {
    bpeRanks[pair.join(' ')] = idx;
  });
  const cache = {};
  const invVocab = Object.fromEntries(Object.entries(vocab).map(([k, v]) => [v, k]));

  function encode(text) {
    // For demo: split on whitespace, then BPE each token
    const tokens = text.split(/\s+/).flatMap(token => {
      const bpeTokens = bpe(token, bpeRanks, cache);
      return bpeTokens.map(t => vocab[t] !== undefined ? vocab[t] : vocab['!']);
    });
    return tokens;
  }

  function decode(tokens) {
    // For demo: join tokens
    return tokens.map(t => invVocab[t] || '!').join(' ');
  }

  return { encode, decode };
} 