import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, SHADOW, FONTS } from '../constants/theme';

export default function SignupScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const submit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signup({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      Alert.alert('Success', 'Account created successfully! Please sign in.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar} />

        <View style={styles.card}>
          {/* Logo */}
          <View style={styles.logoWrap}>
            <Text style={styles.logo}>AVORA</Text>
            <Text style={styles.logoSub}>PREMIUM MENSWEAR</Text>
          </View>

          <Text style={styles.heading}>Create Account</Text>
          <Text style={styles.subheading}>Join Avora for exclusive menswear</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="warning-outline" size={14} color={COLORS.accent} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Name */}
          <View style={styles.field}>
            <Text style={styles.label}>FULL NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="Your Name"
              placeholderTextColor={COLORS.muted}
              value={form.name}
              onChangeText={(v) => handle('name', v)}
            />
          </View>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={COLORS.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(v) => handle('email', v)}
            />
          </View>

          {/* Password */}
          <View style={styles.field}>
            <Text style={styles.label}>PASSWORD</Text>
            <View>
              <TextInput
                style={[styles.input, { paddingRight: 44 }]}
                placeholder="Min 6 characters"
                placeholderTextColor={COLORS.muted}
                secureTextEntry={!showPass}
                value={form.password}
                onChangeText={(v) => handle('password', v)}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPass(!showPass)}
              >
                <Ionicons
                  name={showPass ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={COLORS.muted}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={submit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.btnText}>Create Account →</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>
              Already have an account?{' '}
              <Text style={styles.link}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flexGrow: 1, padding: SPACING.md, paddingBottom: SPACING.xl },
  topBar: { height: 4, backgroundColor: COLORS.accent2, marginBottom: SPACING.xl, marginHorizontal: -SPACING.md },
  card: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.lg, ...SHADOW.md },
  logoWrap: { alignItems: 'center', marginBottom: SPACING.lg },
  logo: { fontSize: 36, fontFamily: FONTS.logo, color: COLORS.primary, letterSpacing: 6 },
  logoSub: { fontSize: 10, color: COLORS.muted, letterSpacing: 3, marginTop: 2, textTransform: 'uppercase' },
  heading: { fontSize: 22, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: 4 },
  subheading: { fontSize: 13, color: COLORS.muted, textAlign: 'center', marginBottom: SPACING.lg },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(200,111,73,0.1)', borderWidth: 1, borderColor: 'rgba(200,111,73,0.3)', padding: 10, marginBottom: SPACING.md },
  errorText: { color: COLORS.accent, fontSize: 13, flex: 1 },
  field: { marginBottom: SPACING.md },
  label: { fontSize: 11, fontWeight: '700', color: COLORS.muted, letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' },
  input: { backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border, padding: 13, fontSize: 14, color: COLORS.text },
  eyeBtn: { position: 'absolute', right: 12, top: '50%', transform: [{ translateY: -10 }] },
  btn: { backgroundColor: COLORS.primary, padding: 15, alignItems: 'center', marginTop: SPACING.sm },
  btnText: { color: COLORS.white, fontSize: 15, fontWeight: '800', letterSpacing: 1 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: SPACING.md },
  line: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { color: COLORS.muted, fontSize: 12 },
  linkText: { textAlign: 'center', color: COLORS.muted, fontSize: 13 },
  link: { color: COLORS.primary, fontWeight: '800' },
});
