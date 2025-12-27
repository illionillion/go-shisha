import { getPostsId } from "@/api/posts";
import PostDetail from "@/features/posts/components/PostDetail/PostDetail";

interface Props {
  params: { id: string } | Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const id = Number((await params).id);
  const post = await getPostsId(id);

  return <PostDetail postId={id} initialPost={post} />;
}
