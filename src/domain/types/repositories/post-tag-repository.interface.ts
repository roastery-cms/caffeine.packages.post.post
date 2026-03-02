import type { IPostTag } from "@caffeine-packages/post.post-tag/domain/types";

export interface IPostTagRepository {
    find(idOrSlug: string): Promise<IPostTag | null>;
}
