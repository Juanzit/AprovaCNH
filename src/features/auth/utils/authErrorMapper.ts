export interface TranslatedAuthError {
  message: string;
  isEmailNotConfirmed: boolean;
}

/**
 * Traduz mensagens de erro da API de autenticação do Supabase (em inglês)
 * para mensagens claras e orientadoras em português.
 */
export function translateSupabaseAuthError(rawMessage: string): TranslatedAuthError {
  const normalized = (rawMessage || '').trim().toLowerCase();

  if (normalized.includes('email not confirmed')) {
    return {
      message:
        'Seu e-mail ainda não foi confirmado. Acesse o link enviado para sua caixa de entrada ou solicite um novo e-mail de confirmação.',
      isEmailNotConfirmed: true,
    };
  }

  if (normalized.includes('invalid login credentials')) {
    return {
      message: 'E-mail ou senha incorretos. Verifique seus dados e tente novamente.',
      isEmailNotConfirmed: false,
    };
  }

  if (normalized.includes('already registered') || normalized.includes('already been registered')) {
    return {
      message: 'Este e-mail já possui cadastro. Acesse a tela de login ou recupere sua senha.',
      isEmailNotConfirmed: false,
    };
  }

  if (normalized.includes('password should be at least')) {
    return {
      message: 'A senha deve conter no mínimo 6 caracteres.',
      isEmailNotConfirmed: false,
    };
  }

  if (normalized.includes('rate limit') || normalized.includes('for security purposes')) {
    return {
      message: 'Muitas tentativas em sequência. Aguarde alguns instantes e tente novamente.',
      isEmailNotConfirmed: false,
    };
  }

  return {
    message: 'Não foi possível concluir a autenticação no momento. Verifique seus dados e tente novamente.',
    isEmailNotConfirmed: false,
  };
}
