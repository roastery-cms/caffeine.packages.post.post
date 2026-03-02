import type { IPostRepository } from "@/domain/types/repositories/post-repository.interface";
import { ResourceNotFoundException } from "@caffeine/errors/application";
import type { FindPostUseCase } from "./find-post.use-case";
import { EntitySource } from "@caffeine/entity/symbols";
import { Post } from "@/domain";

export class DeletePostUseCase {
    public constructor(
        private readonly writer: IPostRepository,
        private readonly findPost: FindPostUseCase,
    ) {}

    public async run(idOrSlug: string): Promise<void> {
        const targetPost = await this.findPost.run(idOrSlug);

        if (!targetPost)
            throw new ResourceNotFoundException(Post[EntitySource]);

        await this.writer.delete(targetPost);
    }
}
