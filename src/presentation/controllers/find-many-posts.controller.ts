import { makeFindManyPostsUseCase } from "@/infra/factories/application/use-cases/find-many-posts.use-case.factory";
import type { IControllersWithoutAuth } from "./types";
import { PostRepositoryPlugin } from "../plugins";
import { FindManyPostsQueryDTO, FindManyPostsResponseDTO } from "../dtos";
import { barista } from "@roastery/barista";

export function FindManyPostsController({
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
		.derive(
			{ as: "local" },
			({ postRepository, postTypeRepositoryForPost }) => ({
				findManyPosts: makeFindManyPostsUseCase(
					postRepository,
					postTypeRepositoryForPost,
				),
			}),
		)
		.get(
			"/",
			async ({ findManyPosts, query: { page, type }, set, status }) => {
				const { count, totalPages, value } = await findManyPosts.run(
					page,
					type,
				);

				set.headers["X-Total-Count"] = String(count);
				set.headers["X-Total-Pages"] = String(totalPages);

				return status(200, value as never);
			},
			{
				query: FindManyPostsQueryDTO,
				detail: {
					summary: "List all posts",
					description:
						"Retrieves a paginated list of posts. Supports optional filtering by post type using the 'type' query parameter. Results are ordered by creation date.",
				},
				response: { 200: FindManyPostsResponseDTO },
			},
		);
}
