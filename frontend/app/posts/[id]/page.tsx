import PostDetail from "../../../../frontend/features/posts/components/PostDetail";

interface Props {
  params: { id: string };
}

export default function Page({ params }: Props) {
  const id = Number(params.id);

  return <PostDetail postId={id} />;
}
