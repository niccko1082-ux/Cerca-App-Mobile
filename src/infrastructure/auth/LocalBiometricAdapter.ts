import * as LocalAuthentication from 'expo-local-authentication';
import { BiometricAvailability, BiometricRepository } from '@/domain/auth/BiometricRepository';

export class LocalBiometricAdapter implements BiometricRepository {
  async getAvailability(): Promise<BiometricAvailability> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return { hasHardware, isEnrolled };
  }

  async authenticate(promptMessage: string): Promise<boolean> {
    const result = await LocalAuthentication.authenticateAsync({ promptMessage });
    return result.success;
  }
}
