import { makeDeletePostUseCase } from "@/infra/factories/application/use-cases/delete-post.use-case.factory";
import { PostRepositoryPlugin } from "../plugins";
import type { IControllersWithAuth } from "./types";
import { Post } from "@/domain";
import { baristaAuth } from "@roastery-capsules/auth/plugins/guards";
import { EntitySource } from "@roastery/beans/entity/symbols";
import { IdOrSlugDTO } from "@roastery/seedbed/presentation/dtos";
import { t } from "@roastery/terroir";
import { barista } from "@roastery/barista";

export function DeletePostController({
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
		.derive({ as: "local" }, ({ postRepository }) => ({
			deletePost: makeDeletePostUseCase(postRepository),
		}))
		.delete(
			"/:id-or-slug",
			async ({ params, deletePost, status }) => {
				const response = await deletePost.run(params["id-or-slug"]);
				return status(204, response as never);
			},
			{
				params: IdOrSlugDTO,
				detail: {
					summary: "Delete post",
					description:
						"Permanently removes a post resource. The post can be identified by either its unique UUID or its slug. Authentication is required.",
				},
				response: {
					204: t.Undefined(),
				},
			},
		);
}
