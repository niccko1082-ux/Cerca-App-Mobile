// src/presentation/auth/hooks/useRegisterForm.ts
import { useState } from 'react';
import { SignUpUseCase } from '@/application/auth/SignUpCase';
import { API_BASE_URL } from '@/constants/api';
import { singUpSchema } from '@/domain/auth/schemas/auth.schema';
import { AuthSession } from '@/domain/auth/User';
import { ApiAuthAdapter } from '@/infrastructure/auth/ApiAuthAdapter';
import { useSession } from '@/presentation/auth/SessionContext';

const authRepository = new ApiAuthAdapter(API_BASE_URL);
const signUpUseCase = new SignUpUseCase(authRepository);

export function useRegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setSession } = useSession();

  const handleNameChange = (text: string) => {
    setName(text);
    if (error) setError(null);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (error) setError(null);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (error) setError(null);
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (error) setError(null);
  };

  const handleRegister = async (): Promise<AuthSession | undefined> => {
    setError(null);

    // 1. Validar que todos los campos estén diligenciados
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Por favor completa todos los campos.');
      return;
    }

    // 2. Validar que las contraseñas coincidan antes de parsear
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    // 3. Validar con el esquema oficial singUpSchema (Zod)
    const validationResult = singUpSchema.safeParse({
      name: name.trim(),
      email: email.trim(),
      password,
    });

    if (!validationResult.success) {
      const firstIssue = validationResult.error.issues[0];
      setError(firstIssue ? firstIssue.message : 'Por favor verifica los campos ingresados.');
      return;
    }

    setLoading(true);
    try {
      const session = await signUpUseCase.execute({
        displayName: name.trim(),
        name: name.trim(),
        email: email.trim(),
        password,
      });
      setSession(session);
      return session;
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Error al registrar el usuario.');
    } finally {
      setLoading(false);
    }
  };

  return {
    name,
    setName: handleNameChange,
    email,
    setEmail: handleEmailChange,
    password,
    setPassword: handlePasswordChange,
    confirmPassword,
    setConfirmPassword: handleConfirmPasswordChange,
    loading,
    error,
    setError,
    handleRegister,
  };
}
