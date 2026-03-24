import type { IPostUniquenessCheckerService } from "@/domain/types/services";
import type { CreatePostDTO } from "../dtos";
import type { IPost } from "@/domain/types";
import { Post } from "@/domain";
import type { FindManyPostTagsService, FindPostTypeService } from "../services";
import type { IPostWriter } from "@/domain/types/repositories/post-writer.interface";
import { EntitySource } from "@roastery/beans/entity/symbols";
import { ResourceAlreadyExistsException } from "@roastery/terroir/exceptions/application";

export class CreatePostUseCase {
	public constructor(
		private readonly writer: IPostWriter,
		private readonly uniquenessChecker: IPostUniquenessCheckerService,
		private readonly findPostType: FindPostTypeService,
		private readonly findManyPostTags: FindManyPostTagsService,
	) {}

	public async run(data: CreatePostDTO): Promise<IPost> {
		const { postTypeId, tags: postTagsIds, ...properties } = data;

		const type = await this.findPostType.run(data.postTypeId);
		const tags = await this.findManyPostTags.run(postTagsIds);

		const targetPost = Post.make({ type, tags, ...properties });

		if (!(await this.uniquenessChecker.run(targetPost.slug)))
			throw new ResourceAlreadyExistsException(Post[EntitySource]);

		await this.writer.create(targetPost);

		return targetPost;
	}
}
