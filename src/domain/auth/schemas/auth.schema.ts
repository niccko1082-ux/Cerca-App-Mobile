import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'El correo es requerido').email('Formato de correo invalido'),
  password: z.string().min(1, 'La contrasena debe tener al menos 6 caracteres'),
});

export const singUpSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().min(1, 'El correo es requerido').email('Formato de correo invalido'),
  password: z
    .string()
    .min(8, 'La contrasena debe almenos contener 8 caracteres')
    .regex(/[0-9]/, 'Debe contener almnenos un numero ')
    .regex(/[A-Z]/, 'Debe contener al menos una letra mayuscula'),
});

export type LoginDTO = z.infer<typeof loginSchema>;
export type SingUpDTO = z.infer<typeof singUpSchema>;
