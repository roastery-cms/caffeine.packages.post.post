import type { IPostType } from "@roastery-capsules/post.post-type/domain/types";

export interface IPostTypeRepository {
	find(idOrSlug: string): Promise<IPostType | null>;
}
