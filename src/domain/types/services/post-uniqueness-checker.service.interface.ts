import type { UnpackedPostSchema } from "@/domain/schemas";
import type { IPost } from "../post.interface";
import type { SlugUniquenessCheckerService } from "@roastery/seedbed/domain/services";

export type IPostUniquenessCheckerService = SlugUniquenessCheckerService<
	UnpackedPostSchema,
	IPost
>;
