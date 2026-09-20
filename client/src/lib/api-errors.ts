export function normalizeApiErrorMessage(error: unknown): string {
  const fallback = "Não foi possível concluir a operação no momento. Tente novamente em instantes.";

  if (!(error instanceof Error)) return fallback;

  const message = error.message ?? "";

  if (!message) return fallback;

  const htmlResponsePattern = /Unexpected token '<'|<!DOCTYPE|<html|<body|not valid JSON/i;

  if (htmlResponsePattern.test(message)) {
    return "O servidor respondeu com uma página de erro em vez de JSON. Isso normalmente indica que a API está indisponível ou houve um problema de configuração. Tente novamente em instantes ou verifique se a aplicação backend está no ar.";
  }

  if (message.toLowerCase().includes("failed to fetch")) {
    return "Não foi possível conectar com o servidor. Verifique sua conexão e tente novamente.";
  }

  if (message.toLowerCase().includes("email")) {
    return message;
  }

  return message;
}
