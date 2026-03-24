import type { IPostTag } from "@roastery-capsules/post.post-tag/domain/types";
import type { IPostType } from "@roastery-capsules/post.post-type/domain/types";

export interface IConstructorPost {
	type: IPostType;
	name: string;
	slug?: string;
	description: string;
	cover: string;
	tags: IPostTag[];
}
