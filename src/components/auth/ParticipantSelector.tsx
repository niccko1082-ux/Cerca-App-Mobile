import { ThemedText } from '@/components/themed-text';
import { ParticipantType } from '@/domain/auth/User';
import { useTheme } from '@/hooks/use-theme';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface Props {
    selected: ParticipantType;
    onSelect: (type: ParticipantType) => void;
}

export function ParticipantSelector({ selected, onSelect }: Props) {
    const t = useTheme();

    return (
        <View style={styles.container}>
            {/* Título principal centrado dentro de todo el contenedor */}
            <ThemedText style={[styles.sectionTitle, { color: t.text }]}>
                ¿Cómo vas a participar?
            </ThemedText>

            <View style={styles.row}>
                {/* Opción para seleccionar el tipo Cliente */}
                <TouchableOpacity
                    style={[
                        styles.button,
                        {
                            borderColor: selected === 'Cliente' ? t.primary : t.border,
                            backgroundColor:
                                selected === 'Cliente' ? t.primary + '20' : 'transparent',
                        },
                    ]}
                    onPress={() => onSelect('Cliente')}
                >
                    <MaterialCommunityIcons
                        name="account"
                        size={20}
                        color={selected === 'Cliente' ? t.primary : t.icon}
                    />

                    <ThemedText
                        style={{
                            color: selected === 'Cliente' ? t.primary : t.text,
                            fontWeight: '600',
                        }}
                    >
                        Cliente
                    </ThemedText>
                </TouchableOpacity>

                {/* Opción para seleccionar el tipo Proveedor */}
                <TouchableOpacity
                    style={[
                        styles.button,
                        {
                            borderColor: selected === 'Proveedor' ? t.primary : t.border,
                            backgroundColor:
                                selected === 'Proveedor' ? t.primary + '20' : 'transparent',
                        },
                    ]}
                    onPress={() => onSelect('Proveedor')}
                >
                    <FontAwesome
                        name="wrench"
                        size={20}
                        color={selected === 'Proveedor' ? t.primary : t.icon}
                    />

                    <ThemedText
                        style={{
                            color: selected === 'Proveedor' ? t.primary : t.text,
                            fontWeight: '600',
                        }}
                    >
                        Proveedor
                    </ThemedText>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    // Espacio inferior para separar este selector de la siguiente sección.
    container: {
        marginBottom: 20,
        width: '100%',
    },

    // El ancho completo permite que textAlign centre el título respecto al contenedor.
    sectionTitle: {
        width: '100%',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        textAlign: 'center',
    },

    // Coloca Cliente y Proveedor en una misma fila.
    row: {
        flexDirection: 'row',
        gap: 12,
    },

    // Cada botón ocupa la mitad disponible y centra su icono y texto.
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderWidth: 1,
        borderRadius: 10,
    },
});