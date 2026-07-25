const store = new Map<string, number>();
const tokenTimestamps = new Map<string, number>();
const TOKEN_LIFETIME = 5 * 60 * 1000;

export const captchaStore = {
  set(token: string, answer: number) {
    store.set(token, answer);
    tokenTimestamps.set(token, Date.now());
  },
  get(token: string): number | undefined {
    const timestamp = tokenTimestamps.get(token);
    if (timestamp && Date.now() - timestamp > TOKEN_LIFETIME) {
      store.delete(token);
      tokenTimestamps.delete(token);
      return undefined;
    }
    return store.get(token);
  },
  delete(token: string) {
    store.delete(token);
    tokenTimestamps.delete(token);
  },
};