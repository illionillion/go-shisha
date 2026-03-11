import { staticFile } from "remotion";
import type { Post } from "../../types/domain";

/** プロモ動画用モックデータ（backend/db/migrations/0007_update_seed_with_slides.up.sql より） */
export const MOCK_POSTS: Post[] = [
  {
    id: 1,
    user: { id: 1, display_name: "テストユーザー", icon_url: "https://i.pravatar.cc/80?img=11" },
    slides: [
      {
        image_url: staticFile("images/264971_0.jpg"),
        text: "最初はミント。爽やかでスッキリ！",
        flavor: { id: 1, name: "ミント", color: "bg-green-500" },
      },
      {
        image_url: staticFile("images/264972_0.jpg"),
        text: "次はダブルアップル。甘さが絶妙",
        flavor: { id: 2, name: "アップル", color: "bg-red-500" },
      },
      {
        image_url: staticFile("images/264973_0.jpg"),
        text: "最後はベリー。締めにぴったり",
        flavor: { id: 3, name: "ベリー", color: "bg-purple-500" },
      },
    ],
    likes: 12,
    is_liked: false,
  },
  {
    id: 2,
    user: { id: 2, display_name: "シーシャマスター", icon_url: "https://i.pravatar.cc/80?img=12" },
    slides: [
      {
        image_url: staticFile("images/264974_0.jpg"),
        text: "グレープの濃厚な香り",
        flavor: { id: 6, name: "グレープ", color: "bg-indigo-500" },
      },
      {
        image_url: staticFile("images/264975_0.jpg"),
        text: "オレンジでリフレッシュ",
        flavor: { id: 5, name: "オレンジ", color: "bg-orange-500" },
      },
    ],
    likes: 8,
    is_liked: true,
  },
  {
    id: 3,
    user: { id: 1, display_name: "テストユーザー", icon_url: "https://i.pravatar.cc/80?img=11" },
    slides: [
      {
        image_url: staticFile("images/264977_0.jpg"),
        text: "ベリー単体で味わい深い",
        flavor: { id: 3, name: "ベリー", color: "bg-purple-500" },
      },
    ],
    likes: 22,
    is_liked: false,
  },
  {
    id: 4,
    user: { id: 2, display_name: "シーシャマスター", icon_url: "https://i.pravatar.cc/80?img=12" },
    slides: [
      {
        image_url: staticFile("images/264978_0.jpg"),
        text: "マンゴーで夏気分",
        flavor: { id: 4, name: "マンゴー", color: "bg-yellow-500" },
      },
      {
        image_url: staticFile("images/264979_0.jpg"),
        text: "ミントでクールダウン",
        flavor: { id: 1, name: "ミント", color: "bg-green-500" },
      },
    ],
    likes: 15,
    is_liked: false,
  },
  {
    id: 5,
    user: { id: 1, display_name: "テストユーザー", icon_url: "https://i.pravatar.cc/80?img=11" },
    slides: [
      {
        image_url: staticFile("images/264975_0.jpg"),
        text: "オレンジで元気チャージ",
        flavor: { id: 5, name: "オレンジ", color: "bg-orange-500" },
      },
    ],
    likes: 18,
    is_liked: false,
  },
  {
    id: 6,
    user: { id: 2, display_name: "シーシャマスター", icon_url: "https://i.pravatar.cc/80?img=12" },
    slides: [
      {
        image_url: staticFile("images/264976_0.jpg"),
        text: "グレープで濃厚な一服",
        flavor: { id: 6, name: "グレープ", color: "bg-indigo-500" },
      },
      {
        image_url: staticFile("images/264977_0.jpg"),
        text: "ベリーでさっぱり",
        flavor: { id: 3, name: "ベリー", color: "bg-purple-500" },
      },
    ],
    likes: 25,
    is_liked: false,
  },
];

/** 詳細シーン用の featured な投稿 */
export const FEATURED_POST = MOCK_POSTS[0];
