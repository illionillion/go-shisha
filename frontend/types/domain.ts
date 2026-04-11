// Domain type aliases for generated API models
// Use these aliases in components/hooks instead of importing from '@/api/model/*' directly.

import type { GoShishaBackendInternalModelsAuthResponse } from "@/api/model/goShishaBackendInternalModelsAuthResponse";
import type { GoShishaBackendInternalModelsConflictError } from "@/api/model/goShishaBackendInternalModelsConflictError";
import { GoShishaBackendInternalModelsConflictErrorError } from "@/api/model/goShishaBackendInternalModelsConflictErrorError";
import type { GoShishaBackendInternalModelsCreatePostInput } from "@/api/model/goShishaBackendInternalModelsCreatePostInput";
import type { GoShishaBackendInternalModelsCreateUserInput } from "@/api/model/goShishaBackendInternalModelsCreateUserInput";
import type { GoShishaBackendInternalModelsFlavor } from "@/api/model/goShishaBackendInternalModelsFlavor";
import type { GoShishaBackendInternalModelsForbiddenError } from "@/api/model/goShishaBackendInternalModelsForbiddenError";
import { GoShishaBackendInternalModelsForbiddenErrorError } from "@/api/model/goShishaBackendInternalModelsForbiddenErrorError";
import type { GoShishaBackendInternalModelsLoginInput } from "@/api/model/goShishaBackendInternalModelsLoginInput";
import type { GoShishaBackendInternalModelsNotFoundError } from "@/api/model/goShishaBackendInternalModelsNotFoundError";
import { GoShishaBackendInternalModelsNotFoundErrorError } from "@/api/model/goShishaBackendInternalModelsNotFoundErrorError";
import type { GoShishaBackendInternalModelsPayloadTooLargeError } from "@/api/model/goShishaBackendInternalModelsPayloadTooLargeError";
import { GoShishaBackendInternalModelsPayloadTooLargeErrorError } from "@/api/model/goShishaBackendInternalModelsPayloadTooLargeErrorError";
import type { GoShishaBackendInternalModelsPost } from "@/api/model/goShishaBackendInternalModelsPost";
import type { GoShishaBackendInternalModelsServerError } from "@/api/model/goShishaBackendInternalModelsServerError";
import { GoShishaBackendInternalModelsServerErrorError } from "@/api/model/goShishaBackendInternalModelsServerErrorError";
import type { GoShishaBackendInternalModelsSlide } from "@/api/model/goShishaBackendInternalModelsSlide";
import type { GoShishaBackendInternalModelsSlideInput } from "@/api/model/goShishaBackendInternalModelsSlideInput";
import type { GoShishaBackendInternalModelsUnauthorizedError } from "@/api/model/goShishaBackendInternalModelsUnauthorizedError";
import { GoShishaBackendInternalModelsUnauthorizedErrorError } from "@/api/model/goShishaBackendInternalModelsUnauthorizedErrorError";
import type { GoShishaBackendInternalModelsUpdatePostInput } from "@/api/model/goShishaBackendInternalModelsUpdatePostInput";
import type { GoShishaBackendInternalModelsUpdateSlideInput } from "@/api/model/goShishaBackendInternalModelsUpdateSlideInput";
import type { GoShishaBackendInternalModelsUpdateUserInput } from "@/api/model/goShishaBackendInternalModelsUpdateUserInput";
import type { GoShishaBackendInternalModelsUploadImagesResponse } from "@/api/model/goShishaBackendInternalModelsUploadImagesResponse";
import type { GoShishaBackendInternalModelsUploadProfileImageResponse } from "@/api/model/goShishaBackendInternalModelsUploadProfileImageResponse";
import type { GoShishaBackendInternalModelsUser } from "@/api/model/goShishaBackendInternalModelsUser";
import type { GoShishaBackendInternalModelsValidationError } from "@/api/model/goShishaBackendInternalModelsValidationError";
import { GoShishaBackendInternalModelsValidationErrorError } from "@/api/model/goShishaBackendInternalModelsValidationErrorError";
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
// エラーレスポンス関連
// ========================================
/**
 * バリデーションエラーレスポンス（400 Bad Request）
 * - POST /api/v1/auth/register のバリデーションエラー時に返る
 * - error: "validation_failed"（エラーコード）
 */
export type ValidationError = GoShishaBackendInternalModelsValidationError;
/** ValidationError.error のエラーコード定数 */
export const ValidationErrorCode = GoShishaBackendInternalModelsValidationErrorError;

/**
 * リソース競合エラーレスポンス（409 Conflict）
 * - POST /api/v1/auth/register のメールアドレス重複時: error: "email_already_exists"
 * - POST /api/v1/posts/:id/like のいいね済み時: error: "already_liked"
 * - POST /api/v1/posts/:id/unlike のいいね未実施時: error: "not_liked"
 */
export type ConflictError = GoShishaBackendInternalModelsConflictError;
/** ConflictError.error のエラーコード定数 */
export const ConflictErrorCode = GoShishaBackendInternalModelsConflictErrorError;

/**
 * サーバー内部エラーレスポンス（500 Internal Server Error）
 * - error: "internal_server_error"（エラーコード）
 */
export type ServerError = GoShishaBackendInternalModelsServerError;
/** ServerError.error のエラーコード定数 */
export const ServerErrorCode = GoShishaBackendInternalModelsServerErrorError;

/**
 * 認証エラーレスポンス（401 Unauthorized）
 * - error: "unauthorized"（エラーコード）
 */
export type UnauthorizedError = GoShishaBackendInternalModelsUnauthorizedError;
/** UnauthorizedError.error のエラーコード定数 */
export const UnauthorizedErrorCode = GoShishaBackendInternalModelsUnauthorizedErrorError;

/**
 * 権限エラーレスポンス（403 Forbidden）
 * - POST /api/v1/posts の画像権限エラー時: error: "forbidden"
 */
export type ForbiddenError = GoShishaBackendInternalModelsForbiddenError;
/** ForbiddenError.error のエラーコード定数 */
export const ForbiddenErrorCode = GoShishaBackendInternalModelsForbiddenErrorError;

/**
 * リソース未発見エラーレスポンス（404 Not Found）
 * - error: "not_found"（エラーコード）
 */
export type NotFoundError = GoShishaBackendInternalModelsNotFoundError;
/** NotFoundError.error のエラーコード定数 */
export const NotFoundErrorCode = GoShishaBackendInternalModelsNotFoundErrorError;

/**
 * ファイルサイズ超過エラーレスポンス（413 Request Entity Too Large）
 * - POST /api/v1/uploads/images のファイルサイズ超過時: error: "payload_too_large"
 */
export type PayloadTooLargeError = GoShishaBackendInternalModelsPayloadTooLargeError;
/** PayloadTooLargeError.error のエラーコード定数 */
export const PayloadTooLargeErrorCode = GoShishaBackendInternalModelsPayloadTooLargeErrorError;

// ========================================
// ユーザー関連
// ========================================
/** ユーザー情報 */
export type User = GoShishaBackendInternalModelsUser;

/**
 * プロフィール更新入力（PATCH /api/v1/users/me のリクエストボディ）
 * - display_name: 表示名（省略可）
 * - description: 自己紹介文（省略可）
 * - external_url: 外部URL（省略可、http(s)://...のみ許可）
 * - icon_url: アイコン画像URL（省略可、/images/... または http(s)://...）
 */
export type UpdateUserInput = GoShishaBackendInternalModelsUpdateUserInput;

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

/**
 * 投稿更新入力（スライドの配列を含む）
 * - 既存スライドのテキスト・フレーバーを更新する
 * - 投稿編集フォーム（EditPostModal）で使用
 */
export type UpdatePostInput = GoShishaBackendInternalModelsUpdatePostInput;

/**
 * スライド更新入力（ID・テキスト・フレーバーIDを含む）
 * - id: 必須（更新対象のスライドID）
 * - text: オプション（省略すると空文字で上書き）
 * - flavor_id: オプション（省略またはnullでフレーバー解除）
 * - 投稿編集フォーム（EditPostModal）で使用
 */
export type UpdateSlideInput = GoShishaBackendInternalModelsUpdateSlideInput;

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

/**
 * プロフィール画像アップロードレスポンス（アップロードされた画像のURLを含む）
 * - url: アップロード成功したプロフィール画像のパス
 * - POST /api/v1/uploads/profile-images のレスポンス
 */
export type UploadProfileImageResponse = GoShishaBackendInternalModelsUploadProfileImageResponse;

// ========================================
// フロントエンド専用型（API非依存）
// ========================================
/**
 * 投稿作成フォーム用のスライド編集データ
 * - 画像アップロード〜詳細入力までの状態を管理
 * - PostCreateFormコンポーネントで使用
 */
export type EditableSlide = {
  /** 元のファイルオブジェクト */
  file: File;
  /** プレビュー表示用のBlobURL（URL.createObjectURL生成） */
  previewUrl: string;
  /** 選択されたフレーバーID（未選択時はundefined） */
  flavorId?: number;
  /** 説明文（最大100文字） */
  description: string;
};

// If you need to normalize fields (e.g. date strings, optional fields),
// add converter functions under `frontend/lib/adapters` instead of changing aliases.
