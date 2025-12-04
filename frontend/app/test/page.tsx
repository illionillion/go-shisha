import { getPosts } from "@/api/posts";
import { getApiBaseUrl } from "@/lib/api-client";
import { ClientComponent } from "./client-component";

export default async function TestPage() {
  // RSC（サーバー側）でAPIを呼び出し
  let serverData = null;
  let serverError = null;
  let apiBaseUrl = "未設定";

  try {
    apiBaseUrl = getApiBaseUrl();
    const response = await getPosts();
    serverData = response;
  } catch (error) {
    serverError = error instanceof Error ? error.message : "Unknown error";
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API環境変数テスト</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">🖥️ サーバー側（RSC）からのAPI呼び出し</h2>
        <p className="text-sm text-gray-600 mb-2">使用URL: {apiBaseUrl}</p>
        {serverError ? (
          <div className="bg-red-100 p-4 rounded">
            <p className="text-red-700">エラー: {serverError}</p>
          </div>
        ) : (
          <div className="bg-green-100 p-4 rounded">
            <p className="text-green-700">成功！</p>
            <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(serverData, null, 2)}</pre>
          </div>
        )}
      </div>

      <ClientComponent />
    </div>
  );
}
