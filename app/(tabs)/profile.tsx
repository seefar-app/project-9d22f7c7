import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/useAuthStore';
import { useStore } from '@/store/useStore';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
  color?: string;
  showArrow?: boolean;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const { user, logout } = useAuthStore();
  const { addresses, orders } = useStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Account',
      items: [
        {
          icon: 'person-outline',
          label: 'Edit Profile',
          subtitle: user?.email,
          onPress: () => {},
          showArrow: true,
        },
        {
          icon: 'location-outline',
          label: 'Saved Addresses',
          subtitle: `${addresses.length} addresses`,
          onPress: () => {},
          showArrow: true,
        },
        {
          icon: 'card-outline',
          label: 'Payment Methods',
          subtitle: `${user?.savedPaymentMethods.length || 0} cards`,
          onPress: () => {},
          showArrow: true,
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: 'notifications-outline',
          label: 'Notifications',
          onPress: () => {},
          showArrow: true,
        },
        {
          icon: 'language-outline',
          label: 'Language',
          subtitle: 'English',
          onPress: () => {},
          showArrow: true,
        },
        {
          icon: 'moon-outline',
          label: 'Dark Mode',
          subtitle: 'System',
          onPress: () => {},
          showArrow: true,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help-circle-outline',
          label: 'Help Center',
          onPress: () => {},
          showArrow: true,
        },
        {
          icon: 'chatbubble-outline',
          label: 'Contact Us',
          onPress: () => {},
          showArrow: true,
        },
        {
          icon: 'document-text-outline',
          label: 'Terms & Privacy',
          onPress: () => {},
          showArrow: true,
        },
      ],
    },
  ];

  const completedOrders = orders.filter(o => o.status === 'delivered').length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#2563eb', '#6366f1']}
          style={[styles.header, { paddingTop: insets.top + 20 }]}
        >
          <Animated.View
            style={[
              styles.profileInfo,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Avatar
              uri={user?.avatar}
              name={user?.name}
              size="xl"
            />
            <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
            <Text style={styles.userPhone}>{user?.phone}</Text>
          </Animated.View>

          {/* Stats */}
          <Animated.View
            style={[
              styles.statsContainer,
              {
                opacity: fadeAnim,
                backgroundColor: colors.card,
              },
            ]}
          >
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {completedOrders}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Orders
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {addresses.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Addresses
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <View style={styles.referralBadge}>
                <Ionicons name="gift" size={14} color={colors.primary} />
                <Text style={[styles.referralCode, { color: colors.primary }]}>
                  {user?.referralCode}
                </Text>
              </View>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Refer & Earn
              </Text>
            </View>
          </Animated.View>
        </LinearGradient>

        {/* Menu Sections */}
        <Animated.View
          style={[
            styles.menuContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {menuSections.map((section, sectionIndex) => (
            <View key={section.title} style={styles.menuSection}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                {section.title}
              </Text>
              <Card variant="default" padding="none">
                {section.items.map((item, itemIndex) => (
                  <Pressable
                    key={item.label}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      item.onPress();
                    }}
                    style={[
                      styles.menuItem,
                      itemIndex < section.items.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: colors.borderLight,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.menuIcon,
                        { backgroundColor: colors.backgroundSecondary },
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={20}
                        color={item.color || colors.primary}
                      />
                    </View>
                    <View style={styles.menuContent}>
                      <Text style={[styles.menuLabel, { color: colors.text }]}>
                        {item.label}
                      </Text>
                      {item.subtitle && (
                        <Text style={[styles.menuSubtitle, { color: colors.textTertiary }]}>
                          {item.subtitle}
                        </Text>
                      )}
                    </View>
                    {item.showArrow && (
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={colors.textTertiary}
                      />
                    )}
                  </Pressable>
                ))}
              </Card>
            </View>
          ))}

          {/* Logout Button */}
          <Pressable
            onPress={handleLogout}
            style={[styles.logoutButton, { backgroundColor: colors.errorLight }]}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={[styles.logoutText, { color: colors.error }]}>
              Logout
            </Text>
          </Pressable>

          <Text style={[styles.version, { color: colors.textTertiary }]}>
            Version 1.0.0
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsContainer: {
    position: 'absolute',
    bottom: -40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: '100%',
  },
  referralBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  referralCode: {
    fontSize: 14,
    fontWeight: '700',
  },
  menuContainer: {
    padding: 20,
    paddingTop: 60,
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 8,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: 24,
    marginBottom: 40,
  },
});