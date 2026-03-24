import { Post } from "@/domain";
import type { IPostTagRepository } from "@/domain/types/repositories/post-tag-repository.interface";
import type { IPostTag } from "@roastery-capsules/post.post-tag/domain/types";
import { EntitySource } from "@roastery/beans/entity/symbols";
import { ResourceNotFoundException } from "@roastery/terroir/exceptions/application";

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
