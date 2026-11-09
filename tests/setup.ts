import '@testing-library/jest-dom/vitest';
import dns from 'node:dns';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Ignora se não for suportado
}

try {
  process.loadEnvFile('.env.local');
} catch {
  // Ignora caso .env.local não exista em ambientes de CI
}
