import { Post } from "@/domain";
import type { IPostTagRepository } from "@/domain/types/repositories/post-tag-repository.interface";
import type { IPostTag } from "@caffeine-packages/post.post-tag/domain/types";
import { EntitySource } from "@caffeine/entity/symbols";
import { ResourceNotFoundException } from "@caffeine/errors/application";

export class FindPostTagService {
    public constructor(private readonly repository: IPostTagRepository) {}

    public async run(idOrSlug: string): Promise<IPostTag> {
        const targetTag = await this.repository.find(idOrSlug);

        if (!targetTag)
            throw new ResourceNotFoundException(
                `${Post[EntitySource]}::tags->${idOrSlug}`,
            );

        return targetTag;
    }
}
