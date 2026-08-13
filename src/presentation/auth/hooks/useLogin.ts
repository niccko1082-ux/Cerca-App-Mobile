import { useState } from 'react';

export function useLogin() {
  const [loading, setLoading] = useState(false);

  return {
    loading,
    setLoading,
  };
}
