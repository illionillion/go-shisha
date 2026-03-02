import { cookies } from "next/headers";
import { getPostsId } from "@/api/posts";
import { PostCreateContainer } from "@/features/posts/components/PostCreateContainer";
import PostDetail from "@/features/posts/components/PostDetail/PostDetail";
import { isSuccessResponse } from "@/lib/api-helpers";

interface Props {
  params: { id: string } | Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const id = Number((await params).id);
  const cookieStore = await cookies();
  const response = await getPostsId(id, {
    cache: "no-store",
    headers: {
      Cookie: cookieStore.toString(),
    },
  });
  const initialPost = isSuccessResponse(response) ? response.data : undefined;

  return (
    <>
      <PostDetail postId={id} initialPost={initialPost} />
      <PostCreateContainer />
    </>
  );
}
