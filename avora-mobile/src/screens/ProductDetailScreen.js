import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity, StyleSheet,
  Dimensions, ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import client from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, SHADOW } from '../constants/theme';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = width * 1.3; 

export default function ProductDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { product: initialProduct } = route.params;
  const [product, setProduct] = useState(initialProduct);
  const [reviews, setReviews] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeAccordion, setActiveAccordion] = useState('materials');

  const { addToCart, cartCount } = useCart();
  const { user } = useAuth();

  const images = product.images?.length ? product.images : product.imageUrl ? [product.imageUrl] : [];
  const getUri = (url) => url?.startsWith('http') ? url : `https://avora-clothing.onrender.com${url}`;

  const fetchDetails = useCallback(async () => {
    try {
      const res = await client.get(`/products/${product.id}`);
      setProduct(res.data);
    } catch (_) {}
  }, [product.id]);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await client.get(`/products/${product.id}/reviews`);
      setReviews(res.data || []);
    } catch (_) {}
  }, [product.id]);

  const checkWishlist = useCallback(async () => {
    if (!user) return;
    try {
      const res = await client.get('/wishlist');
      const ids = (res.data || []).map((w) => w.productId);
      setIsWishlisted(ids.includes(product.id));
    } catch (_) {}
  }, [user, product.id]);

  const fetchRelated = useCallback(async () => {
    try {
      const res = await client.get('/products');
      const all = res.data || [];
      setRelatedProducts(all.filter(p => p.id !== product.id).slice(0, 5));
    } catch (_) {}
  }, [product.id]);

  useEffect(() => {
    fetchDetails();
    fetchReviews();
    checkWishlist();
    fetchRelated();
  }, [product.id]);

  const toggleWishlist = async () => {
    if (!user) { navigation.navigate('AccountTab'); return; }
    try {
      if (isWishlisted) {
        await client.delete(`/wishlist/${product.id}`);
        setIsWishlisted(false);
      } else {
        await client.post('/wishlist', { 
          productId: product.id,
          productName: product.name,
          price: product.price,
          imageUrl: product.imageUrl || (product.images && product.images[0]) || '',
          category: product.category || 'misc'
        });
        setIsWishlisted(true);
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleAddToCart = async () => {
    if (!user) { navigation.navigate('AccountTab'); return; }
    if (product.sizes?.length > 0 && !selectedSize) {
      Alert.alert('Select Size', 'Please select a size before adding to cart.');
      return;
    }
    if (product.colors?.length > 0 && !selectedColor) {
      Alert.alert('Select Color', 'Please select a color before adding to cart.');
      return;
    }
    setAdding(true);
    try {
      await addToCart(product, quantity, selectedSize, selectedColor);
      Alert.alert('Added to Cart', `${product.name} added successfully!`, [
        { text: 'Continue Shopping' },
        { text: 'View Cart', onPress: () => navigation.navigate('CartTab') },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) { navigation.navigate('AccountTab'); return; }
    if (product.sizes?.length > 0 && !selectedSize) {
      Alert.alert('Select Size', 'Please select a size before proceeding.');
      return;
    }
    if (product.colors?.length > 0 && !selectedColor) {
      Alert.alert('Select Color', 'Please select a color before proceeding.');
      return;
    }
    setAdding(true);
    try {
      await addToCart(product, quantity, selectedSize, selectedColor);
      navigation.navigate('CartTab');
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to process');
    } finally {
      setAdding(false);
    }
  };

  const avgRating = reviews.length ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length : 0;
  
  const discountPercentage = product.discount || 
    (product.mrp && product.mrp > product.price 
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
      : 0);

  return (
    <View style={styles.root}>
      {/* ── Custom Header ── */}
      <View style={[styles.headerAlt, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconBtnAlt}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitleAlt} numberOfLines={1}>{product.brand || 'AVORA'}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={toggleWishlist} style={styles.headerIconBtnAlt}>
            <Ionicons name={isWishlisted ? 'heart' : 'heart-outline'} size={24} color={isWishlisted ? COLORS.accent : COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('CartTab')} style={styles.headerIconBtnAlt}>
            <Ionicons name="bag-outline" size={24} color={COLORS.text} />
            {cartCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text></View>}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Images */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => setActiveImageIdx(Math.round(e.nativeEvent.contentOffset.x / width))}
            scrollEventThrottle={16}
          >
            {images.length ? images.map((img, i) => (
              <Image key={i} source={{ uri: getUri(img) }} style={styles.mainImage} resizeMode="cover" />
            )) : (
              <View style={[styles.mainImage, styles.noImage]}>
                <Ionicons name="image-outline" size={60} color={COLORS.border} />
              </View>
            )}
          </ScrollView>
          {images.length > 1 && (
            <View style={styles.dots}>
              {images.map((_, i) => (
                <View key={i} style={[styles.dot, i === activeImageIdx && styles.dotActive]} />
              ))}
            </View>
          )}
        </View>

        <View style={styles.body}>
          {/* Brand & Name */}
          <Text style={styles.brandName}>{product.brand || 'AVORA PREMIUM'}</Text>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productCategory}>{product.category}</Text>

          {/* Pricing Block */}
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>₹{Number(product.price).toLocaleString()}</Text>
            {product.mrp && product.mrp > product.price && (
              <>
                <Text style={styles.mrpText}>MRP ₹{Number(product.mrp).toLocaleString()}</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{discountPercentage}% OFF</Text>
                </View>
              </>
            )}
          </View>
          <Text style={styles.taxInclusive}>inclusive of all taxes</Text>

          {/* Color Selector */}
          {product.colors?.length > 0 && (
            <View style={styles.colorSection}>
              <View style={styles.sizeHeader}>
                <Text style={styles.sectionTitle}>SELECT COLOR</Text>
              </View>
              <View style={styles.colorGrid}>
                {product.colors.map((color) => {
                  const isActive = selectedColor === color;
                  return (
                    <TouchableOpacity
                      key={color}
                      style={[styles.colorBtnWrap, isActive && styles.colorBtnWrapActive]}
                      onPress={() => setSelectedColor(color)}
                    >
                      <View style={[styles.colorBtn, { backgroundColor: color }]} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Size Selector */}
          {product.sizes?.length > 0 && (
            <View style={styles.sizeSection}>
              <View style={styles.sizeHeader}>
                <Text style={styles.sectionTitle}>SELECT SIZE</Text>
                <Text style={styles.sizeGuideText}>Size Guide</Text>
              </View>
              <View style={styles.sizeGrid}>
                {product.sizes.map((size) => {
                  const isActive = selectedSize === size;
                  return (
                    <TouchableOpacity
                      key={size}
                      style={[styles.sizeBtn, isActive && styles.sizeBtnActive]}
                      onPress={() => setSelectedSize(size)}
                    >
                      <Text style={[styles.sizeBtnText, isActive && styles.sizeBtnTextActive]}>
                        {size}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Quantity Selector */}
          <View style={styles.qtySection}>
            <Text style={styles.sectionTitle}>QUANTITY</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyControl} onPress={() => setQuantity((q) => Math.max(1, q - 1))}>
                <Ionicons name="remove" size={20} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.qtyNum}>{quantity}</Text>
              <TouchableOpacity style={styles.qtyControl} onPress={() => setQuantity((q) => Math.min(10, q + 1))}>
                <Ionicons name="add" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Accordion Sections */}
          <View style={styles.accordionContainer}>
            {product.materialsAndFits ? (
              <View style={styles.accordionItem}>
                <TouchableOpacity 
                  style={styles.accordionHeader} 
                  onPress={() => setActiveAccordion(activeAccordion === 'materials' ? null : 'materials')}
                >
                  <Text style={styles.accordionTitle}>MATERIALS & FITS</Text>
                  <Ionicons name={activeAccordion === 'materials' ? 'remove' : 'add'} size={20} color={COLORS.text} />
                </TouchableOpacity>
                {activeAccordion === 'materials' && (
                  <View style={styles.accordionContent}>
                    <Text style={styles.accordionText}>{product.materialsAndFits}</Text>
                  </View>
                )}
              </View>
            ) : null}

            {product.fabricCare ? (
              <View style={styles.accordionItem}>
                <TouchableOpacity 
                  style={styles.accordionHeader} 
                  onPress={() => setActiveAccordion(activeAccordion === 'fabric' ? null : 'fabric')}
                >
                  <Text style={styles.accordionTitle}>FABRIC CARE</Text>
                  <Ionicons name={activeAccordion === 'fabric' ? 'remove' : 'add'} size={20} color={COLORS.text} />
                </TouchableOpacity>
                {activeAccordion === 'fabric' && (
                  <View style={styles.accordionContent}>
                    <Text style={styles.accordionText}>{product.fabricCare}</Text>
                  </View>
                )}
              </View>
            ) : null}

            {product.deliveryAndReturns ? (
              <View style={styles.accordionItem}>
                <TouchableOpacity 
                  style={styles.accordionHeader} 
                  onPress={() => setActiveAccordion(activeAccordion === 'delivery' ? null : 'delivery')}
                >
                  <Text style={styles.accordionTitle}>DELIVERY & RETURNS</Text>
                  <Ionicons name={activeAccordion === 'delivery' ? 'remove' : 'add'} size={20} color={COLORS.text} />
                </TouchableOpacity>
                {activeAccordion === 'delivery' && (
                  <View style={styles.accordionContent}>
                    <Text style={styles.accordionText}>{product.deliveryAndReturns}</Text>
                  </View>
                )}
              </View>
            ) : null}

            {(product.details || product.description) ? (
              <View style={styles.accordionItem}>
                <TouchableOpacity 
                  style={styles.accordionHeader} 
                  onPress={() => setActiveAccordion(activeAccordion === 'details' ? null : 'details')}
                >
                  <Text style={styles.accordionTitle}>DETAILS</Text>
                  <Ionicons name={activeAccordion === 'details' ? 'remove' : 'add'} size={20} color={COLORS.text} />
                </TouchableOpacity>
                {activeAccordion === 'details' && (
                  <View style={styles.accordionContent}>
                    <Text style={styles.accordionText}>{product.details || product.description}</Text>
                  </View>
                )}
              </View>
            ) : null}
          </View>

          {/* Ratings & Reviews */}
          {reviews.length > 0 && (
            <View style={styles.reviewSection}>
              <Text style={styles.sectionTitle}>CUSTOMER REVIEWS ({reviews.length})</Text>
              <View style={styles.avgRatingBox}>
                <Text style={styles.avgRatingNum}>{avgRating.toFixed(1)}</Text>
                <Ionicons name="star" size={20} color="#f59e0b" style={{ marginLeft: 4 }} />
              </View>
              
              {reviews.slice(0, 3).map((r) => (
                <View key={r.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewAuthor}>{r.userName || 'Customer'}</Text>
                    <View style={styles.reviewStars}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons key={s} name={s <= r.rating ? 'star' : 'star-outline'} size={12} color="#f59e0b" />
                      ))}
                    </View>
                  </View>
                  {r.comment && <Text style={styles.reviewComment}>{r.comment}</Text>}
                </View>
              ))}
            </View>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={styles.sectionTitle}>MORE LIKE THIS</Text>
              <View style={styles.relatedGrid}>
                {relatedProducts.map(rp => (
                  <TouchableOpacity 
                    key={rp.id} 
                    style={styles.relatedCard}
                    onPress={() => navigation.push('ProductDetail', { product: rp })}
                  >
                    <Image source={{ uri: getUri(rp.imageUrl) }} style={styles.relatedImage} resizeMode="cover" />
                    <Text style={styles.relatedName} numberOfLines={2}>{rp.name}</Text>
                    <View style={{ paddingHorizontal: 8, paddingBottom: 8 }}>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: COLORS.primary }}>₹{Number(rp.price).toLocaleString()}</Text>
                      {rp.mrp && rp.mrp > rp.price && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                          <Text style={{ fontSize: 11, color: COLORS.muted, textDecorationLine: 'line-through' }}>
                            MRP ₹{Number(rp.mrp).toLocaleString()}
                          </Text>
                          <Text style={{ fontSize: 10, fontWeight: '700', color: '#16a34a' }}>
                            {rp.discount || Math.round(((rp.mrp - rp.price) / rp.mrp) * 100)}% OFF
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={[styles.stickyBottomBar, { paddingBottom: insets.bottom || SPACING.md }]}>
        <TouchableOpacity style={styles.addToBagBtn} onPress={handleAddToCart} disabled={adding}>
          {adding ? <ActivityIndicator color={COLORS.text} /> : (
            <>
              <Ionicons name="bag-outline" size={20} color={COLORS.text} style={{ marginRight: 8 }} />
              <Text style={styles.addToBagText}>ADD TO BAG</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyNowBtn} onPress={handleBuyNow} disabled={adding}>
          {adding ? <ActivityIndicator color={COLORS.white} /> : (
            <Text style={styles.buyNowText}>BUY NOW</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  
  // Custom Header
  headerAlt: {
    backgroundColor: COLORS.bg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', width: 60 },
  headerRight: { flexDirection: 'row', alignItems: 'center', width: 60, justifyContent: 'flex-end', gap: 12 },
  headerIconBtnAlt: { padding: 4, position: 'relative' },
  headerTitleAlt: { color: COLORS.text, fontSize: 16, fontWeight: '800', flex: 1, textAlign: 'center', letterSpacing: 1 },
  badge: {
    position: 'absolute', top: 0, right: 0, backgroundColor: COLORS.accent,
    borderRadius: 99, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  badgeText: { color: COLORS.white, fontSize: 9, fontWeight: '800' },
  
  // Images
  imageContainer: { position: 'relative', width, height: IMAGE_HEIGHT },
  mainImage: { width, height: IMAGE_HEIGHT },
  noImage: { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  dots: { position: 'absolute', bottom: 16, width: '100%', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: COLORS.white, width: 24 },
  
  // Body Info
  body: { padding: SPACING.lg },
  brandName: { fontSize: 13, fontWeight: '800', color: COLORS.muted, letterSpacing: 0.5, marginBottom: 2 },
  productName: { fontSize: 16, fontWeight: '700', color: COLORS.text, lineHeight: 22 },
  productCategory: { fontSize: 13, color: COLORS.muted, marginTop: 4, textTransform: 'capitalize' },
  
  // Pricing
  priceContainer: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 16 },
  currentPrice: { fontSize: 20, fontWeight: '900', color: COLORS.text },
  mrpText: { fontSize: 15, color: COLORS.muted, textDecorationLine: 'line-through', marginBottom: 2 },
  discountBadge: { backgroundColor: '#fbe9e7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginBottom: 2 },
  discountText: { color: COLORS.accent, fontSize: 12, fontWeight: '800' },
  taxInclusive: { fontSize: 12, color: '#03a685', fontWeight: '600', marginTop: 6 },
  
  // Sections
  colorSection: { marginTop: 16 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorBtnWrap: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  colorBtnWrapActive: { borderColor: COLORS.primary },
  colorBtn: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: COLORS.border },

  sizeSection: { marginTop: 16 },
  sizeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text, letterSpacing: 1 },
  sizeGuideText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  sizeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sizeBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface
  },
  sizeBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  sizeBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  sizeBtnTextActive: { color: COLORS.white },
  
  qtySection: { marginTop: 16 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, alignSelf: 'flex-start' },
  qtyControl: { padding: 8, paddingHorizontal: 12 },
  qtyNum: { fontSize: 14, fontWeight: '800', paddingHorizontal: 16, color: COLORS.text },
  
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },
  
  // Accordion
  accordionContainer: { marginTop: 8, marginBottom: 16 },
  accordionItem: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  accordionTitle: { fontSize: 13, fontWeight: '800', color: COLORS.text, letterSpacing: 1 },
  accordionContent: { paddingBottom: 16 },
  accordionText: { fontSize: 13, color: COLORS.muted, lineHeight: 22 },
  
  // Reviews
  reviewSection: { marginTop: 16 },
  avgRatingBox: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 16 },
  avgRatingNum: { fontSize: 32, fontWeight: '800', color: COLORS.text },
  reviewCard: { padding: 16, backgroundColor: COLORS.surface, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  reviewAuthor: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  reviewStars: { flexDirection: 'row', gap: 2 },
  reviewComment: { fontSize: 13, color: COLORS.muted, lineHeight: 18 },
  
  // Sticky Bottom Bar
  stickyBottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.bg, borderTopWidth: 1, borderColor: COLORS.border,
    flexDirection: 'row', padding: SPACING.md, gap: 12,
    ...SHADOW.md
  },
  addToBagBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface,
    paddingVertical: 14, borderRadius: 4,
  },
  addToBagText: { fontSize: 14, fontWeight: '800', color: COLORS.text, letterSpacing: 0.5 },
  buyNowBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14, borderRadius: 4,
  },
  buyNowText: { fontSize: 14, fontWeight: '800', color: COLORS.white, letterSpacing: 0.5 },
  
  // Related
  relatedSection: { marginTop: 24, paddingBottom: 24 },
  relatedGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 12, rowGap: 16 },
  relatedCard: { width: '48%', backgroundColor: COLORS.surface, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  relatedImage: { width: '100%', aspectRatio: 3/4, backgroundColor: '#f0f0f0' },
  relatedName: { fontSize: 12, fontWeight: '600', color: COLORS.text, paddingHorizontal: 8, paddingTop: 8, paddingBottom: 4, lineHeight: 16 },
});
