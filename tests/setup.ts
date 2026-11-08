import '@testing-library/jest-dom/vitest';

try {
  process.loadEnvFile('.env.local');
} catch {
  // Ignora caso .env.local não exista em ambientes de CI
}
