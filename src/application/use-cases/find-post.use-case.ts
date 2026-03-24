import type { IPostReader } from "@/domain/types/repositories/post-reader.interface";
import type { IPost } from "@/domain/types";
import type { UnpackedPostDTO } from "@/domain/dtos";
import { Post } from "@/domain";
import type { FindEntityByTypeUseCase } from "@roastery/seedbed/application/use-cases";
import { EntitySource } from "@roastery/beans/entity/symbols";
import { ResourceNotFoundException } from "@roastery/terroir/exceptions/application";

export class FindPostUseCase {
	public constructor(
		private readonly findPostByType: FindEntityByTypeUseCase<
			typeof UnpackedPostDTO,
			IPost,
			IPostReader
		>,
	) {}

	public async run(idOrSlug: string): Promise<IPost> {
		const targetPost = await this.findPostByType.run(
			idOrSlug,
			Post[EntitySource],
		);

		if (!targetPost) throw new ResourceNotFoundException(Post[EntitySource]);

		return targetPost;
	}
}
