// Domain type aliases for generated API models
// Use these aliases in components/hooks instead of importing from '@/api/model/*' directly.

import type { GoShishaBackendInternalModelsFlavor } from "@/api/model/goShishaBackendInternalModelsFlavor";
import type { GoShishaBackendInternalModelsPost } from "@/api/model/goShishaBackendInternalModelsPost";
import type { GoShishaBackendInternalModelsSlide } from "@/api/model/goShishaBackendInternalModelsSlide";
import type { GoShishaBackendInternalModelsUser } from "@/api/model/goShishaBackendInternalModelsUser";
import type { PostPosts400 as GeneratedPostPosts400 } from "@/api/model/postPosts400";

export type Flavor = GoShishaBackendInternalModelsFlavor;
export type User = GoShishaBackendInternalModelsUser;
export type Post = GoShishaBackendInternalModelsPost;
export type Slide = GoShishaBackendInternalModelsSlide;
export type PostPosts400 = GeneratedPostPosts400;

// If you need to normalize fields (e.g. date strings, optional fields),
// add converter functions under `frontend/lib/adapters` instead of changing aliases.
