import type { IPostTag } from "@caffeine-packages/post.post-tag/domain/types";
import type { IEntity } from "@caffeine/entity/types";
import type { UnpackedPostSchema } from "../schemas";
import type { IRawPost } from "./raw-post.interface";

export interface IPost
    extends IEntity<UnpackedPostSchema>, Omit<IRawPost, "slug"> {
    rename(value: string): void;
    reslug(value: string): void;
    updateDescription(value: string): void;
    updateCover(value: string): void;
    updateTags(values: IPostTag[]): void;
    readonly slug: string;
}
