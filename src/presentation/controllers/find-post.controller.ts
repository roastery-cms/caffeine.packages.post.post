import { makeFindPostUseCase } from "@/infra/factories/application/use-cases";
import type { IControllersWithoutAuth } from "./types";
import { PostRepositoryPlugin } from "../plugins";
import { UnpackedPostDTO } from "@/domain/dtos";
import { barista } from "@roastery/barista";
import { IdOrSlugDTO } from "@roastery/seedbed/presentation/dtos";

export function FindPostController({
	postRepository,
	postTagRepository,
	postTypeRepository,
}: IControllersWithoutAuth) {
	return barista()
		.use(
			PostRepositoryPlugin(
				postRepository,
				postTagRepository,
				postTypeRepository,
			),
		)
		.derive({ as: "local" }, ({ postRepository }) => ({
			findPost: makeFindPostUseCase(postRepository),
		}))
		.get(
			"/:id-or-slug",
			async ({ params, findPost, status }) => {
				const response = await findPost.run(params["id-or-slug"]);
				return status(200, response as never);
			},
			{
				params: IdOrSlugDTO,
				detail: {
					summary: "Find post by ID or Slug",
					description:
						"Retrieves a detailed view of a single post resource. The post can be identified by either its unique UUID or its slug.",
				},
				response: { 200: UnpackedPostDTO },
			},
		);
}
