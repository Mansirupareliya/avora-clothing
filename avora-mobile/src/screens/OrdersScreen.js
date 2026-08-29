import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, Image, TextInput, ScrollView, Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { OrderSkeleton } from '../components/SkeletonLoader';
import { COLORS, SPACING, SHADOW, FONTS } from '../constants/theme';

const FILTER_TABS = ['All', 'Pending', 'Confirmed', 'Packed', 'Dispatched', 'Delivered', 'Cancelled'];

export default function OrdersScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchOrders = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const res = await client.get('/orders');
      setOrders(res.data || []);
    } catch (e) {
      console.warn('Orders error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { fetchOrders(); }, []);

  if (!user) {
    return (
      <View style={[styles.root, styles.centered, { paddingTop: insets.top }]}>
        <Ionicons name="bag-outline" size={64} color={COLORS.border} />
        <Text style={styles.emptyTitle}>Sign in to view orders</Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('AccountTab')}
        >
          <Text style={styles.primaryBtnText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const uniqueStatuses = [...new Set(orders.map(o => String(o.status).toLowerCase()))];
  const dynamicFilterTabs = ['All', ...uniqueStatuses.map(s => s.charAt(0).toUpperCase() + s.slice(1))];

  const filteredOrders = orders.filter(o => {
    const matchesSearch = String(o.id).toLowerCase().includes(searchQuery.toLowerCase()) || 
      o.items?.some(i => i.productName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || String(o.status).toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const renderOrder = ({ item: order }) => {
    const isExpanded = expandedId === order.id;
    const itemCount = order.items?.length || 0;
    const firstImage = order.items?.[0]?.imageUrl;
    const imageUri = firstImage?.startsWith('http')
      ? firstImage
      : firstImage
      ? `https://avora-clothing.onrender.com${firstImage}`
      : null;

    return (
      <TouchableOpacity
        style={styles.orderCardPro}
        onPress={() => setExpandedId(isExpanded ? null : order.id)}
        activeOpacity={0.9}
      >
        {/* Top bar */}
        <View style={styles.cardTopRow}>
          <Text style={styles.orderIdText}>Order #{String(order.id).slice(0, 8).toUpperCase()}</Text>
          <StatusBadge status={order.status} />
        </View>

        {/* Main Content */}
        <View style={styles.cardBody}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.proOrderThumb} resizeMode="cover" />
          ) : (
            <View style={styles.proOrderThumbPlaceholder}>
              <Ionicons name="image-outline" size={24} color={COLORS.muted}/>
            </View>
          )}
          <View style={styles.cardInfoWrap}>
            <Text style={styles.cardItemName} numberOfLines={2}>
              {order.items?.[0]?.productName || 'Multiple Items'}
            </Text>
            {itemCount > 1 && (
              <Text style={styles.moreItemsText}>+ {itemCount - 1} more item{itemCount - 1 > 1 ? 's' : ''}</Text>
            )}
            <Text style={styles.cardOrderDate}>
              Ordered: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* Bottom bar */}
        <View style={styles.cardBottomRow}>
          <Text style={styles.cardTotalLabel}>Total Amount</Text>
          <Text style={styles.cardTotalValue}>₹{Number(order.totalAmount || 0).toLocaleString()}</Text>
        </View>

        {/* Expanded Details */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.divider} />
            <Text style={styles.expandedSectionTitle}>Items ({itemCount})</Text>
            {order.items?.map((item, idx) => {
              const imgUri = item.imageUrl?.startsWith('http') 
                ? item.imageUrl 
                : item.imageUrl ? `https://avora-clothing.onrender.com${item.imageUrl}` : null;
              return (
                <View key={idx} style={styles.expandedItemRow}>
                  {imgUri ? (
                    <Image source={{ uri: imgUri }} style={styles.expandedItemImg} resizeMode="cover" />
                  ) : (
                    <View style={styles.expandedItemImgPlaceholder} />
                  )}
                  <View style={styles.expandedItemInfo}>
                    <Text style={styles.expandedItemName} numberOfLines={2}>{item.productName}</Text>
                    {item.size && <Text style={styles.expandedItemMeta}>Size: {item.size}</Text>}
                    <Text style={styles.expandedItemMeta}>Qty: {item.quantity}</Text>
                  </View>
                  <Text style={styles.expandedItemPrice}>₹{(item.price * item.quantity).toLocaleString()}</Text>
                </View>
              );
            })}
            
            {order.shippingAddress && (
              <View style={styles.addressBox}>
                <Ionicons name="location" size={16} color={COLORS.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.addressName}>{order.shippingAddress.fullName}</Text>
                  <Text style={styles.addressText}>
                    {order.shippingAddress.addressLine1}, {order.shippingAddress.city} - {order.shippingAddress.pincode}
                  </Text>
                </View>
              </View>
            )}
            
            {['dispatched', 'confirmed', 'packed'].includes(String(order.status).toLowerCase()) && (
              <TouchableOpacity style={styles.trackBtn}>
                <Text style={styles.trackBtnText}>Track Order</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── Custom Header ── */}
      <View style={styles.headerAlt}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconBtnAlt}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitleAlt}>My Orders</Text>
        </View>
        <TouchableOpacity style={styles.headerIconBtnAlt}>
          <Ionicons name="help-circle-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Search & Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={COLORS.muted} style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search by Order ID or Product"
            placeholderTextColor={COLORS.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.muted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterModalVisible(true)}>
          <Ionicons name="options" size={20} color={COLORS.text} />
          <Text style={styles.filterBtnText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ padding: SPACING.md, gap: SPACING.sm }}>
          {[1, 2, 3].map((k) => <OrderSkeleton key={k} />)}
        </View>
      ) : filteredOrders.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="search-outline" size={72} color={COLORS.border} />
          <Text style={styles.emptyTitle}>No orders found</Text>
          <Text style={styles.emptySub}>Try adjusting your search or filters</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: SPACING.md, paddingBottom: SPACING.xl }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} colors={[COLORS.accent]} />
          }
          renderItem={renderOrder}
        />
      )}

      {/* Filter Modal */}
      <Modal visible={filterModalVisible} animationType="slide" transparent={true} onRequestClose={() => setFilterModalVisible(false)}>
        <View style={styles.bottomSheetWrap}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Filter by Status</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.sheetBody}>
              {dynamicFilterTabs.map(tab => {
                const isActive = statusFilter === tab;
                return (
                  <TouchableOpacity 
                    key={tab} 
                    style={[styles.modalFilterRow, isActive && styles.modalFilterRowActive]}
                    onPress={() => {
                      setStatusFilter(tab);
                      setFilterModalVisible(false);
                    }}
                  >
                    <Text style={[styles.modalFilterText, isActive && styles.modalFilterTextActive]}>{tab}</Text>
                    {isActive && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { justifyContent: 'center', alignItems: 'center', gap: 16 },
  
  // Header
  headerAlt: {
    backgroundColor: COLORS.bg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerIconBtnAlt: { padding: 4 },
  headerTitleAlt: { color: COLORS.text, fontSize: 20, fontWeight: '800', marginLeft: 12 },
  
  // Search
  searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingBottom: 8, backgroundColor: COLORS.bg, gap: 10 },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 8, paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: COLORS.text },
  filterBtn: { 
    flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 4
  },
  filterBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.text },

  
  // Order Card Pro
  orderCardPro: {
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 8, marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  cardTopRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: SPACING.md, borderBottomWidth: 1, borderColor: COLORS.border,
  },
  orderIdText: { fontSize: 13, fontWeight: '800', color: COLORS.muted, letterSpacing: 0.5 },
  cardBody: {
    flexDirection: 'row', padding: SPACING.md,
  },
  proOrderThumb: { width: 64, height: 64, borderRadius: 6, backgroundColor: '#f0f0f0' },
  proOrderThumbPlaceholder: { width: 64, height: 64, borderRadius: 6, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  cardInfoWrap: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  cardItemName: { fontSize: 14, fontWeight: '700', color: COLORS.text, lineHeight: 18, marginBottom: 4 },
  moreItemsText: { fontSize: 12, color: COLORS.primary, fontWeight: '600', marginBottom: 4 },
  cardOrderDate: { fontSize: 12, color: COLORS.muted },
  cardBottomRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: 12,
    backgroundColor: '#f8f9fa', borderTopWidth: 1, borderColor: COLORS.border,
    borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
  },
  cardTotalLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  cardTotalValue: { fontSize: 16, fontWeight: '800', color: COLORS.accent },
  
  // Expanded
  expandedContent: { padding: SPACING.md, borderTopWidth: 1, borderColor: COLORS.border },
  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: SPACING.sm },
  expandedSectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  expandedItemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  expandedItemImg: { width: 40, height: 50, borderRadius: 4, borderWidth: 1, borderColor: COLORS.border },
  expandedItemImgPlaceholder: { width: 40, height: 50, borderRadius: 4, backgroundColor: '#f0f0f0' },
  expandedItemInfo: { flex: 1 },
  expandedItemName: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  expandedItemMeta: { fontSize: 11, color: COLORS.muted },
  expandedItemPrice: { fontSize: 13, fontWeight: '800', color: COLORS.primary },
  
  addressBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    marginTop: SPACING.sm, padding: 12,
    backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 6,
  },
  addressName: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  addressText: { fontSize: 12, color: COLORS.muted, lineHeight: 16 },
  
  trackBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: SPACING.md, paddingVertical: 10,
    borderWidth: 1, borderColor: COLORS.primary, borderRadius: 6,
  },
  trackBtnText: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
  
  // Empty State
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: SPACING.md },
  emptySub: { fontSize: 13, color: COLORS.muted, marginTop: 4 },
  primaryBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 28, paddingVertical: 14 },
  primaryBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  
  // Bottom Sheet Modal
  bottomSheetWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: COLORS.bg, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 24, maxHeight: '70%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1, borderColor: COLORS.border },
  sheetTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  sheetBody: { padding: SPACING.md },
  modalFilterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderColor: COLORS.border },
  modalFilterRowActive: { },
  modalFilterText: { fontSize: 15, color: COLORS.text, fontWeight: '500' },
  modalFilterTextActive: { fontWeight: '800', color: COLORS.primary },
});
