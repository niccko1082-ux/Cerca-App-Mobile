import { AuthRepository } from '../../domain/auth/AuthRepository';
import { AuthSession, SignUpData } from '../../domain/auth/User';

export class SignUpUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(data: SignUpData): Promise<AuthSession> {
    if (!data.email || !data.password) {
      throw new Error('El correo y la contraseña son requeridos.');
    }
    const session = await this.authRepository.signUp(data);
    await this.authRepository.saveSession(session);
    return session;
  }
}
