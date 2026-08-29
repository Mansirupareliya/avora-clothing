import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

const STATUS_META = {
  pending:   { bg: '#fff8e1', color: '#f59e0b' },
  confirmed: { bg: '#e8f5e9', color: '#22c55e' },
  shipped:   { bg: '#e3f2fd', color: '#3b82f6' },
  delivered: { bg: '#e8f5e9', color: '#16a34a' },
  cancelled: { bg: '#fce4ec', color: '#ef4444' },
  approved:  { bg: '#e8f5e9', color: '#16a34a' },
  rejected:  { bg: '#fce4ec', color: '#ef4444' },
  completed: { bg: '#e8f5e9', color: '#16a34a' },
};

export default function StatusBadge({ status }) {
  const meta = STATUS_META[String(status).toLowerCase()] || { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <View style={[styles.badge, { backgroundColor: meta.bg, borderColor: meta.color + '40' }]}>
      <Text style={[styles.text, { color: meta.color }]}>
        {String(status).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderRadius: 0,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
