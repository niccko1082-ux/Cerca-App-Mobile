import { useEffect, useState } from "react";
import { AuthSession } from "@/domain/auth/User";
import { ApiAuthAdapter } from "@/infrastructure/auth/ApiAuthAdapter";
import { LocalBiometricAdapter } from "@/infrastructure/auth/LocalBiometricAdapter";
import { BiometricLoginUseCase } from "@/application/auth/BiometricLoginUseCase";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3333';
const authRepository = new ApiAuthAdapter(API_URL);
const biometricRepository = new LocalBiometricAdapter();
const biometricLoginUseCase = new BiometricLoginUseCase(authRepository, biometricRepository);

export function useBiometricLogin() {
    const [available, setAvailable] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const {hasHardware, isEnrolled} = await biometricRepository.getAvailability();
            const storedSession = await authRepository.getStoredSession();
            setAvailable(hasHardware && isEnrolled && !!storedSession);
        })();
    }, []);

    const login = async (): Promise<AuthSession | undefined> => {
        setLoading(true);
        setError(null);
        try {
            return await biometricLoginUseCase.execute();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión con biometría.');
        } finally {
            setLoading(false);
        }
    };

    return { available, loading, error, login };
}
