// src/presentation/auth/hooks/useLoginForm.ts
import { useState } from 'react';
import { ParticipantType, Role } from '@/domain/auth/User';

export function useLoginForm() {
  const [participantType, setParticipantType] = useState<ParticipantType>('Cliente');
  const [role, setRole] = useState<Role>('MODERATOR');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      console.log('Iniciando sesión con:', { participantType, role, email, password });
      // Aquí se conectará con el SignInUseCase
    } finally {
      setLoading(false);
    }
  };

  return {
    participantType,
    setParticipantType,
    role,
    setRole,
    email,
    setEmail,
    password,     
    setPassword,  
    loading,
    handleSubmit,
  };
}