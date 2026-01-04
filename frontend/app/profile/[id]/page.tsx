import { notFound } from "next/navigation";
import { getUsersId, getUsersIdPosts } from "@/api/users";
import { BackButton } from "@/components/BackButton";
import { ProfileHeader } from "@/components/ProfileHeader";
import { TimelineContainer } from "@/features/posts/components/Timeline";

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
  const user = await getUsersId(id);

  if (!user || !user.id) {
    notFound();
  }

  const postsResp = await getUsersIdPosts(id);
  const initialPosts = postsResp?.posts ?? [];

  return (
    <div>
      <ProfileHeader user={user} />
      <main className="max-w-3xl mx-auto py-6">
        <BackButton />
        <TimelineContainer initialPosts={initialPosts} userId={id} />
      </main>
    </div>
  );
}
