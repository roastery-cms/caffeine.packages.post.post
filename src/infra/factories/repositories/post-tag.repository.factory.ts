import type { IPostTagRepository } from "@/domain/types/repositories/post-tag-repository.interface";
import { PostTagRepository as ApiPostTagRepository } from "@/infra/repositories/api/post-tag.repository";
import { PostTagRepository as TestPostTagRepository } from "@/infra/repositories/test/post-tag.repository";
import type { AggregatesRepositoryProviderDTO } from "./dtos";

type MakePostTagRepositoryArgs = {
	target?: AggregatesRepositoryProviderDTO;
	baseUrl: string;
};

export function makePostTagRepository({
	baseUrl,
	target,
}: MakePostTagRepositoryArgs): IPostTagRepository {
	const actions: Record<
		NonNullable<typeof target>,
		() => IPostTagRepository
	> = {
		API: () => new ApiPostTagRepository(baseUrl),
		MEMORY: () => new TestPostTagRepository(),
	};

	if (!target) return actions.MEMORY();

	return actions[target]();
}
