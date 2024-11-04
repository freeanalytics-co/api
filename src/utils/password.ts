import bcrypt from "bcryptjs";

export async function hash(password: string) {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);

  return hash;
}

export async function verify(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
