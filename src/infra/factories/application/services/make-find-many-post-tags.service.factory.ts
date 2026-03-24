import { FindManyPostTagsService } from "@/application/services";
import type { IPostTagRepository } from "@/domain/types/repositories";

export function makeFindManyPostTagsService(
	repository: IPostTagRepository,
): FindManyPostTagsService {
	return new FindManyPostTagsService(repository);
}
