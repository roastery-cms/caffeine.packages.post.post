import { CreatePostUseCase } from "@/application/use-cases/create-post.use-case";
import type {
	IPostRepository,
	IPostTagRepository,
	IPostTypeRepository,
} from "@/domain/types/repositories";
import { makeSlugUniquenessCheckerService } from "../../domain/services";
import {
	makeFindManyPostTagsService,
	makeFindPostTypeService,
} from "../services";

export function makeCreatePostUseCase(
	postRepository: IPostRepository,
	postTagRepository: IPostTagRepository,
	postTypeRepository: IPostTypeRepository,
): CreatePostUseCase {
	const uniquenessChecker = makeSlugUniquenessCheckerService(postRepository);
	const findPostType = makeFindPostTypeService(postTypeRepository);
	const findManyPostTags = makeFindManyPostTagsService(postTagRepository);

	return new CreatePostUseCase(
		postRepository,
		uniquenessChecker,
		findPostType,
		findManyPostTags,
	);
}
