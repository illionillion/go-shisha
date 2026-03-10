import type { Post } from "@/types/domain";

/** プロモ動画用モックデータ */
export const MOCK_POSTS: Post[] = [
  {
    id: 1,
    user: { id: 1, display_name: "Yuki", icon_url: undefined },
    slides: [
      {
        image_url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=600&fit=crop",
        text: "アフターミント×ダブルアップルが最高すぎる☁️",
        flavor: { id: 1, name: "アフターミント", color: "#34d399" },
      },
      {
        image_url: "https://images.unsplash.com/photo-1544378730-8b5104b18790?w=400&h=600&fit=crop",
        text: "煙の量がえぐい！！",
        flavor: { id: 2, name: "ダブルアップル", color: "#f87171" },
      },
    ],
    likes: 42,
    is_liked: false,
  },
  {
    id: 2,
    user: { id: 2, display_name: "Hana", icon_url: undefined },
    slides: [
      {
        image_url:
          "https://images.unsplash.com/photo-1567327613485-fdc40538c2e4?w=400&h=600&fit=crop",
        text: "ブルーベリーミントでまったりナイト🫐",
        flavor: { id: 3, name: "ブルーベリーミント", color: "#818cf8" },
      },
    ],
    likes: 28,
    is_liked: true,
  },
  {
    id: 3,
    user: { id: 3, display_name: "Sora", icon_url: undefined },
    slides: [
      {
        image_url:
          "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=600&fit=crop",
        text: "ピーチキングで渋谷な夜🍑✨",
        flavor: { id: 4, name: "ピーチキング", color: "#fb923c" },
      },
      {
        image_url:
          "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400&h=600&fit=crop",
        text: "お気に入りの場所でお気に入りの味",
        flavor: { id: 5, name: "シトラスキング", color: "#facc15" },
      },
    ],
    likes: 15,
    is_liked: false,
  },
  {
    id: 4,
    user: { id: 4, display_name: "Riku", icon_url: undefined },
    slides: [
      {
        image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=600&fit=crop",
        text: "コーヒーベースで落ち着く時間☕",
        flavor: { id: 6, name: "ミロタバコ", color: "#92400e" },
      },
    ],
    likes: 67,
    is_liked: true,
  },
  {
    id: 5,
    user: { id: 5, display_name: "Mio", icon_url: undefined },
    slides: [
      {
        image_url: "https://images.unsplash.com/photo-1543353071-873f17a7a088?w=400&h=600&fit=crop",
        text: "グレープミントでフレッシュな気分🍇",
        flavor: { id: 7, name: "グレープミント", color: "#a855f7" },
      },
    ],
    likes: 33,
    is_liked: false,
  },
  {
    id: 6,
    user: { id: 6, display_name: "Ao", icon_url: undefined },
    slides: [
      {
        image_url:
          "https://images.unsplash.com/photo-1500856056032-8b90e3b897ab?w=400&h=600&fit=crop",
        text: "ピナコラーダで南国気分🌴",
        flavor: { id: 8, name: "ピナコラーダ", color: "#f9a8d4" },
      },
    ],
    likes: 51,
    is_liked: false,
  },
];

/** 詳細シーン用の featured な投稿 */
export const FEATURED_POST = MOCK_POSTS[0];
