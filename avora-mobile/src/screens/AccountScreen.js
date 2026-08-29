import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
  TextInput, ActivityIndicator, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { COLORS, SPACING, SHADOW } from '../constants/theme';

export default function AccountScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, logout, updateUser } = useAuth();

  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  // Credits
  const [credits, setCredits] = useState([]);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', phone: user.phone || '' });
      fetchCredits();
    }
  }, [user]);

  const fetchCredits = useCallback(async () => {
    if (!user) return;
    try {
      const res = await client.get(`/shopping-credits/user/${user.id}`);
      setCredits(res.data || []);
    } catch (_) {}
  }, [user]);

  const saveProfile = async () => {
    setProfileLoading(true);
    try {
      const res = await client.patch('/user/profile', {
        name: profileForm.name,
        phone: profileForm.phone,
      });
      updateUser(res.data);
      setEditProfile(false);
      Alert.alert('Success', 'Profile updated!');
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };



  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  if (!user) {
    return (
      <View style={[styles.root, styles.centered, { paddingTop: insets.top }]}>
        <View style={styles.authPromptCard}>
          <Text style={styles.authLogoText}>AVORA</Text>
          <Text style={styles.authLogoSub}>PREMIUM MENSWEAR</Text>
          <Text style={styles.authTitle}>Join Avora</Text>
          <Text style={styles.authSub}>Sign in for orders, wishlist & exclusive offers</Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.primaryBtnText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.outlineBtn, { marginTop: 10 }]}
            onPress={() => navigation.navigate('Signup')}
          >
            <Text style={styles.outlineBtnText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const activeCredit = credits.find((c) => c.isActive && !c.isUsed);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MY ACCOUNT</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>
              {(user.name || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            {editProfile ? (
              <View style={styles.editWrap}>
                <TextInput
                  style={styles.profileInput}
                  value={profileForm.name}
                  onChangeText={(v) => setProfileForm((p) => ({ ...p, name: v }))}
                  placeholder="Full Name"
                  placeholderTextColor={COLORS.muted}
                />
                <TextInput
                  style={styles.profileInput}
                  value={profileForm.phone}
                  onChangeText={(v) => setProfileForm((p) => ({ ...p, phone: v }))}
                  placeholder="Phone"
                  keyboardType="phone-pad"
                  placeholderTextColor={COLORS.muted}
                />
                <View style={styles.editBtns}>
                  <TouchableOpacity style={styles.saveBtn} onPress={saveProfile} disabled={profileLoading}>
                    {profileLoading ? <ActivityIndicator size="small" color={COLORS.white} /> : <Text style={styles.saveBtnText}>Save</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditProfile(false)}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <Text style={styles.profileName}>{user.name || 'Customer'}</Text>
                <Text style={styles.profileEmail}>{user.email}</Text>
                {user.phone && <Text style={styles.profilePhone}>{user.phone}</Text>}
                <TouchableOpacity style={styles.editBtn} onPress={() => setEditProfile(true)}>
                  <Ionicons name="pencil-outline" size={13} color={COLORS.primary} />
                  <Text style={styles.editBtnText}>Edit Profile</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Shopping Credit */}
        {activeCredit && (
          <View style={styles.creditCard}>
            <View style={styles.creditLeft}>
              <Ionicons name="gift-outline" size={22} color={COLORS.accent} />
              <View>
                <Text style={styles.creditLabel}>SHOPPING CREDIT</Text>
                <Text style={styles.creditAmount}>₹{Number(activeCredit.amount).toLocaleString()}</Text>
                <Text style={styles.creditSub}>Min order ₹{Number(activeCredit.minOrderValue).toLocaleString()}</Text>
              </View>
            </View>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>ACTIVE</Text>
            </View>
          </View>
        )}

        {/* Quick nav */}
        <View style={styles.menuSection}>
          {[
            { icon: 'bag-outline', label: 'My Orders', action: () => navigation.navigate('Orders') },
            { icon: 'heart-outline', label: 'Wishlist', action: () => navigation.navigate('Wishlist') },
            { icon: 'location-outline', label: 'Saved Addresses', action: () => navigation.navigate('Addresses') },
            { icon: 'headset-outline', label: 'Customer Care', action: () => Alert.alert('Customer Care', 'Support: support@avora.com\nPhone: 1800-AVORA-CARE') },
            { icon: 'document-text-outline', label: 'Legal & Policies', action: () => navigation.navigate('LegalPolicies') },
            { icon: 'log-out-outline', label: 'Sign Out', action: handleLogout, isDestructive: true },
          ].map(({ icon, label, action, isDestructive }) => (
            <TouchableOpacity
              key={label}
              style={styles.menuItem}
              onPress={action}
            >
              <View style={styles.menuLeft}>
                <Ionicons name={icon} size={20} color={isDestructive ? COLORS.error : COLORS.primary} />
                <Text style={[styles.menuLabel, isDestructive && { color: COLORS.error }]}>{label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  header: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
  },
  headerTitle: { color: COLORS.primary, fontSize: 16, fontWeight: '800', letterSpacing: 2 },
  scroll: { paddingBottom: SPACING.xl },
  // Auth prompt
  authPromptCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    alignItems: 'center',
    width: '100%',
    ...SHADOW.md,
  },
  authLogoText: { fontSize: 34, fontWeight: '900', color: COLORS.primary, letterSpacing: 6 },
  authLogoSub: { fontSize: 10, color: COLORS.muted, letterSpacing: 3, marginTop: 2, marginBottom: SPACING.lg },
  authTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  authSub: { fontSize: 13, color: COLORS.muted, textAlign: 'center', marginBottom: SPACING.lg, lineHeight: 19 },
  // Profile card
  profileCard: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    ...SHADOW.sm,
  },
  avatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: COLORS.white, fontSize: 24, fontWeight: '900' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  profileEmail: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  profilePhone: { fontSize: 13, color: COLORS.muted, marginTop: 1 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  editBtnText: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
  editWrap: { gap: 8, flex: 1 },
  profileInput: { borderWidth: 1, borderColor: COLORS.border, padding: 10, fontSize: 14, color: COLORS.text, backgroundColor: COLORS.bg },
  editBtns: { flexDirection: 'row', gap: 8 },
  saveBtn: { flex: 1, backgroundColor: COLORS.primary, padding: 10, alignItems: 'center' },
  saveBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '800' },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: COLORS.border, padding: 10, alignItems: 'center' },
  cancelBtnText: { fontSize: 13, color: COLORS.muted },
  // Credits
  creditCard: {
    backgroundColor: '#fff8f0',
    borderWidth: 1,
    borderColor: 'rgba(200,111,73,0.3)',
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: SPACING.md,
    marginBottom: 0,
    ...SHADOW.sm,
  },
  creditLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  creditLabel: { fontSize: 10, fontWeight: '700', color: COLORS.accent, letterSpacing: 1.5 },
  creditAmount: { fontSize: 20, fontWeight: '900', color: COLORS.primary },
  creditSub: { fontSize: 11, color: COLORS.muted },
  activeBadge: { backgroundColor: '#e8f5e9', borderWidth: 1, borderColor: '#22c55e44', paddingHorizontal: 8, paddingVertical: 3 },
  activeBadgeText: { fontSize: 9, fontWeight: '800', color: '#16a34a', letterSpacing: 1 },
  // Menu
  menuSection: { backgroundColor: COLORS.surface, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.border, margin: SPACING.md, ...SHADOW.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.md, borderBottomWidth: 1, borderColor: COLORS.border },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuLabel: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  // Sections
  section: { margin: SPACING.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: COLORS.muted, letterSpacing: 1.5 },
  addAddrBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, borderWidth: 1, borderColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 5 },
  addAddrText: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
  addressCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md, marginBottom: 8, ...SHADOW.sm },
  addrHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  addrLabelChip: { backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingVertical: 2 },
  addrLabelText: { color: COLORS.white, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  addrText: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  addrPhone: { fontSize: 12, color: COLORS.muted, marginTop: 4 },
  noDataText: { fontSize: 13, color: COLORS.muted, textAlign: 'center', padding: SPACING.md },
  // Logout
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: SPACING.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.error, backgroundColor: 'rgba(239,68,68,0.05)' },
  logoutText: { color: COLORS.error, fontSize: 14, fontWeight: '700' },
  // Buttons
  primaryBtn: { backgroundColor: COLORS.primary, padding: 15, alignItems: 'center', width: '100%' },
  primaryBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  outlineBtn: { borderWidth: 1.5, borderColor: COLORS.primary, padding: 13, alignItems: 'center', width: '100%' },
  outlineBtnText: { color: COLORS.primary, fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  // Modal
  modalHeader: { backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingBottom: 14 },
  modalTitle: { color: COLORS.white, fontSize: 16, fontWeight: '800', letterSpacing: 2 },
  modalFooter: { backgroundColor: COLORS.surface, borderTopWidth: 1, borderColor: COLORS.border, padding: SPACING.md },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: COLORS.muted, letterSpacing: 1, marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bg, padding: 12, fontSize: 14, color: COLORS.text },
});
