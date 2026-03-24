import { CountPostsUseCase } from "@/application/use-cases/count-posts.use-case";
import type { IPostReader } from "@/domain/types/repositories";

export function makeCountPostsUseCase(reader: IPostReader): CountPostsUseCase {
	return new CountPostsUseCase(reader);
}
