import { AuthRepository } from '../../domain/auth/AuthRepository';

export class SignOutUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(): Promise<void> {
    try {
      await this.authRepository.signOut();
    } catch {
      // Cerca.md: la red es intermitente. Cerrar sesión localmente no puede depender
      // de que el servidor responda — se ignora el error y se limpia igual abajo.
    } finally {
      // Garantiza que la sesión local se limpie aunque el servidor falle o no responda
      await this.authRepository.saveSession({
        accessToken: '',
        refreshToken: '',
        user: { id: '', email: '' },
      });
    }
  }
}
