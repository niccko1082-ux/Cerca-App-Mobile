// src/components/admin/AdminHeader.tsx
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/themed-text';
import { TOUCH_HIT_SLOP } from '@/constants/accessibility';
import { useTheme } from '@/hooks/use-theme';
import { Role } from '@/domain/auth/User';

interface Props {
  onBackPress?: () => void;
  platformRole: Role;
}

const ROLE_ICON: Record<Role, string> = {
  ADMIN: 'shield-crown',
  MODERATOR: 'shield-account',
  USER: 'account',
};

export function AdminHeader({ onBackPress, platformRole }: Props) {
  const t = useTheme();
  const { t: translate } = useTranslation();

  const getBadgeColor = () => {
    if (platformRole === 'ADMIN') return t.roleAdmin ?? '#F18933';
    if (platformRole === 'MODERATOR') return t.roleModerator ?? '#757575';
    return '#B0B0B0';
  };

  return (
    <View style={styles.container}>
      {onBackPress && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBackPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={translate('common.back')}
          hitSlop={TOUCH_HIT_SLOP}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={t.text} />
        </TouchableOpacity>
      )}

      <View style={styles.titleContainer}>
        <View style={styles.headlineRow}>
          <ThemedText type="title" style={[styles.title, { color: t.text }]}>
            {translate('admin.panelTitle')}
          </ThemedText>

          <View style={[styles.adminBadge, { backgroundColor: getBadgeColor() }]}>
            <MaterialCommunityIcons
              name={ROLE_ICON[platformRole] as any}
              size={14}
              color="#FFFFFF"
            />
            <ThemedText style={styles.adminBadgeText}>{platformRole}</ThemedText>
          </View>
        </View>
        <ThemedText style={[styles.subtitle, { color: t.icon }]}>
          {translate('admin.panelSubtitle', { role: platformRole })}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginBottom: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  titleContainer: {
    gap: 4,
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  adminBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
  },
});
