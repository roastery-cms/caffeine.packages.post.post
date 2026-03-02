import { ResourceNotFoundException } from "@caffeine/errors/application";
import type { IPostReader } from "@/domain/types/repositories/post-reader.interface";
import type { IPost } from "@/domain/types";
import type { UnpackedPostDTO } from "@/domain/dtos";
import type { FindEntityByTypeUseCase } from "@caffeine/application/use-cases";
import { Post } from "@/domain";
import { EntitySource } from "@caffeine/entity/symbols";

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

        if (!targetPost)
            throw new ResourceNotFoundException(Post[EntitySource]);

        return targetPost;
    }
}
