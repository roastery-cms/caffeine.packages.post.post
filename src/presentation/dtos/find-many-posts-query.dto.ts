import { PaginationDTO } from "@roastery/seedbed/presentation/dtos";
import { t } from "@roastery/terroir";

export const FindManyPostsQueryDTO = t.Composite(
	[
		PaginationDTO,
		t.Object({
			type: t.Optional(
				t.String({
					description: "Filter posts by post type ID or slug.",
					examples: ["blog", "a1b2c3d4"],
				}),
			),
		}),
	],
	{
		description:
			"Query parameters for listing posts, supporting pagination and optional filtering by post type.",
		examples: [{ page: 1, type: "blog" }],
	},
);

export type FindManyPostsQueryDTO = t.Static<typeof FindManyPostsQueryDTO>;
