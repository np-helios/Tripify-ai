import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import ChatBubble from '@/components/ChatBubble';
import { colors, fonts, sizes, spacing, borderRadius } from '@/constants/theme';
import { Send, Mic } from 'lucide-react-native';
import { chatSuggestions } from '@/data/mockData';
import { loadRagData, searchFaqRag } from '@/utils/rag';
import * as FileSystem from 'expo-file-system';
import { ensureModelReady } from '@/utils/modelSetup';
import { getTokenizer } from '@/utils/tokenizer';
import { generateNextToken } from '@/utils/onnxInference';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI travel assistant for Ladakh. I can help you with places to visit, weather information, local customs, and travel tips. What would you like to know?',
      isUser: false,
      timestamp: '10:30 AM',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ragData, setRagData] = useState<any[] | null>(null);
  const modelDirRef = useRef<string>('');
  const tokenizerRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setLoadError('');
      try {
        // Load RAG data (replace with your actual path if needed)
        const ragPath = FileSystem.documentDirectory + 'rag.json';
        const ragExists = await FileSystem.getInfoAsync(ragPath);
        if (ragExists.exists) {
          const rag = await loadRagData(ragPath);
          const faqArray = rag?.leh_ladakh?.faq || [];
          setRagData(faqArray);
        } else {
          console.error('[Chat] RAG file not found at:', ragPath);
        }
        // Load ONNX model and tokenizer
        const modelDir = await ensureModelReady();
        modelDirRef.current = modelDir;
        const vocabPath = modelDir + '/vocab.json';
        const mergesPath = modelDir + '/merges.txt';
        const modelPath = modelDir + '/model.onnx';
        if (!(await FileSystem.getInfoAsync(modelPath)).exists) {
          throw new Error('Model file not found: ' + modelPath);
        }
        if (!(await FileSystem.getInfoAsync(vocabPath)).exists) {
          throw new Error('vocab.json not found: ' + vocabPath);
        }
        if (!(await FileSystem.getInfoAsync(mergesPath)).exists) {
          throw new Error('merges.txt not found: ' + mergesPath);
        }
        tokenizerRef.current = await getTokenizer(modelDir);
      } catch (e: any) {
        setLoadError(e.message || 'Failed to load model or knowledge base.');
        console.error('[Chat] Error loading model/tokenizer/RAG:', e);
      }
      setLoading(false);
    })();
  }, []);

  const sendMessage = async (text: string = inputText) => {
    if (!text.trim()) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);
    try {
      // 1. Try FAQ match first
      let faqMatched = false;
      let faqFollowup = '';
      let context = '';
      if (ragData) {
        const ragResult = searchFaqRag(ragData, text.trim());
        if (ragResult) {
          faqMatched = true;
          // Add a friendly, relevant follow-up based on the question
          if (text.toLowerCase().includes('mobile') || text.toLowerCase().includes('network')) {
            faqFollowup = '\nLet me know if you need more details about mobile connectivity in Ladakh!';
          } else if (text.toLowerCase().includes('atm')) {
            faqFollowup = '\nRemember to carry cash for remote areas, as ATMs may be limited.';
          } else if (text.toLowerCase().includes('permit')) {
            faqFollowup = '\nIf you need help with the permit process, feel free to ask!';
          } else {
            faqFollowup = '\nLet me know if you need more information!';
          }
          // Directly return the FAQ answer with the follow-up
          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: ragResult.answer + faqFollowup,
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages(prev => [...prev, aiResponse]);
          setLoading(false);
          return;
        }
      }
      // 2. If no FAQ match, search all RAG data (entities/places/etc.) for context
      if (!faqMatched && ragData) {
        // Try to find a relevant entity/place by name or description
        const entity = ragData.find(
          (item: any) =>
            (item.name && text.toLowerCase().includes(item.name.toLowerCase())) ||
            (item.description && text.toLowerCase().includes(item.description.toLowerCase()))
        );
        if (entity) {
          // Use description or name as context
          context = `[CONTEXT]\n${entity.name ? entity.name + ': ' : ''}${entity.description || ''}\nUse the above information to answer the user's question in a helpful, conversational way.\n`;
        }
      }
      // Build the prompt
      let prompt = '';
      if (context) {
        prompt = `${context}User: ${text.trim()}\nAI:`;
      } else {
        const systemPrompt = "You are a helpful travel assistant for Ladakh. Answer concisely and accurately.\n";
        prompt = systemPrompt + `User: ${text.trim()}\nAI:`;
      }
      // ONNX-based generation
      const modelDir = modelDirRef.current;
      const tokenizer = tokenizerRef.current;
      let inputIds = tokenizer.encode(prompt);
      const maxTokens = 40;
      const EOS_TOKEN_ID = 50256;
      for (let i = 0; i < maxTokens; i++) {
        const nextToken = await generateNextToken(`${modelDir}/model.onnx`, inputIds);
        inputIds.push(nextToken);
        if (nextToken === EOS_TOKEN_ID) break;
      }
      // Decode only the generated part (after the prompt)
      let aiText = tokenizer.decode(inputIds.slice(tokenizer.encode(prompt).length));
      // Post-process: trim repeated output
      aiText = aiText.replace(/(.+?)\1+/, '$1'); // crude repeat trimmer
      aiText = aiText.split("\n")[0]; // take only the first line/sentence
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiText,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (e: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: '[Error] Failed to generate response: ' + (e.message || e),
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }
    setLoading(false);
  };

  const handleSuggestion = (suggestion: string) => {
    sendMessage(suggestion);
  };

  if (loading && messages.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        <Text style={{ textAlign: 'center', marginTop: 20 }}>Loading AI model and knowledge base...</Text>
      </SafeAreaView>
    );
  }
  if (loadError) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{loadError}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="AI Travel Assistant" 
        subtitle="Ask me anything about Ladakh"
      />
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message.text}
            isUser={message.isUser}
            timestamp={message.timestamp}
          />
        ))}
      </ScrollView>
      {messages.length === 1 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Quick suggestions:</Text>
          <FlatList
            data={chatSuggestions}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionChip}
                onPress={() => handleSuggestion(item)}
              >
                <Text style={styles.suggestionText}>{item}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask about Ladakh..."
          placeholderTextColor={colors.muted}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity style={styles.micButton}>
          <Mic size={20} color={colors.textLight} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.sendButton, inputText.trim() && styles.sendButtonActive]}
          onPress={() => sendMessage()}
        >
          <Send size={20} color={inputText.trim() ? colors.card : colors.muted} />
        </TouchableOpacity>
      </View>
      {loading && <ActivityIndicator style={{marginTop: 8}} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messagesContainer: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
  suggestionsContainer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  suggestionsTitle: {
    fontSize: sizes.sm,
    fontFamily: fonts.medium,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  suggestionChip: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    marginRight: spacing.sm,
  },
  suggestionText: {
    fontSize: sizes.sm,
    fontFamily: fonts.regular,
    color: colors.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: sizes.md,
    fontFamily: fonts.regular,
    color: colors.text,
    maxHeight: 100,
    minHeight: 40,
  },
  micButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  sendButton: {
    padding: spacing.sm,
    marginLeft: spacing.xs,
  },
  sendButtonActive: {
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
});