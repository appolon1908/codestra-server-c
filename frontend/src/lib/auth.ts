const ACCESS_TOKEN_KEY = "accessToken";

type JwtPayload = {
  exp?: number;
};

const decodePayload = (token: string): JwtPayload | null => {
  const payload = token.split(".")[1];
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(normalized)) as JwtPayload;
  } catch {
    return null;
  }
};

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

export const setAccessToken = (token: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const clearAccessToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const hasUsableAccessToken = () => {
  const token = getAccessToken();
  if (!token) return false;

  const payload = decodePayload(token);
  if (!payload) return false;
  if (typeof payload.exp !== "number") return true;

  return payload.exp * 1000 > Date.now();
};
