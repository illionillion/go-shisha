// サーバー起動時に1回だけ実行される（next build 時は実行されない）
export async function register() {
  if (!process.env.REDIRECT_SECRET) {
    throw new Error("REDIRECT_SECRET is not set. Please set it as a runtime environment variable.");
  }
}
