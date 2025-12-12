import { Header } from "../components/Header";
import { TimelineContainer } from "../features/posts/components/TimelineContainer";

/**
 * ホームページ（トップページ）
 * REQUIREMENTS.mdのホーム（タイムライン）仕様を実装
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <TimelineContainer />
      </main>
    </div>
  );
}
