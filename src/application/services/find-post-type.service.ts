import { Post } from "@/domain";
import type { IPostTypeRepository } from "@/domain/types/repositories/post-type-repository.interface";
import type { IPostType } from "@caffeine-packages/post.post-type/domain/types";
import { EntitySource } from "@caffeine/entity/symbols";
import { ResourceNotFoundException } from "@caffeine/errors/application";

export class FindPostTypeService {
    public constructor(private readonly repository: IPostTypeRepository) {}

    public async run(idOrSlug: string): Promise<IPostType> {
        const postType = await this.repository.find(idOrSlug);

        if (!postType)
            throw new ResourceNotFoundException(
                `${Post[EntitySource]}::postType->${idOrSlug}`,
            );

        return postType;
    }
}
