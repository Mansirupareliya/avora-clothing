import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, Alert, Modal, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { CartItemSkeleton } from '../components/SkeletonLoader';
import { COLORS, SPACING, SHADOW, FONTS } from '../constants/theme';

const GST_RATE = 5;

export default function CartScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { cartItems, removeFromCart, updateCart, cartTotal, clearCart, loading, fetchCart, cartCount } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMsg, setCouponMsg] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  
  const [sizeModal, setSizeModal] = useState({ visible: false, item: null, sizes: [], loading: false });
  const [qtyModal, setQtyModal] = useState({ visible: false, item: null });
  const [orderLoading, setOrderLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [buyForm, setBuyForm] = useState({
    name: user?.name || '', phone: '', address: '', city: '', pincode: '',
    note: '', payment: 'cod',
  });
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchCart();
      fetchAddresses();
      fetchWishlistCount();
    }
  }, [user]);

  const fetchWishlistCount = async () => {
    try {
      const res = await client.get('/wishlist');
      setWishlistCount(res.data.length || 0);
    } catch(e) {}
  };

  const fetchAddresses = async () => {
    try {
      const res = await client.get('/addresses');
      setAddresses(res.data || []);
      if (res.data?.length > 0) {
        const addr = res.data[0];
        setSelectedAddress(addr);
        setBuyForm((p) => ({
          ...p,
          name: user?.name || p.name,
          address: addr.street || addr.address || '',
          city: addr.city || '',
          pincode: addr.pincode || addr.postalCode || '',
          phone: addr.phone || user?.phone || '',
        }));
      }
    } catch (_) {}
  };

  const subtotal = cartTotal;
  const couponDiscount = appliedCoupon
    ? Math.min(Number(appliedCoupon.discountAmount || 0), subtotal)
    : 0;
  const discountedSub = Math.max(0, subtotal - couponDiscount);
  const gst = discountedSub * (GST_RATE / 100);
  const grandTotal = discountedSub + gst;

  const validateCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponMsg(null);
    try {
      const res = await client.post('/coupons/validate', {
        code: couponInput.trim(),
        orderTotal: subtotal,
        userId: user?.id,
        userEmail: user?.email,
      });
      if (res.data?.valid) {
        setAppliedCoupon({
          code: res.data.coupon.code,
          discountAmount: res.data.discountAmount,
        });
        setCouponMsg({ text: res.data.message, isError: false });
      } else {
        setCouponMsg({ text: res.data?.message || 'Invalid coupon', isError: true });
      }
    } catch (e) {
      setCouponMsg({ text: e.message || 'Coupon error', isError: true });
    } finally {
      setCouponLoading(false);
    }
  };

  const placeOrder = async () => {
    if (!buyForm.name || !buyForm.phone || !buyForm.address || !buyForm.city || !buyForm.pincode) {
      Alert.alert('Missing Details', 'Please fill in all required delivery fields.');
      return;
    }
    setOrderLoading(true);
    try {
      const orderData = {
        userId: user?.id,
        userEmail: user?.email,
        items: cartItems.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          price: i.price,
          size: i.size,
          imageUrl: i.imageUrl,
        })),
        totalAmount: grandTotal,
        originalSubtotal: subtotal,
        gstAmount: gst,
        discountAmount: couponDiscount,
        couponCode: appliedCoupon?.code || null,
        shippingAddress: {
          fullName: buyForm.name,
          phone: buyForm.phone,
          addressLine1: buyForm.address,
          city: buyForm.city,
          pincode: buyForm.pincode,
          note: buyForm.note,
        },
        paymentMethod: buyForm.payment,
      };
      await client.post('/orders/checkout', orderData);
      await clearCart();
      setShowCheckout(false);
      setAppliedCoupon(null);
      setCouponInput('');
      Alert.alert('🎉 Order Placed!', 'Your order has been placed successfully. You can track it in My Orders.', [
        { text: 'View Orders', onPress: () => navigation.navigate('OrdersTab') },
        { text: 'Continue Shopping', onPress: () => navigation.navigate('ShopTab') },
      ]);
    } catch (e) {
      Alert.alert('Order Failed', e.message || 'Please try again.');
    } finally {
      setOrderLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={[styles.root, styles.centered, { paddingTop: insets.top }]}>
        <Ionicons name="bag-outline" size={64} color={COLORS.border} />
        <Text style={styles.emptyTitle}>Sign in to view your cart</Text>
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
          <Text style={styles.headerTitleAlt}>Cart</Text>
          <Text style={styles.headerSubtitleAlt}>{cartItems.length} Items</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('WishlistTab')} style={styles.headerIconBtnAlt}>
          <Ionicons name="heart-outline" size={24} color={COLORS.text} />
          {wishlistCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{wishlistCount > 9 ? '9+' : wishlistCount}</Text></View>}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View>
          {[1, 2, 3].map((k) => <CartItemSkeleton key={k} />)}
        </View>
      ) : cartItems.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="bag-outline" size={72} color={COLORS.border} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubText}>Add some products to get started</Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { marginTop: SPACING.md }]}
            onPress={() => navigation.navigate('ShopTab')}
          >
            <Text style={styles.primaryBtnText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cartItems}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 220 }}
          renderItem={({ item }) => {
            const uri = item.imageUrl?.startsWith('http')
              ? item.imageUrl
              : `https://avora-clothing.onrender.com${item.imageUrl}`;
              
            const expectedDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            const formattedDate = expectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
            
            return (
              <View style={styles.cartItem}>
                <Image source={{ uri }} style={styles.cartImage} resizeMode="cover" />
                <View style={styles.cartInfo}>
                  <View style={styles.cartNameRow}>
                    <Text style={styles.cartName} numberOfLines={2}>{item.productName}</Text>
                    <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.deleteBtn}>
                      <Ionicons name="trash-outline" size={20} color={COLORS.muted} />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.cartPrice}>₹{Number(item.price).toLocaleString()}</Text>
                  
                  <Text style={styles.deliveryText}>
                    15 Day Easy Returns & Exchange
                  </Text>
                  <Text style={styles.deliveryDateText}>
                    Expected delivery by {formattedDate}
                  </Text>
                  
                  <View style={styles.dropdownRow}>
                    <TouchableOpacity 
                      style={styles.dropdownBox} 
                      activeOpacity={0.8}
                      onPress={async () => {
                        setSizeModal({ visible: true, item, sizes: [], loading: true });
                        try {
                          const res = await client.get(`/products/${item.productId}`);
                          setSizeModal({ visible: true, item, sizes: res.data.sizes || ['S','M','L','XL','XXL'], loading: false });
                        } catch(e) {
                          setSizeModal({ visible: true, item, sizes: ['S','M','L','XL','XXL'], loading: false });
                        }
                      }}
                    >
                      <Text style={styles.dropdownText}>Size : {item.size || 'N/A'}</Text>
                      <Ionicons name="caret-down" size={14} color={COLORS.text} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.dropdownBox} 
                      onPress={() => setQtyModal({ visible: true, item })}
                    >
                      <Text style={styles.dropdownText}>Qty : {item.quantity}</Text>
                      <Ionicons name="caret-down" size={14} color={COLORS.text} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
          ListFooterComponent={
            <View style={styles.summarySection}>
              {/* Coupon */}
              <View style={styles.couponWrap}>
                <Text style={styles.sectionLabel}>COUPON CODE</Text>
                <View style={styles.couponRow}>
                  <TextInput
                    style={styles.couponInput}
                    placeholder="Enter coupon code"
                    placeholderTextColor={COLORS.muted}
                    value={couponInput}
                    onChangeText={setCouponInput}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity
                    style={[styles.couponBtn, couponLoading && { opacity: 0.7 }]}
                    onPress={validateCoupon}
                    disabled={couponLoading}
                  >
                    {couponLoading
                      ? <ActivityIndicator size="small" color={COLORS.white} />
                      : <Text style={styles.couponBtnText}>Apply</Text>
                    }
                  </TouchableOpacity>
                </View>
                {appliedCoupon && (
                  <TouchableOpacity onPress={() => { setAppliedCoupon(null); setCouponMsg(null); setCouponInput(''); }}>
                    <Text style={{ color: COLORS.success, fontSize: 12, fontWeight: '700', marginTop: 4 }}>
                      ✓ {appliedCoupon.code} applied — tap to remove
                    </Text>
                  </TouchableOpacity>
                )}
                {couponMsg && (
                  <Text style={{ color: couponMsg.isError ? COLORS.error : COLORS.success, fontSize: 12, marginTop: 4 }}>
                    {couponMsg.text}
                  </Text>
                )}
              </View>

              {/* Price breakdown */}
              <View style={styles.priceBreakdown}>
                <Text style={styles.sectionLabel}>ORDER SUMMARY</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Subtotal</Text>
                  <Text style={styles.priceValue}>₹{subtotal.toLocaleString()}</Text>
                </View>
                {couponDiscount > 0 && (
                  <View style={styles.priceRow}>
                    <Text style={[styles.priceLabel, { color: COLORS.success }]}>Coupon Discount</Text>
                    <Text style={[styles.priceValue, { color: COLORS.success }]}>-₹{couponDiscount.toLocaleString()}</Text>
                  </View>
                )}
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>GST ({GST_RATE}%)</Text>
                  <Text style={styles.priceValue}>₹{gst.toFixed(0)}</Text>
                </View>
                <View style={[styles.priceRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Grand Total</Text>
                  <Text style={styles.totalValue}>₹{grandTotal.toFixed(0)}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={() => setShowCheckout(true)}
              >
                <Ionicons name="card-outline" size={18} color={COLORS.white} />
                <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Checkout Modal */}
      <Modal visible={showCheckout} animationType="slide" onRequestClose={() => setShowCheckout(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={[styles.modalHeader, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity onPress={() => setShowCheckout(false)}>
              <Ionicons name="arrow-back" size={22} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>CHECKOUT</Text>
            <View style={{ width: 30 }} />
          </View>

          <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 100 }}>
            <Text style={styles.sectionLabel}>DELIVERY DETAILS</Text>

            {/* Saved addresses */}
            {addresses.length > 0 && (
              <View style={styles.savedAddressWrap}>
                {addresses.map((addr) => (
                  <TouchableOpacity
                    key={addr.id}
                    style={[styles.savedAddr, selectedAddress?.id === addr.id && styles.savedAddrActive]}
                    onPress={() => {
                      setSelectedAddress(addr);
                      setBuyForm((p) => ({
                        ...p,
                        address: addr.street || addr.address || '',
                        city: addr.city || '',
                        pincode: addr.pincode || addr.postalCode || '',
                      }));
                    }}
                  >
                    <Ionicons
                      name={selectedAddress?.id === addr.id ? 'radio-button-on' : 'radio-button-off'}
                      size={16}
                      color={COLORS.primary}
                    />
                    <Text style={styles.savedAddrText} numberOfLines={2}>
                      {addr.street || addr.address}, {addr.city} {addr.pincode || addr.postalCode}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {[
              { key: 'name', label: 'FULL NAME *', placeholder: 'Your name' },
              { key: 'phone', label: 'PHONE *', placeholder: '+91 9999999999', keyboard: 'phone-pad' },
              { key: 'address', label: 'STREET ADDRESS *', placeholder: 'House/Flat, Street, Area' },
              { key: 'city', label: 'CITY *', placeholder: 'City' },
              { key: 'pincode', label: 'PINCODE *', placeholder: '000000', keyboard: 'number-pad' },
              { key: 'note', label: 'DELIVERY NOTE', placeholder: 'Optional instructions' },
            ].map(({ key, label, placeholder, keyboard }) => (
              <View key={key} style={styles.formField}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder={placeholder}
                  placeholderTextColor={COLORS.muted}
                  keyboardType={keyboard || 'default'}
                  value={buyForm[key]}
                  onChangeText={(v) => setBuyForm((p) => ({ ...p, [key]: v }))}
                />
              </View>
            ))}

            {/* Payment */}
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>PAYMENT METHOD</Text>
              <View style={styles.paymentOptions}>
                {[{ val: 'cod', label: '💵 Cash on Delivery' }, { val: 'online', label: '💳 Online Payment' }].map(({ val, label }) => (
                  <TouchableOpacity
                    key={val}
                    style={[styles.paymentOpt, buyForm.payment === val && styles.paymentOptActive]}
                    onPress={() => setBuyForm((p) => ({ ...p, payment: val }))}
                  >
                    <Ionicons
                      name={buyForm.payment === val ? 'radio-button-on' : 'radio-button-off'}
                      size={16}
                      color={COLORS.primary}
                    />
                    <Text style={styles.paymentLabel}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Total summary */}
            <View style={[styles.priceBreakdown, { marginTop: SPACING.md }]}>
              <Text style={styles.sectionLabel}>ORDER TOTAL</Text>
              <View style={[styles.priceRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Grand Total</Text>
                <Text style={styles.totalValue}>₹{grandTotal.toFixed(0)}</Text>
              </View>
            </View>
          </ScrollView>

          <View style={[styles.modalFooter, { paddingBottom: insets.bottom + SPACING.sm }]}>
            <TouchableOpacity
              style={[styles.placeOrderBtn, orderLoading && { opacity: 0.7 }]}
              onPress={placeOrder}
              disabled={orderLoading}
            >
              {orderLoading
                ? <ActivityIndicator color={COLORS.white} />
                : <Text style={styles.placeOrderText}>Place Order — ₹{grandTotal.toFixed(0)}</Text>
              }
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Size Modal */}
      <Modal visible={sizeModal.visible} animationType="slide" transparent={true} onRequestClose={() => setSizeModal({ ...sizeModal, visible: false })}>
        <View style={styles.bottomSheetWrap}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select Size</Text>
              <TouchableOpacity onPress={() => setSizeModal({ ...sizeModal, visible: false })}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.sheetBody}>
              {sizeModal.loading ? (
                <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 20 }} />
              ) : (
                <View style={styles.sizeGrid}>
                  {sizeModal.sizes.map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.sizeOption, sizeModal.item?.size === s && styles.sizeOptionActive]}
                      onPress={() => {
                        updateCart(sizeModal.item.id, sizeModal.item.quantity, s);
                        setSizeModal({ ...sizeModal, visible: false });
                      }}
                    >
                      <Text style={[styles.sizeOptionText, sizeModal.item?.size === s && styles.sizeOptionTextActive]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Qty Modal */}
      <Modal visible={qtyModal.visible} animationType="slide" transparent={true} onRequestClose={() => setQtyModal({ ...qtyModal, visible: false })}>
        <View style={styles.bottomSheetWrap}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select Quantity</Text>
              <TouchableOpacity onPress={() => setQtyModal({ ...qtyModal, visible: false })}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.sheetBody}>
              <View style={styles.qtyGrid}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((q) => (
                  <TouchableOpacity
                    key={q}
                    style={[styles.qtyOption, qtyModal.item?.quantity === q && styles.sizeOptionActive]}
                    onPress={() => {
                      updateCart(qtyModal.item.id, q, qtyModal.item.size);
                      setQtyModal({ ...qtyModal, visible: false });
                    }}
                  >
                    <Text style={[styles.sizeOptionText, qtyModal.item?.quantity === q && styles.sizeOptionTextActive]}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { justifyContent: 'center', alignItems: 'center', gap: 16 },
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
    position: 'absolute', top: 0, right: 0, backgroundColor: COLORS.accent,
    borderRadius: 99, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  badgeText: { color: COLORS.white, fontSize: 9, fontWeight: '800' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
  },
  headerTitle: { color: COLORS.primary, fontSize: 16, fontWeight: '800', letterSpacing: 2 },
  clearText: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },
  headerAlt: {
    backgroundColor: COLORS.bg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtnAlt: { padding: 4, position: 'relative' },
  headerTitleAlt: { color: COLORS.text, fontSize: 20, fontWeight: '800', marginLeft: 12 },
  headerSubtitleAlt: { color: COLORS.muted, fontSize: 13, fontWeight: '600', marginLeft: 8, marginTop: 4 },
  
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  cartImage: { width: 90, height: 120, borderRadius: 4, backgroundColor: '#f0f0f0' },
  cartInfo: { flex: 1, marginLeft: SPACING.md },
  cartNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cartName: { flex: 1, fontSize: 13, color: COLORS.text, lineHeight: 18, paddingRight: 8 },
  deleteBtn: { padding: 4 },
  cartPrice: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginVertical: 6 },
  deliveryText: { fontSize: 11, color: COLORS.muted, marginBottom: 2 },
  deliveryDateText: { fontSize: 11, color: COLORS.muted, marginBottom: 12 },
  dropdownRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dropdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 6,
    width: 80,
    borderRadius: 2,
  },
  dropdownText: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  summarySection: { margin: SPACING.md, gap: SPACING.md },
  couponWrap: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.muted, letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' },
  couponRow: { flexDirection: 'row', gap: 8 },
  couponInput: { flex: 1, borderWidth: 1, borderColor: COLORS.border, padding: 11, fontSize: 13, color: COLORS.text, backgroundColor: COLORS.bg },
  couponBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 16, justifyContent: 'center' },
  couponBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '800' },
  priceBreakdown: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { fontSize: 13, color: COLORS.muted },
  priceValue: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  totalRow: { borderTopWidth: 1, borderColor: COLORS.border, paddingTop: 10, marginTop: 4, marginBottom: 0 },
  totalLabel: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  totalValue: { fontSize: 18, fontWeight: '900', color: COLORS.accent },
  checkoutBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  checkoutBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  primaryBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 28, paddingVertical: 14 },
  primaryBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: SPACING.md },
  emptySubText: { fontSize: 13, color: COLORS.muted, marginTop: 4 },
  // Modal
  modalHeader: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: 14,
  },
  modalTitle: { color: COLORS.white, fontSize: 16, fontWeight: '800', letterSpacing: 2 },
  modalBody: { flex: 1, padding: SPACING.md },
  modalFooter: { backgroundColor: COLORS.surface, borderTopWidth: 1, borderColor: COLORS.border, padding: SPACING.md },
  savedAddressWrap: { marginBottom: SPACING.md, gap: 8 },
  savedAddr: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: COLORS.border, padding: 10, backgroundColor: COLORS.surface },
  savedAddrActive: { borderColor: COLORS.primary, backgroundColor: '#f0f3f8' },
  savedAddrText: { flex: 1, fontSize: 13, color: COLORS.text },
  formField: { marginBottom: SPACING.md },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: COLORS.muted, letterSpacing: 1, marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bg, padding: 12, fontSize: 14, color: COLORS.text },
  paymentOptions: { gap: 8 },
  paymentOpt: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: COLORS.border, padding: 12, backgroundColor: COLORS.surface },
  paymentOptActive: { borderColor: COLORS.primary, backgroundColor: '#f0f3f8' },
  paymentLabel: { fontSize: 14, color: COLORS.text, fontWeight: '600' },
  placeOrderBtn: { backgroundColor: COLORS.accent, padding: 16, alignItems: 'center' },
  placeOrderText: { color: COLORS.white, fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  // Bottom Sheet
  bottomSheetWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: COLORS.bg, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 24 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1, borderColor: COLORS.border },
  sheetTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  sheetBody: { padding: SPACING.md },
  sizeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sizeOption: { paddingVertical: 10, paddingHorizontal: 16, borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, backgroundColor: COLORS.surface },
  sizeOptionActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  sizeOptionText: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  sizeOptionTextActive: { color: COLORS.white },
  qtyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  qtyOption: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, backgroundColor: COLORS.surface },
});
