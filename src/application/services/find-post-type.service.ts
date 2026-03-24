import { Post } from "@/domain";
import type { IPostTypeRepository } from "@/domain/types/repositories/post-type-repository.interface";
import type { IPostType } from "@roastery-capsules/post.post-type/domain/types";
import { EntitySource } from "@roastery/beans/entity/symbols";
import { ResourceNotFoundException } from "@roastery/terroir/exceptions/application";

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
