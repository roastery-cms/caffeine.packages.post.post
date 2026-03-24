import { UpdatePostDTO } from "@/application/dtos/update-post.dto";
import { makeUpdatePostUseCase } from "@/infra/factories/application/use-cases/update-post.use-case.factory";
import { Post } from "@/domain";
import { UnpackedPostDTO } from "@/domain/dtos";
import { PostRepositoryPlugin } from "../plugins";
import { UpdatePostQueryParamsDTO } from "../dtos/update-post-query-params.dto";
import type { IControllersWithAuth } from "./types";
import { barista } from "@roastery/barista";
import { baristaAuth } from "@roastery-capsules/auth/plugins/guards";
import { EntitySource } from "@roastery/beans/entity/symbols";
import { IdOrSlugDTO } from "@roastery/seedbed/presentation/dtos";

export function UpdatePostController({
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
			({ postRepository, postTagRepositoryForPost }) => ({
				updatePost: makeUpdatePostUseCase(
					postRepository,
					postTagRepositoryForPost,
				),
			}),
		)
		.patch(
			"/:id-or-slug",
			async ({ params, body, query, updatePost, status }) =>
				status(
					200,
					(await updatePost.run(
						params["id-or-slug"],
						body,
						query["update-slug"],
					)) as never,
				),
			{
				params: IdOrSlugDTO,
				query: UpdatePostQueryParamsDTO,
				body: UpdatePostDTO,
				detail: {
					summary: "Update post",
					description:
						"Updates an existing post resource. The post can be identified by either its unique UUID or its slug. Only provided fields will be updated. Authentication is required.",
				},
				response: { 200: UnpackedPostDTO },
			},
		);
}
