import { FindPostUseCase } from "@/application/use-cases/find-post.use-case";
import type { UnpackedPostDTO } from "@/domain/dtos";
import type { IPost } from "@/domain/types";
import type { IPostRepository } from "@/domain/types/repositories";
import { FindEntityByTypeUseCase } from "@roastery/seedbed/application/use-cases";

export function makeFindPostUseCase(
	postRepository: IPostRepository,
): FindPostUseCase {
	return new FindPostUseCase(
		new FindEntityByTypeUseCase<typeof UnpackedPostDTO, IPost, IPostRepository>(
			postRepository,
		),
	);
}
