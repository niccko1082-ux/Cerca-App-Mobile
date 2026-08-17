import { AuthRepository } from '../../domain/auth/AuthRepository';
import { AuthSession } from '../../domain/auth/User';

export class RequestProviderCapacityUseCase {
  constructor(private authRepository: AuthRepository) {}

  // Cerca.md: POST /me/capacities/provider es autoservicio (sesión), sin aprobación.
  async execute(): Promise<AuthSession> {
    const current = await this.authRepository.getStoredSession();
    if (!current) {
      throw new Error('No hay una sesión activa.');
    }

    await this.authRepository.requestProviderCapacity();

    // El backend guarda la capacidad nueva en la cuenta, pero el accessToken vigente
    // lleva las capacidades viejas embebidas en sus claims (GET /v1/me las lee del
    // token, no en vivo de la base). Sin refrescar, el cliente se cree proveedor pero
    // el servidor seguiría autorizando como si no lo fuera.
    const refreshed = await this.authRepository.refreshToken(current.refreshToken);
    await this.authRepository.saveSession(refreshed);
    return refreshed;
  }
}
