import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

function SkeletonBox({ width, height, style }) {
  const opacity = React.useRef(new Animated.Value(0.4)).current;

  React.useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: COLORS.border,
          borderRadius: RADIUS.sm,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function ProductCardSkeleton() {
  const cardWidth = 170;
  return (
    <View style={[skStyles.card, { width: cardWidth }]}>
      <SkeletonBox width="100%" height={cardWidth * 1.3} />
      <View style={skStyles.info}>
        <SkeletonBox width="80%" height={12} style={{ marginBottom: 6 }} />
        <SkeletonBox width="50%" height={12} style={{ marginBottom: 4 }} />
        <SkeletonBox width="60%" height={10} />
      </View>
    </View>
  );
}

export function CartItemSkeleton() {
  return (
    <View style={skStyles.cartItem}>
      <SkeletonBox width={80} height={80} />
      <View style={{ flex: 1, gap: 6, marginLeft: SPACING.sm }}>
        <SkeletonBox width="70%" height={12} />
        <SkeletonBox width="40%" height={12} />
        <SkeletonBox width="50%" height={14} />
      </View>
    </View>
  );
}

export function OrderSkeleton() {
  return (
    <View style={skStyles.order}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <SkeletonBox width="40%" height={13} />
        <SkeletonBox width="25%" height={13} />
      </View>
      <SkeletonBox width="60%" height={12} style={{ marginBottom: 4 }} />
      <SkeletonBox width="35%" height={12} />
    </View>
  );
}

const skStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  info: {
    padding: SPACING.sm,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  order: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});

export default SkeletonBox;
