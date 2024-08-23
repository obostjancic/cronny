export const getEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing env var: ${key}`);
  }

  return value;
};

export const isProd = getEnv("NODE_ENV") === "production";
