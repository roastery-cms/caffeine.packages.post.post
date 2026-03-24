import { FindPostTagService } from "@/application/services";
import type { IPostTagRepository } from "@/domain/types/repositories";

export function makeFindPostTagService(
	repository: IPostTagRepository,
): FindPostTagService {
	return new FindPostTagService(repository);
}
