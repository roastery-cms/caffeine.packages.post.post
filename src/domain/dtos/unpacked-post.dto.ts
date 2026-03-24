import { UnpackedPostTagDTO } from "@roastery-capsules/post.post-tag/domain/dtos";
import { UnpackedPostTypeDTO } from "@roastery-capsules/post.post-type/domain/dtos";
import { EntityDTO } from "@roastery/beans/entity/dtos";
import { t } from "@roastery/terroir";

export const UnpackedPostDTO = t.Composite(
	[
		t.Object(
			{
				tags: t.Array(UnpackedPostTagDTO),
				name: t.String({
					description: "The name or title of the post.",
					examples: ["My First Post"],
					minLength: 1,
				}),
				slug: t.String({
					description:
						"The unique slug identifier for the post (e.g., 'my-adventures').",
					examples: ["my-adventures"],
				}),
				description: t.String({
					description: "A brief summary or description of the post content.",
					examples: ["This is a summary of the post content."],
				}),
				cover: t.String({
					description: "The URL or path to the cover image of the post.",
					examples: ["https://example.com/cover.jpg"],
					format: "url",
				}),
				type: UnpackedPostTypeDTO,
			},
			{
				description: "Data transfer object used for building a post entity.",
			},
		),
		EntityDTO,
	],
	{
		description: "Data transfer object used for building a post entity.",
	},
);

export type UnpackedPostDTO = t.Static<typeof UnpackedPostDTO>;
