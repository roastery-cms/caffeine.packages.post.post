import type { IPostTag } from "@roastery-capsules/post.post-tag/domain/types";
import type { IPostType } from "@roastery-capsules/post.post-type/domain/types";

export interface IRawPost {
	readonly name: string;
	readonly slug: string;
	readonly description: string;
	readonly cover: string;
	readonly tags: IPostTag[];
	readonly type: IPostType;
}
