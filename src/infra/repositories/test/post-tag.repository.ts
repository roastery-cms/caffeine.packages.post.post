import type { IPostTagRepository } from "@/domain/types/repositories/post-tag-repository.interface";
import type { IPostTag } from "@roastery-capsules/post.post-tag/domain/types";

export class PostTagRepository implements IPostTagRepository {
	private tags: Map<string, IPostTag> = new Map();

	async find(idOrSlug: string): Promise<IPostTag | null> {
		const byId = this.tags.get(idOrSlug);
		if (byId) return byId;

		for (const tag of this.tags.values()) {
			if (tag.slug === idOrSlug) {
				return tag;
			}
		}

		return null;
	}

	seed(tags: IPostTag[]): void {
		for (const tag of tags) {
			this.tags.set(tag.id, tag);
		}
	}

	clear(): void {
		this.tags.clear();
	}

	getAll(): IPostTag[] {
		return Array.from(this.tags.values());
	}

	count(): number {
		return this.tags.size;
	}
}
