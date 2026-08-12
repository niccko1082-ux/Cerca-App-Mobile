// src/application/admin/ModerateReviewUseCase.ts
import { AdminRepository } from '@/domain/admin/AdminRepository';
import { ModerateReviewData } from '@/domain/admin/Report';

export class ModerateReviewUseCase {
  constructor(private adminRepository: AdminRepository) {}

  async execute(data: ModerateReviewData, authorId?: string): Promise<void> {
    if (!data.reviewId) {
      throw new Error('El identificador de la reseña es requerido.');
    }

    // Regla de Cerca.md: review:moderate requiere la capa extra 'no ser el autor'
    if (data.actorId && authorId && data.actorId === authorId) {
      throw new Error('No puedes moderar tu propia reseña.');
    }

    await this.adminRepository.moderateReview(data);
  }
}
