import { z } from 'zod';

export const clienteFormSchema = z.object({
  nomeCompleto: z.string().min(2, 'Nome é obrigatório'),
  telefone: z.string().min(10, 'Telefone inválido'),
  whatsapp: z.string().optional(),
  email: z.string().email('E-mail inválido').or(z.literal('')),
  cpfCnpj: z.string().min(11, 'CPF/CNPJ inválido'),
});

export const simulacaoPublicaSchema = z.object({
  nome: z.string().min(2, 'Nome é obrigatório'),
  telefone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  cpfCnpj: z.string().min(11, 'CPF/CNPJ inválido'),
  distribuidora: z.string().min(1, 'Selecione a distribuidora'),
  valorFatura: z.number().positive('Informe o valor da fatura'),
});

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
});

export type ClienteFormValues = z.infer<typeof clienteFormSchema>;
export type SimulacaoPublicaValues = z.infer<typeof simulacaoPublicaSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
