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
  telefone: z.string().min(10, 'Telefone/WhatsApp inválido'),
  email: z.string().email('E-mail inválido').or(z.literal('')),
  distribuidora: z.string().min(1, 'Selecione a distribuidora'),
  valorFatura: z.number().positive('Informe o valor da fatura'),
  consumoMedio: z.number().nonnegative().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
});

export const clienteSignupSchema = z.object({
  nomeCompleto: z.string().trim().min(2, 'Nome é obrigatório').max(120),
  telefone: z.string().trim().min(10, 'Telefone inválido').max(20),
  whatsapp: z.string().trim().min(10, 'WhatsApp inválido').max(20),
  email: z.string().trim().email('E-mail inválido').max(160),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres').max(72),
  cidade: z.string().trim().min(2, 'Cidade é obrigatória').max(80),
  estado: z.string().trim().length(2, 'Selecione o estado'),
  cpfCnpj: z.string().trim().min(11, 'CPF/CNPJ inválido').max(20),
  tipoCliente: z.enum(['residencial', 'empresarial']),
});

export type ClienteFormValues = z.infer<typeof clienteFormSchema>;
export type SimulacaoPublicaValues = z.infer<typeof simulacaoPublicaSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type ClienteSignupValues = z.infer<typeof clienteSignupSchema>;
