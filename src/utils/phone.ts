/** Converte telefone brasileiro para formato wa.me (somente dígitos, com DDI 55). */
export function telefoneParaWhatsApp(telefone: string): string {
  const digits = telefone.replace(/\D/g, '');
  if (digits.length === 0) return '';
  if (digits.startsWith('55') && digits.length >= 12) return digits;
  if (digits.length >= 10) return `55${digits}`;
  return digits;
}

export function linkWhatsApp(telefone: string, mensagem: string): string {
  const numero = telefoneParaWhatsApp(telefone);
  const text = encodeURIComponent(mensagem);
  return numero ? `https://wa.me/${numero}?text=${text}` : `https://wa.me/?text=${text}`;
}
