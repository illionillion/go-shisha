// Domain type aliases for generated API models
// Use these aliases in components/hooks instead of importing from '@/api/model/*' directly.

import type { GoShishaBackendInternalModelsAuthResponse } from "@/api/model/goShishaBackendInternalModelsAuthResponse";
import type { GoShishaBackendInternalModelsCreatePostInput } from "@/api/model/goShishaBackendInternalModelsCreatePostInput";
import type { GoShishaBackendInternalModelsCreateUserInput } from "@/api/model/goShishaBackendInternalModelsCreateUserInput";
import type { GoShishaBackendInternalModelsFlavor } from "@/api/model/goShishaBackendInternalModelsFlavor";
import type { GoShishaBackendInternalModelsLoginInput } from "@/api/model/goShishaBackendInternalModelsLoginInput";
import type { GoShishaBackendInternalModelsPost } from "@/api/model/goShishaBackendInternalModelsPost";
import type { GoShishaBackendInternalModelsSlide } from "@/api/model/goShishaBackendInternalModelsSlide";
import type { GoShishaBackendInternalModelsSlideInput } from "@/api/model/goShishaBackendInternalModelsSlideInput";
import type { GoShishaBackendInternalModelsUploadImagesResponse } from "@/api/model/goShishaBackendInternalModelsUploadImagesResponse";
import type { GoShishaBackendInternalModelsUser } from "@/api/model/goShishaBackendInternalModelsUser";
import type { PostAuthLogout200 } from "@/api/model/postAuthLogout200";
import type { PostPosts400 as GeneratedPostPosts400 } from "@/api/model/postPosts400";

// ========================================
// 認証関連
// ========================================
/** ログインレスポンス（アクセストークン・リフレッシュトークン・ユーザー情報を含む） */
export type AuthResponse = GoShishaBackendInternalModelsAuthResponse;

/** ユーザー登録入力（email, password, display_name） */
export type CreateUserInput = GoShishaBackendInternalModelsCreateUserInput;

/** ログイン入力（email, password） */
export type LoginInput = GoShishaBackendInternalModelsLoginInput;

/** ログアウトレスポンス */
export type LogoutResponse = PostAuthLogout200;

// ========================================
// ユーザー関連
// ========================================
/** ユーザー情報 */
export type User = GoShishaBackendInternalModelsUser;

// ========================================
// 投稿関連
// ========================================
/** 投稿情報（スライド・ユーザー・いいね数を含む） */
export type Post = GoShishaBackendInternalModelsPost;

/** スライド情報（画像URL・テキスト・フレーバーを含む） */
export type Slide = GoShishaBackendInternalModelsSlide;

/**
 * 投稿作成入力（スライドの配列を含む）
 * - 最小1枚、最大10枚のスライドを含む
 * - 投稿作成モーダル（PostCreateModal）で使用
 */
export type CreatePostInput = GoShishaBackendInternalModelsCreatePostInput;

/**
 * スライド作成入力（画像URL・テキスト・フレーバーIDを含む）
 * - image_url: 必須（アップロード済みの画像パス）
 * - text: オプション（最大100文字）
 * - flavor_id: オプション（選択されたフレーバーのID）
 * - スライド編集UI（SlideEditor）で使用
 */
export type SlideInput = GoShishaBackendInternalModelsSlideInput;

/** 投稿作成時のバリデーションエラーレスポンス */
export type PostPosts400 = GeneratedPostPosts400;

// ========================================
// フレーバー関連
// ========================================
/**
 * フレーバー情報（ID・名前・カラーを含む）
 * - フレーバー選択UI（FlavorSelector）で使用
 * - GET /api/v1/flavors で取得
 */
export type Flavor = GoShishaBackendInternalModelsFlavor;

// ========================================
// 画像アップロード関連
// ========================================
/**
 * 画像アップロードレスポンス（アップロードされた画像のURLリストを含む）
 * - urls: アップロード成功した画像のパス配列
 * - POST /api/v1/uploads/images のレスポンス
 * - 画像アップロードUI（ImageUploader）で使用
 */
export type UploadImagesResponse = GoShishaBackendInternalModelsUploadImagesResponse;

// If you need to normalize fields (e.g. date strings, optional fields),
// add converter functions under `frontend/lib/adapters` instead of changing aliases.
