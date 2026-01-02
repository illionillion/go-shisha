import { getUsersId, getUsersIdPosts } from "@/api/users";
import { BackButton } from "@/components/BackButton";
import { ProfileHeader } from "@/components/ProfileHeader";
import { TimelineContainer } from "@/features/posts/components/Timeline";

interface Props {
  params: { id: string } | Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const id = Number((await params).id);

  const [user, postsResp] = await Promise.all([getUsersId(id), getUsersIdPosts(id)]);

  if (!user || !user.id) {
    return <div className="p-6 text-center text-gray-600">ユーザーが見つかりませんでした</div>;
  }

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
