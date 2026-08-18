// src/application/admin/GetReportsUseCase.ts
import { AdminRepository } from '@/domain/admin/AdminRepository';
import { Report } from '@/domain/admin/Report';

export class GetReportsUseCase {
  constructor(private adminRepository: AdminRepository) {}

  async execute(): Promise<Report[]> {
    return this.adminRepository.getReports();
  }
}
