import { notFound } from "next/navigation";
import { getUsersId, getUsersIdPosts } from "@/api/users";
import { BackButton } from "@/components/BackButton";
import { ProfileHeader } from "@/components/ProfileHeader";
import { TimelineContainer } from "@/features/posts/components/Timeline";
import { isSuccessResponse } from "@/lib/api-helpers";

interface Props {
  params: { id: string } | Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  if (Number.isNaN(id) || id <= 0) {
    return <div className="p-6 text-center text-gray-600">無効なユーザーIDです</div>;
  }

  // Fetch user first; only fetch posts if user exists to avoid unnecessary requests.
  // Let unexpected errors bubble to `app/error.tsx`.
  // apiFetchがエラー時にthrowするためresponseは常に成功レスポンスだが、
  // TypeScriptの型推論のためにisSuccessResponseで明示的に絞り込む
  const userResponse = await getUsersId(id);
  const postsResponse = await getUsersIdPosts(id);

  if (!isSuccessResponse(userResponse) || !userResponse.data.id) {
    notFound();
  }

  const initialPosts = isSuccessResponse(postsResponse) ? (postsResponse.data.posts ?? []) : [];

  return (
    <div>
      <ProfileHeader user={userResponse.data} />
      <main className="max-w-3xl mx-auto py-6">
        <BackButton />
        <TimelineContainer initialPosts={initialPosts} userId={id} />
      </main>
    </div>
  );
}
