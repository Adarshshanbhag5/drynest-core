import { registerAs } from '@nestjs/config';

function cleanPemKey(pemKey?: string): string {
  return pemKey ? pemKey.replace(/\\n/gm, '\n') : '';
}

export default registerAs('authConfig', () => ({
  jwtSecret: cleanPemKey(process.env.JWT_PRIVATE_KEY),
  jwtPublicKey: cleanPemKey(process.env.JWT_PUBLIC_KEY),
}));

export interface AuthConfig {
  jwtSecret: string;
  jwtPublicKey: string;
}
