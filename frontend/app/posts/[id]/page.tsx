import { getPostsId } from "@/api/posts";
import PostDetail from "@/features/posts/components/PostDetail/PostDetail";
import { isSuccessResponse } from "@/lib/api-helpers";

interface Props {
  params: { id: string } | Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const id = Number((await params).id);
  const response = await getPostsId(id);
  const initialPost = isSuccessResponse(response) ? response.data : undefined;

  return <PostDetail postId={id} initialPost={initialPost} />;
}
