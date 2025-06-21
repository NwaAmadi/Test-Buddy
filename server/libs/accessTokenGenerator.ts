import dotenv from 'dotenv';
dotenv.config();
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION!;

if (!JWT_SECRET || !JWT_EXPIRATION) {
  throw new Error("Missing JWT_SECRET or JWT_EXPIRATION in environment variables.");
}

export async function generateAccessToken(
  data: { email: string; role: string; id: string },
  accessSecret: string = JWT_SECRET,
  accessExp: string = JWT_EXPIRATION
): Promise<{ accessToken: string }> {
  const alg = 'HS256';

  const accessToken = await new jose.SignJWT({
    email: data.email,
    role: data.role,
    id: data.id,
  })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime(accessExp)
    .sign(new TextEncoder().encode(accessSecret));

  return { accessToken };
}
