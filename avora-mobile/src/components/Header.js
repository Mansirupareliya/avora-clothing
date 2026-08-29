import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../constants/theme';

export default function Header({ title, onBack, rightAction, rightIcon, rightLabel, cartCount }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 4 }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.inner}>
        {/* Left: back or logo */}
        <View style={styles.left}>
          {onBack ? (
            <TouchableOpacity onPress={onBack} style={styles.iconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="arrow-back" size={22} color={COLORS.white} />
            </TouchableOpacity>
          ) : (
            <Text style={styles.logo}>AVORA</Text>
          )}
        </View>

        {/* Center title */}
        {title && !(!onBack) ? (
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
        ) : !onBack ? null : null}

        {/* Right action */}
        <View style={styles.right}>
          {rightAction ? (
            <TouchableOpacity onPress={rightAction} style={styles.iconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              {rightIcon === 'cart' ? (
                <View>
                  <Ionicons name="bag-outline" size={22} color={COLORS.white} />
                  {cartCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
                    </View>
                  )}
                </View>
              ) : rightLabel ? (
                <Text style={styles.rightLabel}>{rightLabel}</Text>
              ) : (
                <Ionicons name={rightIcon || 'ellipsis-vertical'} size={22} color={COLORS.white} />
              )}
            </TouchableOpacity>
          ) : <View style={{ width: 36 }} />}
        </View>
      </View>

      {/* Announcement bar */}
      {!onBack && (
        <View style={styles.announcementBar}>
          <Text style={styles.announcementText} numberOfLines={1}>
            🚚 FREE DELIVERY & 25% DISCOUNT ON ₹2000+ SHOPPING! 🎉
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm + 2,
    minHeight: 52,
  },
  left: {
    minWidth: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 4,
  },
  title: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  right: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  iconBtn: {
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -6,
    backgroundColor: COLORS.accent,
    borderRadius: 999,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '800',
  },
  announcementBar: {
    backgroundColor: COLORS.accent,
    paddingVertical: 5,
    paddingHorizontal: SPACING.md,
    overflow: 'hidden',
  },
  announcementText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  rightLabel: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '700',
  },
});
