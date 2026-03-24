import type { IPostTypeRepository } from "@/domain/types/repositories/post-type-repository.interface";
import type { IPostType } from "@roastery-capsules/post.post-type/domain/types";

export class PostTypeRepository implements IPostTypeRepository {
	private types: Map<string, IPostType> = new Map();

	async find(idOrSlug: string): Promise<IPostType | null> {
		const byId = this.types.get(idOrSlug);
		if (byId) return byId;

		for (const type of this.types.values()) {
			if (type.slug === idOrSlug) {
				return type;
			}
		}

		return null;
	}

	seed(types: IPostType[]): void {
		for (const type of types) {
			this.types.set(type.id, type);
		}
	}

	clear(): void {
		this.types.clear();
	}

	getAll(): IPostType[] {
		return Array.from(this.types.values());
	}

	count(): number {
		return this.types.size;
	}
}
