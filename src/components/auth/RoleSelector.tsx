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

    return (
        <View style={styles.container}>
            <ThemedText style={[styles.sectionTitle, { color: t.text }]}>
                Rol de Plataforma
            </ThemedText>
            <View style={styles.row}>
                {roles.map((role) => (
                    <TouchableOpacity key={role} onPress={() => onSelect(role)}>
                        <ThemedText
                            style={[
                                styles.roleText,
                                { color: role === 'USER' ? t.roleUser : role === 'MODERATOR' ? t.roleModerator : t.roleAdmin },
                                selected === role && styles.activeRole,
                            ]}
                        >
                            [ {role} ]
                        </ThemedText>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    roleText: { fontWeight: 'bold', fontSize: 14 },
    activeRole: { textDecorationLine: 'underline' },
});