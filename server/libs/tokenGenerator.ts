import * as jose from 'jose';
import { TokenPair  } from '../types/interface';

export async function generateTokens(
  data: { email: string; role: string; id: string },
  accessSecret: string,
  refreshSecret: string,
  accessExp: string,
  refreshExp: string
): Promise<TokenPair> {
    if (!data.email || !data.role) {
    throw new Error('MISSING REQUIRED DATA');
    }
  const alg = 'HS256';

  const accessToken = await new jose.SignJWT({ email: data.email, role: data.role, id: data.id })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime(accessExp)
    .sign(new TextEncoder().encode(accessSecret));

  const refreshToken = await new jose.SignJWT({ email: data.email, role: data.role, id: data.id })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime(refreshExp)
    .sign(new TextEncoder().encode(refreshSecret));

  return { accessToken, refreshToken };
}