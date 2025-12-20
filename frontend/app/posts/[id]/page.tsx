import PostDetail from "../../../../frontend/features/posts/components/PostDetail";
import { getPostsId } from "@/api/posts";

interface Props {
  params: { id: string } | Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const id = Number((await params).id);
  const post = await getPostsId(id);

  return <PostDetail postId={id} initialPost={post} />;
}
