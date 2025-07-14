import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, sizes, spacing, borderRadius } from '@/constants/theme';

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

export default function ChatBubble({ message, isUser, timestamp }: ChatBubbleProps) {
  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.message, isUser ? styles.userMessage : styles.aiMessage]}>
          {message}
        </Text>
        {timestamp && (
          <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.aiTimestamp]}>
            {timestamp}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  aiContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: spacing.xs,
  },
  aiBubble: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  message: {
    fontSize: sizes.md,
    fontFamily: fonts.regular,
    lineHeight: sizes.md * 1.4,
  },
  userMessage: {
    color: colors.text,
  },
  aiMessage: {
    color: colors.text,
  },
  timestamp: {
    fontSize: sizes.xs,
    fontFamily: fonts.regular,
    marginTop: spacing.xs,
  },
  userTimestamp: {
    color: colors.text + '80',
  },
  aiTimestamp: {
    color: colors.textLight,
  },
});