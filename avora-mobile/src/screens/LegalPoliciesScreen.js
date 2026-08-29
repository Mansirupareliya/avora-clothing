import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../constants/theme';

export default function LegalPoliciesScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LEGAL & POLICIES</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TERMS & CONDITIONS</Text>
          <Text style={styles.bodyText}>
            Welcome to AVORA. By accessing our application, you agree to comply with our Terms of Service. All content on this application is protected by intellectual property laws. AVORA reserves the right to terminate accounts or cancel orders for any violation of these terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CANCELLATION POLICY</Text>
          <Text style={styles.bodyText}>
            Orders can be cancelled before they are shipped. Once an order is dispatched, it cannot be cancelled, but you may request a return upon delivery in accordance with our Return Policy. Refunds for cancelled orders will be processed within 5-7 business days to the original payment method.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RETURN & REFUND POLICY</Text>
          <Text style={styles.bodyText}>
            We accept returns within 14 days of delivery. Items must be unworn, unwashed, and have original tags attached. To initiate a return, contact Customer Care. Refunds will be issued once the returned items pass our quality inspection. Shipping charges are non-refundable.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PAYMENT POLICY</Text>
          <Text style={styles.bodyText}>
            AVORA accepts major credit/debit cards, UPI, and net banking. We also offer Cash on Delivery (COD) for eligible pincodes. All online payments are securely processed. In the event of a payment failure where funds are deducted, they will be automatically refunded by your bank within 48 hours.
          </Text>
        </View>
      </ScrollView>
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
  backBtn: { padding: 4, width: 36, alignItems: 'center' },
  headerTitle: { color: COLORS.primary, fontSize: 16, fontWeight: '800', letterSpacing: 2 },
  scroll: { padding: SPACING.md, paddingBottom: SPACING.xl },
  section: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 22,
  },
});
