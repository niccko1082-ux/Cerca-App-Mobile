import { AuthRepository } from '../../domain/auth/AuthRepository';
import { loginSchema, LoginDTO } from '@/domain/auth/schemas/auth.schema';

export class LoginUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(input: LoginDTO) {
    // Si los datos no cumplen con el schema, parse() lanza un ZodError automáticamente
    const validatedInput = loginSchema.parse(input);

    const session = await this.authRepository.signIn(validatedInput.email, validatedInput.password);

    await this.authRepository.saveSession(session);

    return session;
  }
}
