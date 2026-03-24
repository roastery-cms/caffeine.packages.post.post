import type { IPostTypeRepository } from "@/domain/types/repositories/post-type-repository.interface";
import { FindPostTypeService } from "./find-post-type.service";
import type { IPostType } from "@roastery-capsules/post.post-type/domain/types";

export class FindManyPostTypesService {
	private readonly findById: FindPostTypeService;

	public constructor(readonly repository: IPostTypeRepository) {
		this.findById = new FindPostTypeService(repository);
	}

	public async run(ids: string[]): Promise<IPostType[]> {
		return Promise.all(ids.map((id) => this.findById.run(id)));
	}
}
