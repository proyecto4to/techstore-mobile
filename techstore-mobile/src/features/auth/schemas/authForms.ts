import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z.email('Ingresá un correo válido.').max(255),
  password: z.string().min(1, 'Ingresá tu contraseña.').max(100),
});

export type LoginForm = z.infer<typeof loginFormSchema>;

export const registerFormSchema = z
  .object({
    nombre: z.string().trim().min(1, 'Ingresá tu nombre.').max(100),
    apellido: z.string().trim().min(1, 'Ingresá tu apellido.').max(100),
    email: z.email('Ingresá un correo válido.').max(255),
    password: z
      .string()
      .min(8, 'Usá al menos 8 caracteres.')
      .max(100)
      .regex(/[a-z]/, 'Incluí una minúscula.')
      .regex(/[A-Z]/, 'Incluí una mayúscula.')
      .regex(/\d/, 'Incluí un número.'),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden.',
  });

export type RegisterForm = z.infer<typeof registerFormSchema>;
