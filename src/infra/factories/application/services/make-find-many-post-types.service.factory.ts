import { FindManyPostTypesService } from "@/application/services";
import type { IPostTypeRepository } from "@/domain/types/repositories";

export function makeFindManyPostTypesService(
	repository: IPostTypeRepository,
): FindManyPostTypesService {
	return new FindManyPostTypesService(repository);
}
