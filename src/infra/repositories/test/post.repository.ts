import { Post } from "@/domain";
import type { IPost } from "@/domain/types";
import type { IPostRepository } from "@/domain/types/repositories/post-repository.interface";
import { EntitySource } from "@roastery/beans/entity/symbols";
import { MAX_ITEMS_PER_QUERY } from "@roastery/seedbed/constants";
import { ConflictException } from "@roastery/terroir/exceptions/infra";

export class PostRepository implements IPostRepository {
	private posts: Map<string, IPost> = new Map();
	private readonly PAGE_SIZE = MAX_ITEMS_PER_QUERY;

	async create(post: IPost): Promise<void> {
		if (this.posts.has(post.id)) {
			throw new ConflictException(Post[EntitySource]);
		}

		this.posts.set(post.id, post);
	}

	async findById(id: string): Promise<IPost | null> {
		return this.posts.get(id) ?? null;
	}

	async findBySlug(slug: string): Promise<IPost | null> {
		for (const post of this.posts.values()) {
			if (post.slug === slug) {
				return post;
			}
		}
		return null;
	}

	async findManyByIds(ids: string[]): Promise<Array<IPost | null>> {
		return ids.map((id) => this.posts.get(id) ?? null);
	}

	async findMany(page: number): Promise<IPost[]> {
		const allPosts = Array.from(this.posts.values());
		return this.paginate(allPosts, page);
	}

	async findManyByPostType(postTypeId: string, page: number): Promise<IPost[]> {
		const filteredPosts = Array.from(this.posts.values()).filter(
			(post) => post.type.id === postTypeId,
		);
		return this.paginate(filteredPosts, page);
	}

	async update(post: IPost): Promise<void> {
		if (!this.posts.has(post.id)) {
			throw new Error(`Post com ID ${post.id} não encontrado`);
		}

		this.posts.set(post.id, post);
	}

	async delete(post: IPost): Promise<void> {
		if (!this.posts.has(post.id)) {
			throw new Error(`Post com ID ${post.id} não encontrado`);
		}

		this.posts.delete(post.id);
	}

	async count(): Promise<number> {
		return this.posts.size;
	}

	async countByPostType(postTypeId: string): Promise<number> {
		return Array.from(this.posts.values()).filter(
			(post) => post.type.id === postTypeId,
		).length;
	}

	private paginate(items: IPost[], page: number): IPost[] {
		const startIndex = (page - 1) * this.PAGE_SIZE;
		const endIndex = startIndex + this.PAGE_SIZE;
		return items.slice(startIndex, endIndex);
	}

	clear(): void {
		this.posts.clear();
	}

	getAll(): IPost[] {
		return Array.from(this.posts.values());
	}
}
