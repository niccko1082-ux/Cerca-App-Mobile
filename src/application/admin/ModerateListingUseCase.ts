// src/application/admin/ModerateListingUseCase.ts
import { AdminRepository } from '@/domain/admin/AdminRepository';
import { ModerateListingData } from '@/domain/admin/Report';

export class ModerateListingUseCase {
  constructor(private adminRepository: AdminRepository) {}

  async execute(data: ModerateListingData): Promise<void> {
    if (!data.listingId) {
      throw new Error('El identificador del anuncio es requerido.');
    }
    await this.adminRepository.moderateListing(data);
  }
}
