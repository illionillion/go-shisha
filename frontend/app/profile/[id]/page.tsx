import { clsx } from "clsx";
import { notFound } from "next/navigation";
import { getUsersId, getUsersIdPosts } from "@/api/users";
import { BackButton } from "@/components/BackButton";
import { ProfileHeader } from "@/components/ProfileHeader";
import { PostCreateContainer } from "@/features/posts/components/PostCreateContainer";
import { TimelineContainer } from "@/features/posts/components/Timeline";
import { isSuccessResponse } from "@/lib/api-helpers";
import { createServerRequestInit } from "@/lib/server-fetch";

interface Props {
  params: { id: string } | Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  if (Number.isNaN(id) || id <= 0) {
    return (
      <div className={clsx(["p-6", "text-center", "text-gray-600"])}>無効なユーザーIDです</div>
    );
  }

  const requestInit = await createServerRequestInit();

  // Fetch user first; only fetch posts if user exists to avoid unnecessary requests.
  // Let unexpected errors bubble to `app/error.tsx`.
  // apiFetchがエラー時にthrowするためresponseは常に成功レスポンスだが、
  // TypeScriptの型推論のためにisSuccessResponseで明示的に絞り込む
  const userResponse = await getUsersId(id, requestInit);

  if (!isSuccessResponse(userResponse) || !userResponse.data.id) {
    notFound();
  }

  const postsResponse = await getUsersIdPosts(id, requestInit);
  const initialPosts = isSuccessResponse(postsResponse) ? (postsResponse.data.posts ?? []) : [];

  return (
    <div>
      <ProfileHeader
        displayName={userResponse.data.display_name}
        iconUrl={userResponse.data.icon_url}
        bio={userResponse.data.description}
        externalUrl={userResponse.data.external_url}
      />
      <main className={clsx(["max-w-3xl", "mx-auto", "py-6"])}>
        <BackButton />
        <TimelineContainer initialPosts={initialPosts} userId={id} />
      </main>
      <PostCreateContainer />
    </div>
  );
}
