import { useState } from 'react';
import { RequestProviderCapacityUseCase } from '@/application/auth/RequestProviderCapacityUseCase';
import { API_BASE_URL } from '@/constants/api';
import { ApiAuthAdapter } from '@/infrastructure/auth/ApiAuthAdapter';
import { useSession } from '@/presentation/auth/SessionContext';

const authRepository = new ApiAuthAdapter(API_BASE_URL);
const requestProviderCapacityUseCase = new RequestProviderCapacityUseCase(authRepository);

export function useRequestProviderCapacity() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setSession } = useSession();

  const requestProvider = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const session = await requestProviderCapacityUseCase.execute();
      setSession(session);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo habilitar el modo proveedor.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { requestProvider, loading, error };
}
