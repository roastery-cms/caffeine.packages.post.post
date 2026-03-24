import type { IPostRepository } from "@/domain/types/repositories/post-repository.interface";
import type { FindPostUseCase } from "./find-post.use-case";
import { Post } from "@/domain";
import { EntitySource } from "@roastery/beans/entity/symbols";
import { ResourceNotFoundException } from "@roastery/terroir/exceptions/application";

export class DeletePostUseCase {
	public constructor(
		private readonly writer: IPostRepository,
		private readonly findPost: FindPostUseCase,
	) {}

	public async run(idOrSlug: string): Promise<void> {
		const targetPost = await this.findPost.run(idOrSlug);

		if (!targetPost) throw new ResourceNotFoundException(Post[EntitySource]);

		await this.writer.delete(targetPost);
	}
}
