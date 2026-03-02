import type { IPostTag } from "@caffeine-packages/post.post-tag/domain/types";
import type { IPostType } from "@caffeine-packages/post.post-type/domain/types";

export interface IRawPost {
    readonly name: string;
    readonly slug?: string;
    readonly description: string;
    readonly cover: string;
    readonly tags: IPostTag[];
    readonly type: IPostType;
}
