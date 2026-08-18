// src/application/admin/ResolveReportUseCase.ts
import { AdminRepository } from '@/domain/admin/AdminRepository';

export class ResolveReportUseCase {
  constructor(private adminRepository: AdminRepository) {}

  async execute(reportId: string): Promise<void> {
    if (!reportId) {
      throw new Error('El identificador del reporte es requerido.');
    }
    await this.adminRepository.resolveReport(reportId);
  }
}
