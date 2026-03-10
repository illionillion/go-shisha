interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: number;
}

export function Avatar({ src, alt = "ユーザー", size = 32 }: AvatarProps) {
  const style = { width: size, height: size, borderRadius: "50%", objectFit: "cover" as const };

  if (src) {
    return <img src={src} alt={alt} style={style} />;
  }

  // デフォルトアバター（イニシャル）
  const initial = alt.charAt(0).toUpperCase();
  return (
    <div
      style={{
        ...style,
        backgroundColor: "#6366f1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: size * 0.4,
        fontWeight: "bold",
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}
