import type { IPostType } from "@caffeine-packages/post.post-type/domain/types";

export interface IPostTypeRepository {
    find(idOrSlug: string): Promise<IPostType | null>;
}
