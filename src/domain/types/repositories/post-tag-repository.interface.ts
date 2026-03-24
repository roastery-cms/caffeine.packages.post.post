import type { IPostTag } from "@roastery-capsules/post.post-tag/domain/types";

export interface IPostTagRepository {
	find(idOrSlug: string): Promise<IPostTag | null>;
}
