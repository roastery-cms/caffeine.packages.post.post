import type {
	IPostRepository,
	IPostTypeRepository,
	IPostTagRepository,
} from "@/domain/types/repositories";

export interface IControllersWithoutAuth {
	postRepository: IPostRepository;
	postTypeRepository: IPostTypeRepository;
	postTagRepository: IPostTagRepository;
}
