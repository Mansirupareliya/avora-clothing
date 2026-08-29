import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOW, RADIUS } from '../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.md * 3) / 2;

export default function ProductCard({ product, onPress, onWishlist, isWishlisted }) {
  const imageUri = product.imageUrl?.startsWith('http')
    ? product.imageUrl
    : `https://avora-clothing.onrender.com${product.imageUrl}`;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(product)}
      activeOpacity={0.92}
    >
      {/* Image */}
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
        />
        {/* Wishlist button */}
        <TouchableOpacity
          style={styles.heartBtn}
          onPress={() => onWishlist?.(product)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isWishlisted ? 'heart' : 'heart-outline'}
            size={18}
            color={isWishlisted ? COLORS.accent : COLORS.white}
          />
        </TouchableOpacity>

        {/* Category chip */}
        {product.category ? (
          <View style={styles.chip}>
            <Text style={styles.chipText}>{product.category}</Text>
          </View>
        ) : null}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.price}>₹{Number(product.price).toLocaleString()}</Text>
        {product.mrp && product.mrp > product.price && (
          <View style={styles.mrpRow}>
            <Text style={styles.originalPrice}>
              MRP ₹{Number(product.mrp).toLocaleString()}
            </Text>
            <Text style={styles.discountTextCard}>
              {product.discount || Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
            </Text>
          </View>
        )}
        {product.sizes?.length > 0 && (
          <Text style={styles.sizes}>
            {product.sizes.slice(0, 4).join(' · ')}
            {product.sizes.length > 4 ? ' +more' : ''}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  imageWrap: {
    width: '100%',
    height: CARD_WIDTH * 1.3,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  heartBtn: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  chipText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  info: {
    padding: SPACING.sm,
    paddingTop: 10,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 18,
    marginBottom: 6,
  },
  mrpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.accent,
  },
  originalPrice: {
    fontSize: 11,
    color: COLORS.muted,
    textDecorationLine: 'line-through',
  },
  discountTextCard: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16a34a',
  },
  sizes: {
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 6,
    letterSpacing: 0.3,
  },
});
