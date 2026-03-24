import type { IPostUniquenessCheckerService } from "@/domain/types/services";
import type { IPostReader } from "@/domain/types/repositories";
import { SlugUniquenessCheckerService } from "@roastery/seedbed/domain/services";

export function makeSlugUniquenessCheckerService(
	repository: IPostReader,
): IPostUniquenessCheckerService {
	return new SlugUniquenessCheckerService(repository);
}
