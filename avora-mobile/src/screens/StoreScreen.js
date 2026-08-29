import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, RefreshControl, Dimensions, Image, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import client from '../api/client';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/SkeletonLoader';
import SpecialOffersModal from '../components/SpecialOffersModal';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { COLORS, SPACING, SHADOW, FONTS } from '../constants/theme';

const { width } = Dimensions.get('window');

const CATEGORIES = ['All', 'Shirts', 'T-Shirts', 'Formal', 'Casual', 'Ethnic', 'Bottoms'];
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Name A-Z', value: 'name_asc' },
];

export default function StoreScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { cartCount } = useCart();

  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [showSort, setShowSort] = useState(false);
  const [heroCurrent, setHeroCurrent] = useState(0);

  const heroScrollRef = useRef(null);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await client.get('/products');
      setProducts(res.data || []);
    } catch (e) {
      console.warn('Products error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchWishlist = useCallback(async () => {
    if (!user) return;
    try {
      const res = await client.get('/wishlist');
      setWishlist((res.data || []).map((w) => w.productId));
    } catch (_) {}
  }, [user]);

  useEffect(() => {
    fetchProducts();
    fetchWishlist();
  }, []);

  // Hero auto-scroll
  useEffect(() => {
    const heroProducts = products.slice(0, 5);
    if (heroProducts.length < 2) return;
    const interval = setInterval(() => {
      setHeroCurrent((prev) => {
        const next = (prev + 1) % heroProducts.length;
        heroScrollRef.current?.scrollTo({ x: next * width, animated: true });
        return next;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [products]);

  const toggleWishlist = async (product) => {
    if (!user) { navigation.navigate('AccountTab'); return; }
    const isWished = wishlist.includes(product.id);
    try {
      if (isWished) {
        await client.delete(`/wishlist/${product.id}`);
        setWishlist((p) => p.filter((id) => id !== product.id));
      } else {
        await client.post('/wishlist', { 
          productId: product.id,
          productName: product.name,
          price: product.price,
          imageUrl: product.imageUrl || (product.images && product.images[0]) || '',
          category: product.category || 'misc'
        });
        setWishlist((p) => [...p, product.id]);
      }
    } catch (_) {}
  };

  // Filter & sort
  const filtered = products
    .filter((p) => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q);
      const matchCat = selectedCategory === 'All' || p.category?.toLowerCase() === selectedCategory.toLowerCase();
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      return 0; // newest: keep API order
    });

  const heroProducts = products.slice(0, 5);

  const renderSkeleton = () => (
    <View style={styles.grid}>
      {[1, 2, 3, 4].map((k) => <ProductCardSkeleton key={k} />)}
    </View>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.columnWrap}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchProducts(); fetchWishlist(); }}
            colors={[COLORS.accent]}
            tintColor={COLORS.accent}
          />
        }
        ListHeaderComponent={
          <>
            {/* ── Custom Header ── */}
            <View style={styles.header}>
              <Text style={styles.logo}>AVORA</Text>
              <View style={styles.headerRight}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('CartTab')}
                  style={styles.headerIconBtn}
                >
                  <Ionicons name="bag-outline" size={22} color={COLORS.primary} />
                  {cartCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate('AccountTab')}
                  style={styles.headerIconBtn}
                >
                  <Ionicons name="person-outline" size={22} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Announcement bar */}
            <View style={styles.announcement}>
              <Text style={styles.announcementText} numberOfLines={1}>
                🚚 FREE DELIVERY & 25% DISCOUNT ON ₹2000+ SHOPPING! 🎉
              </Text>
            </View>

            {/* ── Hero Slider ── */}
            {heroProducts.length > 0 && (
              <View style={styles.heroWrap}>
                <ScrollView
                  ref={heroScrollRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  scrollEventThrottle={16}
                  onScroll={(e) =>
                    setHeroCurrent(Math.round(e.nativeEvent.contentOffset.x / width))
                  }
                >
                  {heroProducts.map((p) => {
                    const uri = p.imageUrl?.startsWith('http')
                      ? p.imageUrl
                      : `https://avora-clothing.onrender.com${p.imageUrl}`;
                    return (
                      <TouchableOpacity
                        key={p.id}
                        activeOpacity={0.95}
                        onPress={() => navigation.navigate('ProductDetail', { product: p })}
                      >
                        <Image source={{ uri }} style={styles.heroImage} resizeMode="cover" />
                        <LinearGradient
                          colors={['transparent', 'rgba(33,45,67,0.85)']}
                          style={styles.heroGradient}
                        />
                        <View style={styles.heroContent}>
                          <Text style={styles.heroCategory}>
                            {(p.category || 'NEW ARRIVAL').toUpperCase()}
                          </Text>
                          <Text style={styles.heroName} numberOfLines={2}>{p.name}</Text>
                          <Text style={styles.heroPrice}>₹{Number(p.price).toLocaleString()}</Text>
                          <View style={styles.heroCta}>
                            <Text style={styles.heroCtaText}>Shop Now →</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Dots */}
                <View style={styles.heroDots}>
                  {heroProducts.map((_, i) => (
                    <View
                      key={i}
                      style={[styles.dot, i === heroCurrent && styles.dotActive]}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* ── Search Bar ── */}
            <View style={styles.searchWrap}>
              <Ionicons name="search-outline" size={16} color={COLORS.muted} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search shirts, category…"
                placeholderTextColor={COLORS.muted}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={18} color={COLORS.muted} />
                </TouchableOpacity>
              )}
            </View>

            {/* ── Category Tabs ── */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.catScroll}
            >
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catTab, selectedCategory === cat && styles.catTabActive]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.catTabText, selectedCategory === cat && styles.catTabTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* ── Sort + Count Bar ── */}
            <View style={styles.sortBar}>
              <Text style={styles.resultCount}>
                {filtered.length} product{filtered.length !== 1 ? 's' : ''}
              </Text>
              <TouchableOpacity
                style={styles.sortBtn}
                onPress={() => setShowSort(!showSort)}
              >
                <Ionicons name="funnel-outline" size={14} color={COLORS.primary} />
                <Text style={styles.sortBtnText}>
                  {SORT_OPTIONS.find((s) => s.value === sortBy)?.label}
                </Text>
                <Ionicons
                  name={showSort ? 'chevron-up' : 'chevron-down'}
                  size={12}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>

            {/* Sort dropdown */}
            {showSort && (
              <View style={styles.sortDropdown}>
                {SORT_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.sortOption, sortBy === opt.value && styles.sortOptionActive]}
                    onPress={() => { setSortBy(opt.value); setShowSort(false); }}
                  >
                    <Text style={[styles.sortOptionText, sortBy === opt.value && { color: COLORS.accent, fontWeight: '700' }]}>
                      {opt.label}
                    </Text>
                    {sortBy === opt.value && (
                      <Ionicons name="checkmark" size={14} color={COLORS.accent} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Loading skeletons */}
            {loading && renderSkeleton()}
          </>
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={(p) => navigation.navigate('ProductDetail', { product: p })}
            onWishlist={toggleWishlist}
            isWishlisted={wishlist.includes(item.id)}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="shirt-outline" size={48} color={COLORS.border} />
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySubText}>Try adjusting your search or filters</Text>
            </View>
          ) : null
        }
      />
      <SpecialOffersModal />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
  },
  logo: { color: COLORS.primary, fontSize: 26, fontFamily: FONTS.logo, letterSpacing: 5 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  headerIconBtn: { padding: 6, position: 'relative' },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.accent,
    borderRadius: 99,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: COLORS.white, fontSize: 9, fontWeight: '800' },
  announcement: {
    backgroundColor: COLORS.accent,
    paddingVertical: 5,
    paddingHorizontal: SPACING.md,
  },
  announcementText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  listContent: { paddingBottom: SPACING.xl },
  columnWrap: {
    paddingHorizontal: SPACING.md,
    justifyContent: 'space-between',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    justifyContent: 'space-between',
  },
  // Hero
  heroWrap: { width, marginBottom: SPACING.md },
  heroImage: { width, height: 280 },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  heroCategory: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4,
  },
  heroName: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  heroPrice: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  heroCta: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignSelf: 'flex-start',
  },
  heroCtaText: { color: COLORS.white, fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  heroDots: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    flexDirection: 'row',
    gap: 4,
  },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: COLORS.white, width: 14 },
  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    ...SHADOW.sm,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, padding: 11, fontSize: 14, color: COLORS.text },
  // Category
  catScroll: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm, gap: 8 },
  catTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  catTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catTabText: { fontSize: 12, fontWeight: '600', color: COLORS.muted },
  catTabTextActive: { color: COLORS.white },
  // Sort bar
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  resultCount: { fontSize: 12, color: COLORS.muted, fontWeight: '600' },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLORS.surface,
  },
  sortBtnText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  sortDropdown: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.md,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  sortOptionActive: { backgroundColor: 'rgba(200,111,73,0.05)' },
  sortOptionText: { fontSize: 13, color: COLORS.text },
  // Empty
  empty: { alignItems: 'center', padding: SPACING.xl, marginTop: SPACING.xl },
  emptyText: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginTop: 12 },
  emptySubText: { fontSize: 13, color: COLORS.muted, marginTop: 4 },
});
