import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { COLORS, SPACING, SHADOW } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';

export default function SpecialOffersModal() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [promoConfig, setPromoConfig] = useState({
    minTriggerSpend: 5000,
    rewardAmount: 1500,
    minRedeemOrderValue: 6000,
    expiryDays: 30,
    isEnabled: true,
  });
  const [userActiveCredit, setUserActiveCredit] = useState(null);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const [configRes, creditRes] = await Promise.all([
        client.get('/shopping-credits/config').catch(() => ({ data: null })),
        user ? client.get('/shopping-credits/active', { params: { userId: user.id, userEmail: user.email } }).catch(() => ({ data: null })) : Promise.resolve({ data: null }),
      ]);
      if (configRes.data) setPromoConfig(configRes.data);
      if (creditRes.data) setUserActiveCredit(creditRes.data);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [user]);

  if (!promoConfig.isEnabled) return null;

  return (
    <>
      <TouchableOpacity
        style={styles.fabWrap}
        onPress={() => { fetchOffers(); setIsOpen(true); }}
        activeOpacity={0.8}
      >
        <BlurView intensity={70} tint="light" style={styles.fab}>
          <Ionicons name="gift-outline" size={24} color={COLORS.primary} />
          <View style={styles.fabBadge} />
        </BlurView>
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="slide" onRequestClose={() => setIsOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setIsOpen(false)}>
              <Ionicons name="close" size={24} color={COLORS.primary} />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <View style={styles.header}>
                <Text style={styles.logoText}>AVORA</Text>
              </View>

              <Text style={styles.title}>Exclusive Store Offers</Text>
              <Text style={styles.subtitle}>Special rewards unlocked for your account</Text>

              {loading ? (
                <ActivityIndicator color={COLORS.accent} style={{ marginVertical: 20 }} />
              ) : (
                <View style={styles.offerCard}>
                  <View style={styles.offerHeaderRow}>
                    <Text style={styles.offerTag}>LIMITED PROMOTION</Text>
                    <Text style={styles.activeTag}>ACTIVE</Text>
                  </View>

                  <Text style={styles.offerTitle}>
                    Unlock ₹{Number(promoConfig.rewardAmount).toLocaleString()} Shopping Credit
                  </Text>
                  <Text style={styles.offerDesc}>
                    Place an order of ₹{Number(promoConfig.minTriggerSpend).toLocaleString()} or more to earn an automatic ₹{Number(promoConfig.rewardAmount).toLocaleString()} Shopping Credit for your next purchase!
                  </Text>

                  <View style={styles.detailsBox}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>QUALIFYING ORDER SPEND</Text>
                      <View style={styles.detailValueBox}>
                        <Text style={styles.detailValueText}>₹{Number(promoConfig.minTriggerSpend).toLocaleString()}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>COUPON REWARD CREDIT</Text>
                      <View style={styles.detailValueBoxSuccess}>
                        <Text style={styles.detailValueTextSuccess}>₹{Number(promoConfig.rewardAmount).toLocaleString()} Shopping Credit</Text>
                      </View>
                    </View>

                    <View style={styles.splitRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.detailLabel}>REDEMPTION MIN SPEND</Text>
                        <View style={styles.detailValueBox}>
                          <Text style={styles.detailValueTextSm}>₹{Number(promoConfig.minRedeemOrderValue).toLocaleString()}</Text>
                        </View>
                      </View>
                      <View style={{ width: 10 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.detailLabel}>VALIDITY DURATION</Text>
                        <View style={styles.detailValueBox}>
                          <Text style={styles.detailValueTextSm}>{promoConfig.expiryDays} Days</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => setIsOpen(false)}
                  >
                    <Text style={styles.primaryBtnText}>Shop Now & Earn Rewards</Text>
                    <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              )}

              {userActiveCredit && (
                <View style={styles.userCreditBox}>
                  <View style={styles.creditLeft}>
                    <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
                    <View style={{ marginLeft: 10 }}>
                      <Text style={styles.creditTitle}>You have an active credit!</Text>
                      <Text style={styles.creditValue}>₹{Number(userActiveCredit.amount).toLocaleString()} Available</Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fabWrap: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    ...SHADOW.lg,
    zIndex: 999,
    overflow: 'hidden', // to clip the BlurView to the circle
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  fab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // base transparent tint for glass
  },
  fabBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2da7a1',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: SPACING.lg,
    maxHeight: '90%',
  },
  closeBtn: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 10,
    padding: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  logoText: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },
  logoSub: {
    color: COLORS.muted,
    fontSize: 10,
    letterSpacing: 3,
    marginTop: 2,
  },
  title: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  offerCard: {
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  offerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  offerTag: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.accent,
    letterSpacing: 1,
  },
  activeTag: {
    fontSize: 9,
    fontWeight: '800',
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    paddingHorizontal: 6,
    paddingVertical: 2,
    letterSpacing: 0.5,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 8,
  },
  offerDesc: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  detailsBox: {
    gap: 12,
    marginBottom: SPACING.lg,
  },
  detailRow: {},
  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.muted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  detailValueBox: {
    backgroundColor: '#b0b8c6',
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
  },
  detailValueText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  detailValueBoxSuccess: {
    backgroundColor: '#b0b8c6',
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
  },
  detailValueTextSuccess: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16a34a',
  },
  splitRow: {
    flexDirection: 'row',
  },
  detailValueTextSm: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  userCreditBox: {
    marginTop: SPACING.md,
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#22c55e44',
    padding: SPACING.md,
  },
  creditLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creditTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16a34a',
  },
  creditValue: {
    fontSize: 11,
    color: COLORS.primary,
    marginTop: 2,
    fontWeight: '600',
  },
});
