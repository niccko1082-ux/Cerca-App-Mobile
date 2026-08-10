import { AuthRepository } from "../../domain/auth/AuthRepository";
import { AuthSession } from "../../domain/auth/User";

export class CheckoutAuthUseCase {
    constructor(private authRepository: AuthRepository) { }

    async execute(): Promise<AuthSession | null>{
        return await this.authRepository.getStoredSession();
    }
}