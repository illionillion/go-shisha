"use client";

import { clsx } from "clsx";
import { motion } from "framer-motion";

/**
 * 特徴アイテムのProps
 */
interface FeatureItemProps {
  /** アイコン（絵文字） */
  icon: string;
  /** 特徴の説明テキスト */
  text: string;
  /** アニメーション遅延時間（秒） */
  delay: number;
}

/**
 * 特徴アイテムコンポーネント
 */
const FeatureItem = ({ icon, text, delay }: FeatureItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      className={clsx(["flex", "items-center", "gap-3"])}
    >
      <div className={clsx(["flex", "h-12", "w-12", "items-center", "justify-center", "rounded-full", "bg-white/20", "text-2xl"])}>
        {icon}
      </div>
      <p className={clsx(["text-lg", "font-medium"])}>{text}</p>
    </motion.div>
  );
};

/**
 * ブランドセクションコンポーネント
 *
 * @description
 * 認証画面の左側に表示されるブランディングエリア。
 * シーシャのテーマカラーを使用したグラデーション背景に、
 * ロゴ、キャッチコピー、サービスの特徴を表示します。
 *
 * @example
 * ```tsx
 * <BrandSection />
 * ```
 */
export const BrandSection = () => {
  return (
    <div className={clsx(["flex", "h-full", "w-full", "flex-col", "items-center", "justify-center", "gap-12", "bg-gradient-to-br", "from-purple-600", "via-pink-500", "to-orange-400", "p-12", "text-white"])}>
      {/* ロゴ・キャッチコピーエリア */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={clsx(["text-center"])}
      >
        <h1 className={clsx(["text-5xl", "font-bold"])}>Go Shisha</h1>
        <p className={clsx(["mt-4", "text-2xl"])}>あなたのシーシャ体験を共有しよう</p>
      </motion.div>

      {/* 特徴リスト */}
      <div className={clsx(["space-y-6"])}>
        <FeatureItem icon="📸" text="投稿でシェア" delay={0.2} />
        <FeatureItem icon="❤️" text="いいねで交流" delay={0.3} />
        <FeatureItem icon="👥" text="コミュニティ参加" delay={0.4} />
        <FeatureItem icon="🔍" text="お気に入りを発見" delay={0.5} />
      </div>
    </div>
  );
};
