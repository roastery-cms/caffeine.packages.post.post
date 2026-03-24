import type { IPost } from "@/domain/types";
import { Post } from "@/domain";
import { parsePrismaDateTimeToISOString } from "@roastery-adapters/post/helpers";
import type { IPostType } from "@roastery-capsules/post.post-type/domain/types";
import { PostTag } from "@roastery-capsules/post.post-tag/domain";
import type { IPostTag } from "@roastery-capsules/post.post-tag/domain/types";
import { PostType } from "@roastery-capsules/post.post-type/domain";

type Tag = {
	id: string;
	createdAt: Date;
	updatedAt: Date | null;
	name: string;
	slug: string;
	hidden: boolean;
};

type PostPrismaDefaultOutput = {
	id: string;
	createdAt: Date;
	updatedAt: Date | null;
	tags: Tag[];
	postType: {
		id: string;
		createdAt: Date;
		updatedAt: Date | null;
		name: string;
		slug: string;
		isHighlighted: boolean;
		schema: string;
	};
	name: string;
	slug: string;
	description: string;
	cover: string;
};

export class PrismaPostMapper {
	public static run(data: PostPrismaDefaultOutput): IPost {
		const {
			tags: _tags,
			postType: _postType,
			id,
			createdAt,
			updatedAt,
			...properties
		} = parsePrismaDateTimeToISOString(data);

		const type = PrismaPostMapper.getType(_postType);
		const tags = PrismaPostMapper.getTags(_tags);

		return Post.make(
			{ ...properties, tags, type },
			{ id, createdAt, updatedAt },
		);
	}

	private static getTags(data: PostPrismaDefaultOutput["tags"]): IPostTag[] {
		return data.map((tag) => {
			const { name, slug, hidden, ...entityProps } =
				parsePrismaDateTimeToISOString(tag);

			return PostTag.make({ name, slug, hidden }, entityProps);
		});
	}
	private static getType(data: PostPrismaDefaultOutput["postType"]): IPostType {
		const { name, schema, slug, isHighlighted, ...entityProps } =
			parsePrismaDateTimeToISOString(data);

		return PostType.make({ name, schema, slug, isHighlighted }, entityProps);
	}
}
