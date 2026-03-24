import { FindManyPostsUseCase } from "@/application/use-cases/find-many-posts.use-case";
import type {
	IPostRepository,
	IPostTypeRepository,
} from "@/domain/types/repositories";
import { makeFindPostTypeService } from "../services";
import { makeCountPostsUseCase } from "./count-posts.use-case.factory";

export function makeFindManyPostsUseCase(
	postRepository: IPostRepository,
	postTypeRepository: IPostTypeRepository,
): FindManyPostsUseCase {
	return new FindManyPostsUseCase(
		postRepository,
		makeFindPostTypeService(postTypeRepository),
		makeCountPostsUseCase(postRepository),
	);
}
