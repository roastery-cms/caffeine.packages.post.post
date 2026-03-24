import type { IPostReader } from "@/domain/types/repositories/post-reader.interface";
import type { FindPostTypeService } from "../services";
import type { CountPostsUseCase } from "./count-posts.use-case";

export class FindManyPostsUseCase {
	public constructor(
		private readonly reader: IPostReader,
		private readonly findPostType: FindPostTypeService,
		private readonly countPosts: CountPostsUseCase,
	) {}

	public async run(page: number = 1, postTypeId?: string) {
		const { count, totalPages } = await this.countPosts.run(postTypeId);

		if (!postTypeId)
			return {
				count,
				totalPages,
				value: await this.reader.findMany(page),
			};

		const postType = await this.findPostType.run(postTypeId);
		return {
			count,
			totalPages,
			value: await this.reader.findManyByPostType(postType.id, page),
		};
	}
}
