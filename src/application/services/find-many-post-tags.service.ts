import type { IPostTagRepository } from "@/domain/types/repositories/post-tag-repository.interface";
import type { IPostTag } from "@caffeine-packages/post.post-tag/domain/types";
import { FindPostTagService } from "./find-post-tag.service";

export class FindManyPostTagsService {
    private readonly findById: FindPostTagService;

    public constructor(private readonly repository: IPostTagRepository) {
        this.findById = new FindPostTagService(repository);
    }

    public async run(tags: string[]): Promise<IPostTag[]> {
        return Promise.all(tags.map((tag) => this.findById.run(tag)));
    }
}
