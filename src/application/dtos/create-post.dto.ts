import { t } from "@roastery/terroir";

export const CreatePostDTO = t.Object(
	{
		postTypeId: t.String({
			format: "uuid",
			description:
				"The unique identifier of the post type that categorizes this post.",
			examples: ["550e8400-e29b-41d4-a716-446655440000"],
		}),
		tags: t.Array(
			t.String({
				format: "uuid",
			}),
			{
				description:
					"A list of tag IDs to associate with the post for categorization and filtering.",
				examples: [
					[
						"550e8400-e29b-41d4-a716-446655440000",
						"6ba7b810-9dad-11d1-80b4-00c04fd430c8",
					],
				],
			},
		),
		name: t.String({
			description: "The title of the post that will be displayed to users.",
			examples: ["Getting Started with TypeScript", "My First Blog Post"],
			minLength: 1,
		}),
		description: t.String({
			description:
				"A detailed description or summary of the post content that provides context to readers.",
			examples: [
				"This post covers the basics of TypeScript and how to get started with it.",
			],
		}),
		cover: t.String({
			description:
				"The URL or path to the cover image that will be displayed as the post thumbnail.",
			examples: [
				"https://example.com/images/typescript-cover.jpg",
				"/uploads/covers/my-post-cover.png",
			],
			format: "url",
		}),
	},
	{
		description:
			"Data transfer object for creating a new post, containing all required fields for post creation.",
	},
);

export type CreatePostDTO = t.Static<typeof CreatePostDTO>;
