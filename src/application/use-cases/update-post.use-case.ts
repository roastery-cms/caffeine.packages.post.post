import type { IPostWriter } from "@/domain/types/repositories/post-writer.interface";
import type { IPostUniquenessCheckerService } from "@/domain/types/services";
import type { UpdatePostDTO } from "../dtos";
import type { IPost } from "@/domain/types";
import type { FindPostUseCase } from "./find-post.use-case";
import { Post } from "@/domain";
import type { FindManyPostTagsService } from "../services";
import { EntitySource } from "@roastery/beans/entity/symbols";
import {
	ResourceAlreadyExistsException,
	ResourceNotFoundException,
} from "@roastery/terroir/exceptions/application";
import { slugify } from "@roastery/beans/entity/helpers";

export class UpdatePostUseCase {
	public constructor(
		private readonly writer: IPostWriter,
		private readonly findPost: FindPostUseCase,
		private readonly findPostTags: FindManyPostTagsService,
		private readonly postUniquenessChecker: IPostUniquenessCheckerService,
	) {}

	public async run(
		idOrSlug: string,
		{ cover, description, name, tags: _tags }: UpdatePostDTO,
		updateSlug: boolean = false,
	): Promise<IPost> {
		const targetPost = await this.findPost.run(idOrSlug);

		if (!targetPost) throw new ResourceNotFoundException(Post[EntitySource]);

		if (name) targetPost.rename(name);
		if (name && updateSlug) {
			await this.validateSlugUniqueness(targetPost, name);
			targetPost.reslug(name);
		}
		if (description) targetPost.updateDescription(description);
		if (cover) targetPost.updateCover(cover);
		if (_tags) {
			const tags = await this.findPostTags.run(_tags);
			targetPost.updateTags(tags);
		}

		await this.writer.update(targetPost);

		return targetPost;
	}

	private async validateSlugUniqueness(post: IPost, value: string) {
		value = slugify(value);
		if (post.slug === value) return;

		const isUnique = await this.postUniquenessChecker.run(value);

		if (!isUnique) throw new ResourceAlreadyExistsException(Post[EntitySource]);
	}
}
