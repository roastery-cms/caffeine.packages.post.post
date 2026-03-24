import { DeletePostUseCase } from "@/application/use-cases/delete-post.use-case";
import type { IPostRepository } from "@/domain/types/repositories";
import { makeFindPostUseCase } from "./find-post.use-case.factory";

export function makeDeletePostUseCase(
	postRepository: IPostRepository,
): DeletePostUseCase {
	return new DeletePostUseCase(
		postRepository,
		makeFindPostUseCase(postRepository),
	);
}
