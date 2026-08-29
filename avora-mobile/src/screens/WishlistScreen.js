import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet,
  RefreshControl, Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import client from '../api/client';
import { ProductCardSkeleton } from '../components/SkeletonLoader';
import { COLORS, SPACING, SHADOW, FONTS } from '../constants/theme';

const { width } = require('react-native').Dimensions.get('window');
const CARD_W = (width - SPACING.md * 3) / 2;

export default function WishlistScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { cartCount, addToCart } = useCart();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const res = await client.get('/wishlist');
      setWishlist(res.data || []);
    } catch (e) {
      console.warn('Wishlist error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { fetchWishlist(); }, []);

  const removeFromWishlist = async (productId) => {
    try {
      await client.delete(`/wishlist/${productId}`);
      setWishlist((p) => p.filter((w) => w.productId !== productId));
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleMoveToBag = (item) => {
    const product = item.product || item;
    // Call addToCart, assuming standard size selection if needed, or default
    addToCart({
      productId: product.id || item.productId,
      productName: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    });
    // Optionally remove from wishlist after moving
    removeFromWishlist(product.id || item.productId);
  };

  if (!user) {
    return (
      <View style={[styles.root, styles.centered, { paddingTop: insets.top }]}>
        <Ionicons name="heart-outline" size={64} color={COLORS.border} />
        <Text style={styles.emptyTitle}>Sign in to view wishlist</Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('AccountTab')}
        >
          <Text style={styles.primaryBtnText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── Custom Header ── */}
      <View style={styles.headerAlt}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconBtnAlt}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitleAlt}>My Wishlist</Text>
          <Text style={styles.headerSubtitleAlt}>{wishlist.length} Items</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('CartTab')} style={styles.headerIconBtnAlt}>
          <Ionicons name="bag-outline" size={24} color={COLORS.text} />
          {cartCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text></View>}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.grid}>
          {[1, 2, 3, 4].map((k) => <ProductCardSkeleton key={k} />)}
        </View>
      ) : wishlist.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="heart-outline" size={72} color={COLORS.border} />
          <Text style={styles.emptyTitle}>No items in wishlist</Text>
          <Text style={styles.emptySub}>Save products you love to find them later</Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { marginTop: SPACING.md }]}
            onPress={() => navigation.navigate('ShopTab')}
          >
            <Text style={styles.primaryBtnText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wishlist}
          keyExtractor={(item) => String(item.productId || item.id)}
          numColumns={2}
          columnWrapperStyle={styles.columnWrap}
          contentContainerStyle={{ padding: SPACING.md, paddingBottom: SPACING.xl }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchWishlist(); }} colors={[COLORS.accent]} />
          }
          renderItem={({ item }) => {
            const product = item.product || item;
            const uri = product.imageUrl?.startsWith('http')
              ? product.imageUrl
              : `https://avora-clothing.onrender.com${product.imageUrl}`;

            return (
              <TouchableOpacity
                style={styles.cardPro}
                onPress={() => navigation.navigate('ProductDetail', { product })}
                activeOpacity={0.92}
              >
                <View style={styles.imageWrapPro}>
                  <Image source={{ uri }} style={styles.imagePro} resizeMode="cover" />
                  <TouchableOpacity
                    style={styles.removeBtnPro}
                    onPress={() => removeFromWishlist(product.id || item.productId)}
                  >
                    <Ionicons name="close" size={16} color={COLORS.muted} />
                  </TouchableOpacity>
                  
                  {product.originalPrice > product.price && (
                    <View style={styles.discountTag}>
                      <Text style={styles.discountTagText}>
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                      </Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.cardInfoPro}>
                  <Text style={styles.cardBrandPro}>AVORA</Text>
                  <Text style={styles.cardNamePro} numberOfLines={2}>{product.name}</Text>
                  <View style={styles.priceRowPro}>
                    <Text style={styles.cardPricePro}>₹{Number(product.price).toLocaleString()}</Text>
                    {product.originalPrice > product.price && (
                      <Text style={styles.originalPricePro}>
                        ₹{Number(product.originalPrice).toLocaleString()}
                      </Text>
                    )}
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.moveToBagBtn}
                  onPress={() => handleMoveToBag(item)}
                >
                  <Text style={styles.moveToBagText}>MOVE TO BAG</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { justifyContent: 'center', alignItems: 'center', gap: 16 },
  
  // Custom Header
  headerAlt: {
    backgroundColor: COLORS.bg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerIconBtnAlt: { padding: 4, position: 'relative' },
  headerTitleAlt: { color: COLORS.text, fontSize: 20, fontWeight: '800', marginLeft: 12 },
  headerSubtitleAlt: { color: COLORS.muted, fontSize: 13, fontWeight: '600', marginLeft: 8, marginTop: 4 },
  
  badge: {
    position: 'absolute', top: 0, right: 0, backgroundColor: COLORS.accent,
    borderRadius: 99, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  badgeText: { color: COLORS.white, fontSize: 9, fontWeight: '800' },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: SPACING.md, gap: SPACING.md },
  columnWrap: { justifyContent: 'space-between', marginBottom: SPACING.md },
  
  // Professional Card Layout
  cardPro: {
    width: CARD_W,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  imageWrapPro: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  imagePro: { width: '100%', height: '100%' },
  removeBtnPro: {
    position: 'absolute',
    top: 8, right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 26, height: 26,
    borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOW.sm,
  },
  discountTag: {
    position: 'absolute',
    bottom: 8, left: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 4,
  },
  discountTagText: { fontSize: 10, fontWeight: '800', color: COLORS.accent },
  
  cardInfoPro: {
    padding: 10,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  cardBrandPro: { fontSize: 10, fontWeight: '800', color: COLORS.muted, letterSpacing: 1, marginBottom: 2 },
  cardNamePro: { fontSize: 12, fontWeight: '600', color: COLORS.text, lineHeight: 16, height: 32 },
  priceRowPro: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  cardPricePro: { fontSize: 14, fontWeight: '800', color: COLORS.primary },
  originalPricePro: { fontSize: 11, color: COLORS.muted, textDecorationLine: 'line-through' },
  
  moveToBagBtn: {
    borderTopWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moveToBagText: { fontSize: 12, fontWeight: '800', color: COLORS.accent, letterSpacing: 0.5 },
  
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: SPACING.md },
  emptySub: { fontSize: 13, color: COLORS.muted, marginTop: 4, textAlign: 'center' },
  primaryBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 4 },
  primaryBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
});
