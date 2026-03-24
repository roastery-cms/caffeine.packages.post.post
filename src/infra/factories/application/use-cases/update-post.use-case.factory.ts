import { UpdatePostUseCase } from "@/application/use-cases/update-post.use-case";
import type {
	IPostRepository,
	IPostTagRepository,
} from "@/domain/types/repositories";
import { makeSlugUniquenessCheckerService } from "../../domain/services";
import { makeFindPostUseCase } from "./find-post.use-case.factory";
import { makeFindManyPostTagsService } from "../services";

export function makeUpdatePostUseCase(
	postRepository: IPostRepository,
	postTagRepository: IPostTagRepository,
): UpdatePostUseCase {
	return new UpdatePostUseCase(
		postRepository,
		makeFindPostUseCase(postRepository),
		makeFindManyPostTagsService(postTagRepository),
		makeSlugUniquenessCheckerService(postRepository),
	);
}
