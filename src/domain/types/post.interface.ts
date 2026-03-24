import type { IEntity } from "@roastery/beans/entity/types";
import type { UnpackedPostSchema } from "../schemas";
import type { IRawPost } from "./raw-post.interface";
import type { IPostTag } from "@roastery-capsules/post.post-tag/domain/types";

export interface IPost extends IEntity<UnpackedPostSchema>, IRawPost {
	rename(value: string): void;
	reslug(value: string): void;
	updateDescription(value: string): void;
	updateCover(value: string): void;
	updateTags(values: IPostTag[]): void;
}
