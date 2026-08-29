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

export default function AddressesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [addresses, setAddresses] = useState([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [addrForm, setAddrForm] = useState({ label: 'Home', street: '', city: '', state: '', pincode: '', phone: '' });

  const fetchAddresses = useCallback(async () => {
    if (!user) return;
    setAddrLoading(true);
    try {
      const res = await client.get('/addresses');
      setAddresses(res.data || []);
    } catch (_) {}
    finally { setAddrLoading(false); }
  }, [user]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const addAddress = async () => {
    if (!addrForm.street || !addrForm.city || !addrForm.pincode) {
      Alert.alert('Missing fields', 'Please fill in street, city, and pincode.');
      return;
    }
    try {
      const res = await client.post('/addresses', addrForm);
      setAddresses((p) => [...p, res.data]);
      setShowAddAddr(false);
      setAddrForm({ label: 'Home', street: '', city: '', state: '', pincode: '', phone: '' });
      Alert.alert('Success', 'Address saved!');
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to add address');
    }
  };

  const deleteAddress = async (id) => {
    Alert.alert('Delete Address', 'Remove this address?', [
      { text: 'Cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await client.delete(`/addresses/${id}`);
            setAddresses((p) => p.filter((a) => a.id !== id));
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SAVED ADDRESSES</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={styles.section}>
          <TouchableOpacity style={styles.addBtnLarge} onPress={() => setShowAddAddr(true)}>
            <Ionicons name="add" size={18} color={COLORS.primary} />
            <Text style={styles.addBtnLargeText}>Add New Address</Text>
          </TouchableOpacity>

          {addrLoading ? (
            <ActivityIndicator color={COLORS.accent} style={{ marginTop: 20 }} />
          ) : addresses.length === 0 ? (
            <Text style={styles.noDataText}>No addresses saved yet</Text>
          ) : (
            addresses.map((addr) => (
              <View key={addr.id} style={styles.addressCard}>
                <View style={styles.addrHeader}>
                  <View style={styles.addrLabelChip}>
                    <Text style={styles.addrLabelText}>{addr.label || 'Address'}</Text>
                  </View>
                  <TouchableOpacity onPress={() => deleteAddress(addr.id)}>
                    <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.addrText}>
                  {addr.street},{'\n'}{addr.city}, {addr.state} {addr.pincode}
                </Text>
                {addr.phone && <Text style={styles.addrPhone}>📞 {addr.phone}</Text>}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Address Modal */}
      <Modal visible={showAddAddr} animationType="slide" onRequestClose={() => setShowAddAddr(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={[styles.modalHeader, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity onPress={() => setShowAddAddr(false)}>
              <Ionicons name="close" size={22} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>ADD ADDRESS</Text>
            <View style={{ width: 30 }} />
          </View>
          <ScrollView style={{ padding: SPACING.md }} contentContainerStyle={{ paddingBottom: 100 }}>
            {[
              { key: 'label', label: 'LABEL', placeholder: 'Home, Work, Other…' },
              { key: 'street', label: 'STREET ADDRESS *', placeholder: 'House/Flat, Street, Area' },
              { key: 'city', label: 'CITY *', placeholder: 'City' },
              { key: 'state', label: 'STATE', placeholder: 'State' },
              { key: 'pincode', label: 'PINCODE *', placeholder: '000000', keyboard: 'number-pad' },
              { key: 'phone', label: 'CONTACT PHONE', placeholder: '+91 9999999999', keyboard: 'phone-pad' },
            ].map(({ key, label, placeholder, keyboard }) => (
              <View key={key} style={{ marginBottom: SPACING.md }}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder={placeholder}
                  placeholderTextColor={COLORS.muted}
                  keyboardType={keyboard || 'default'}
                  value={addrForm[key]}
                  onChangeText={(v) => setAddrForm((p) => ({ ...p, [key]: v }))}
                />
              </View>
            ))}
          </ScrollView>
          <View style={[styles.modalFooter, { paddingBottom: insets.bottom + SPACING.sm }]}>
            <TouchableOpacity style={styles.primaryBtn} onPress={addAddress}>
              <Text style={styles.primaryBtnText}>Save Address</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  section: { margin: SPACING.md },
  addBtnLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderStyle: 'dashed',
  },
  addBtnLargeText: { fontSize: 14, color: COLORS.primary, fontWeight: '700' },
  addressCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md, marginBottom: 8, ...SHADOW.sm },
  addrHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  addrLabelChip: { backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingVertical: 2 },
  addrLabelText: { color: COLORS.white, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  addrText: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  addrPhone: { fontSize: 12, color: COLORS.muted, marginTop: 4 },
  noDataText: { fontSize: 13, color: COLORS.muted, textAlign: 'center', padding: SPACING.md },
  primaryBtn: { backgroundColor: COLORS.primary, padding: 15, alignItems: 'center', width: '100%' },
  primaryBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  modalHeader: { backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingBottom: 14 },
  modalTitle: { color: COLORS.primary, fontSize: 16, fontWeight: '800', letterSpacing: 2 },
  modalFooter: { backgroundColor: COLORS.surface, borderTopWidth: 1, borderColor: COLORS.border, padding: SPACING.md },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: COLORS.muted, letterSpacing: 1, marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bg, padding: 12, fontSize: 14, color: COLORS.text },
});
