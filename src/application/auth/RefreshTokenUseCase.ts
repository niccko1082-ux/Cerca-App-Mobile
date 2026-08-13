import { AuthRepository } from '../../domain/auth/AuthRepository';
import { AuthSession } from '../../domain/auth/User';

export class RefreshTokenUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(): Promise<AuthSession> {
    const currentSession = await this.authRepository.getStoredSession();
    if (!currentSession?.refreshToken) {
      throw new Error('No existe un token de refresco válido.');
    }

    const newSession = await this.authRepository.refreshToken(currentSession.refreshToken);
    await this.authRepository.saveSession(newSession);
    return newSession;
  }
}
