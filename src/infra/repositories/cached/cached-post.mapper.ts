import { Post } from "@/domain";
import type { IPost, IUnpackedPost } from "@/domain/types";
import { PostTag } from "@roastery-capsules/post.post-tag/domain";
import type {
	IPostTag,
	IUnpackedPostTag,
} from "@roastery-capsules/post.post-tag/domain/types";
import { PostType } from "@roastery-capsules/post.post-type/domain";
import type {
	IPostType,
	IUnpackedPostType,
} from "@roastery-capsules/post.post-type/domain/types";
import { InvalidDomainDataException } from "@roastery/terroir/exceptions/domain";
import { UnexpectedCacheValueException } from "@roastery/terroir/exceptions/infra";

export class CachedPostMapper {
	public static run(key: string, data: string): IPost {
		const {
			name,
			slug,
			cover,
			description,
			tags: _tags,
			type: _type,
			...entityProps
		}: IUnpackedPost & {
			tags: IUnpackedPostTag[];
			type: IUnpackedPostType;
		} = JSON.parse(data);

		const tags = CachedPostMapper.getTags(_tags);
		const type = CachedPostMapper.getType(_type);

		try {
			return Post.make(
				{ name, slug, cover, tags, type, description },
				entityProps,
			);
		} catch (err: unknown) {
			if (err instanceof InvalidDomainDataException)
				throw new UnexpectedCacheValueException(key, err.source, err.message);

			throw err;
		}
	}

	private static getTags(data: IUnpackedPostTag[]): IPostTag[] {
		return data.map(({ hidden, name, slug, ...properties }: IUnpackedPostTag) =>
			PostTag.make({ name, hidden, slug }, properties),
		);
	}

	private static getType(data: IUnpackedPostType): IPostType {
		const { id, createdAt, updatedAt, ...properties } = data;
		return PostType.make(properties, { id, createdAt, updatedAt });
	}
}
