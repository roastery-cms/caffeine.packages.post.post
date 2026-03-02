import type { IPost } from "@/domain/types";
import type { IPostReader } from "@/domain/types/repositories/post-reader.interface";
import type { FindPostTypeService } from "../services";

export class FindManyPostsUseCase {
    public constructor(
        private readonly reader: IPostReader,
        private readonly findPostType: FindPostTypeService,
    ) {}

    public async run(page: number = 1, postTypeId?: string): Promise<IPost[]> {
        if (!postTypeId) return await this.reader.findMany(page);

        const postType = await this.findPostType.run(postTypeId);
        return await this.reader.findManyByPostType(postType.id, page);
    }
}
