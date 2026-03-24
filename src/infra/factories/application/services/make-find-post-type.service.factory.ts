import { FindPostTypeService } from "@/application/services";
import type { IPostTypeRepository } from "@/domain/types/repositories";

export function makeFindPostTypeService(
	repository: IPostTypeRepository,
): FindPostTypeService {
	return new FindPostTypeService(repository);
}
