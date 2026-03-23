"use client";

import { useMemo, useState } from "react";
import { useGetPosts } from "@/api/posts";
import { useGetUsersIdPosts } from "@/api/users";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useDeletePost } from "@/features/posts/hooks/useDeletePost";
import { useLike } from "@/features/posts/hooks/useLike";
import { getUserPostsErrorMessage } from "@/features/posts/utils/userPostsErrors";
import { isSuccessResponse } from "@/lib/api-helpers";
import { useConfirm } from "@/lib/useConfirm";
import type { Flavor, Post } from "@/types/domain";
import { EditPostModal } from "../EditPostModal";
import { Timeline } from "./Timeline";

interface TimelineContainerProps {
  initialPosts?: Post[];
  /** optional: when provided, load posts for this user */
  userId?: number;
}

/**
 * TimelineContainerコンポーネント
 * データ取得、フィルタリング、Timeline表示を統合するコンテナコンポーネント
 * - RSCから initialPosts を受け取った場合はそれを使用（SSR最適化）
 * - initialPosts がない場合は useGetPosts でクライアント取得
 * - フレーバーによる絞り込み機能を提供
 */
export function TimelineContainer({ initialPosts, userId }: TimelineContainerProps) {
  const [selectedFlavorIds, setSelectedFlavorIds] = useState<number[]>([]);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const currentUser = useAuthStore((state) => state.user);

  // ユーザーページであればそのユーザーの投稿を取得、そうでなければ全投稿を取得
  const usersHook = useGetUsersIdPosts(userId ?? 0, {
    query: {
      enabled: !!userId,
      refetchInterval: 60000,
    },
  });

  const postsHook = useGetPosts({
    query: {
      enabled: userId == null,
      refetchInterval: 60000,
    },
  });

  const response = userId != null ? usersHook.data : postsHook.data;
  const isLoading = userId != null ? usersHook.isLoading : postsHook.isLoading;
  const error = userId != null ? usersHook.error : postsHook.error;
  const errorMessage = userId != null && error ? getUserPostsErrorMessage(error) : undefined;

  const posts = useMemo(() => {
    // Orval 8.x: レスポンスから成功時のデータを取り出す
    if (response && isSuccessResponse(response)) {
      return response.data.posts ?? [];
    }
    return initialPosts ?? [];
  }, [response, initialPosts]);

  // 投稿から一意のフレーバー一覧を抽出
  const availableFlavors = useMemo(() => {
    const flavorMap = new Map<number, Flavor>();
    posts.forEach((post) => {
      post.slides?.forEach((slide) => {
        if (slide.flavor && slide.flavor.id) {
          flavorMap.set(slide.flavor.id, slide.flavor);
        }
      });
    });
    return Array.from(flavorMap.values());
  }, [posts]);

  // フレーバーで絞り込んだ投稿
  const filteredPosts = useMemo(() => {
    if (selectedFlavorIds.length === 0) {
      return posts;
    }
    return posts.filter((post) => {
      return post.slides?.some(
        (slide) => slide.flavor?.id && selectedFlavorIds.includes(slide.flavor.id)
      );
    });
  }, [posts, selectedFlavorIds]);

  /**
   * フレーバー選択切り替え
   */
  const handleFlavorToggle = (flavorId: number) => {
    setSelectedFlavorIds((prev) =>
      prev.includes(flavorId) ? prev.filter((id) => id !== flavorId) : [...prev, flavorId]
    );
  };

  const { onLike, onUnlike } = useLike();
  const confirm = useConfirm();

  const { onDelete } = useDeletePost();

  /** 削除確認ダイアログを経由した削除ハンドラー */
  const handleDelete = async (postId: number) => {
    const ok = await confirm("この投稿を削除しますか？\nこの操作は取り消せません。");
    if (ok) {
      onDelete(postId);
    }
  };

  /** 編集モーダルを開く */
  const handleEdit = (postId: number) => {
    setEditingPostId(postId);
  };

  /** 編集対象の投稿を取得 */
  const editingPost = editingPostId != null ? posts.find((p) => p.id === editingPostId) : null;

  return (
    <>
      <Timeline
        posts={filteredPosts}
        isLoading={!initialPosts && isLoading}
        error={error}
        errorMessage={errorMessage}
        availableFlavors={availableFlavors}
        selectedFlavorIds={selectedFlavorIds}
        onFlavorToggle={handleFlavorToggle}
        onLike={onLike}
        onUnlike={onUnlike}
        currentUserId={currentUser?.id ?? null}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />

      {/* 投稿編集モーダル */}
      {editingPost?.id != null && (editingPost.slides?.length ?? 0) > 0 && (
        <EditPostModal
          postId={editingPost.id}
          slides={editingPost.slides ?? []}
          onClose={() => setEditingPostId(null)}
          onCancel={() => setEditingPostId(null)}
        />
      )}
    </>
  );
}
