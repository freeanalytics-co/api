type JWTPayload = {
  sub: string;
  email: string;
};

type Variables = {
  jwt: JWTPayload | null;
};

export type THono = { Bindings: Env; Variables: Variables };
