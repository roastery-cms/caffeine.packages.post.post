import { CreatePostDTO } from "@/application/dtos/create-post.dto";
import { makeCreatePostUseCase } from "@/infra/factories/application/use-cases/create-post.use-case.factory";
import { barista } from "@roastery/barista";
import type { IControllersWithAuth } from "./types/controllers-with-auth.interface";
import { Post } from "@/domain";
import { UnpackedPostDTO } from "@/domain/dtos";
import { PostRepositoryPlugin } from "../plugins";
import { EntitySource } from "@roastery/beans/entity/symbols";
import { baristaAuth } from "@roastery-capsules/auth/plugins/guards";

export function CreatePostController({
	cacheProvider,
	jwtSecret,
	postRepository,
	postTagRepository,
	postTypeRepository,
	redisUrl,
}: IControllersWithAuth) {
	return barista()
		.use(
			baristaAuth({
				layerName: Post[EntitySource],
				jwtSecret,
				cacheProvider,
				redisUrl,
			}),
		)
		.use(
			PostRepositoryPlugin(
				postRepository,
				postTagRepository,
				postTypeRepository,
			),
		)
		.derive(
			{ as: "local" },
			({
				postRepository,
				postTagRepositoryForPost,
				postTypeRepositoryForPost,
			}) => ({
				createPost: makeCreatePostUseCase(
					postRepository,
					postTagRepositoryForPost,
					postTypeRepositoryForPost,
				),
			}),
		)
		.post(
			"/",
			async ({ body, createPost, status }) => {
				const response = await createPost.run(body);
				return status(201, response as never);
			},
			{
				body: CreatePostDTO,
				detail: {
					summary: "Create a new post",
					description:
						"Creates a new post resource. The request body must include the post type and necessary metadata. Authentication is required.",
				},
				response: {
					201: UnpackedPostDTO,
				},
			},
		);
}
