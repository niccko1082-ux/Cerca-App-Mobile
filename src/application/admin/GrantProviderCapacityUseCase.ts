// src/application/admin/GrantProviderCapacityUseCase.ts
import { AdminRepository } from '@/domain/admin/AdminRepository';

export class GrantProviderCapacityUseCase {
  constructor(private adminRepository: AdminRepository) {}

  async execute(userId: string): Promise<void> {
    if (!userId) {
      throw new Error('El identificador del usuario es requerido.');
    }
    await this.adminRepository.grantProviderCapacity(userId);
  }
}
