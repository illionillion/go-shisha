/** Remotion 内で共有する型定義（next依存なし） */

export interface Flavor {
  id?: number;
  name?: string;
  color?: string;
}

export interface User {
  id?: number;
  display_name?: string;
  icon_url?: string | null;
  email?: string;
  bio?: string;
  created_at?: string;
}

export interface Slide {
  image_url: string;
  text?: string;
  flavor?: Flavor;
}

export interface Post {
  id?: number;
  user_id?: number;
  user?: User;
  slides?: Slide[];
  likes?: number;
  is_liked?: boolean;
  created_at?: string;
}
