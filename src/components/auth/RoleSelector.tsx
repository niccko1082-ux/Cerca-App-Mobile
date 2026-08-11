import { ThemedText } from '@/components/themed-text';
import { Role } from '@/domain/auth/User';
import { useTheme } from '@/hooks/use-theme';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface Props {
  selected: Role;
  onSelect: (role: Role) => void;
}

export function RoleSelector({ selected, onSelect }: Props) {
  const t = useTheme();
  const roles: Role[] = ['USER', 'MODERATOR', 'ADMIN'];

  const getRoleColor = (role: Role) => {
    switch (role) {
      case 'USER':
        return t.roleUser;
      case 'MODERATOR':
        return t.roleModerator;
      case 'ADMIN':
        return t.roleAdmin;
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText style={[styles.sectionTitle, { color: t.text }]}>
        Rol de Plataforma
      </ThemedText>
      <View style={styles.row}>
        {roles.map((role) => {
          const isSelected = selected === role;
          const roleColor = getRoleColor(role);

          return (
            <TouchableOpacity
              key={role}
              style={[
                styles.roleChip,
                {
                  borderColor: isSelected ? roleColor : t.border,
                  backgroundColor: isSelected ? roleColor + '20' : 'transparent',
                },
              ]}
              onPress={() => onSelect(role)}
              activeOpacity={0.7}
            >
              <ThemedText
                style={[
                  styles.roleText,
                  { color: roleColor },
                  isSelected && styles.activeRoleText,
                ]}
              >
                {role}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  roleChip: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleText: {
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  activeRoleText: {
    fontWeight: '800',
  },
});