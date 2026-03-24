import type { IPostTypeRepository } from "@/domain/types/repositories/post-type-repository.interface";
import { PostTypeRepository as ApiPostTypeRepository } from "@/infra/repositories/api/post-type.repository";
import { PostTypeRepository as TestPostTypeRepository } from "@/infra/repositories/test/post-type.repository";
import type { AggregatesRepositoryProviderDTO } from "./dtos";

type MakePostTypeRepositoryArgs = {
	target?: AggregatesRepositoryProviderDTO;
	baseUrl: string;
};

export function makePostTypeRepository({
	baseUrl,
	target,
}: MakePostTypeRepositoryArgs): IPostTypeRepository {
	const actions: Record<
		NonNullable<typeof target>,
		() => IPostTypeRepository
	> = {
		API: () => new ApiPostTypeRepository(baseUrl),
		MEMORY: () => new TestPostTypeRepository(),
	};

	if (!target) return actions.MEMORY();

	return actions[target]();
}
