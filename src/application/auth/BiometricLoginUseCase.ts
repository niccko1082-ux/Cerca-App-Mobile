import { AuthRepository } from '@/domain/auth/AuthRepository';
import { BiometricRepository } from '@/domain/auth/BiometricRepository';
import { AuthSession } from '@/domain/auth/User';

export class BiometricLoginUseCase {
  constructor(
    private authRepository: AuthRepository,
    private biometricRepository: BiometricRepository,
  ) {}

  async execute(): Promise<AuthSession> {
    const session = await this.authRepository.getStoredSession();
    if (!session) {
      throw new Error('No hay sesion guardada para desbloquear.');
    }

    const { hasHardware, isEnrolled } = await this.biometricRepository.getAvailability();
    if (!hasHardware || !isEnrolled) {
      throw new Error('La Biometria no esta disponible en este dispositivo');
    }

    const succes = await this.biometricRepository.authenticate(
      'Inicia sesion con tu huella o rostro',
    );
    if (!succes) {
      throw new Error('No se puede verifica tu identidad.');
    }

    return session;
  }
}
