import type {
	IPostRepository,
	IPostTagRepository,
	IPostTypeRepository,
} from "@/domain/types/repositories";
import { barista } from "@roastery/barista";

export function PostRepositoryPlugin(
	postRepository: IPostRepository,
	postTagRepository: IPostTagRepository,
	postTypeRepository: IPostTypeRepository,
) {
	return barista({
		name: "postRepository",
	})
		.decorate("postRepository", postRepository)
		.decorate("postTagRepositoryForPost", postTagRepository)
		.decorate("postTypeRepositoryForPost", postTypeRepository);
}
