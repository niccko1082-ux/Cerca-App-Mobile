// src/application/admin/SuspendUserUseCase.ts
import { AdminRepository } from '@/domain/admin/AdminRepository';
import { SuspendUserData } from '@/domain/admin/Report';

export class SuspendUserUseCase {
  constructor(private adminRepository: AdminRepository) {}

  async execute(data: SuspendUserData): Promise<void> {
    if (!data.userId) {
      throw new Error('El identificador de usuario es requerido.');
    }
    await this.adminRepository.suspendUser(data);
  }
}
