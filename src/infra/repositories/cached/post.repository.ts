import type { IPost } from "@/domain/types";
import type { IPostRepository } from "@/domain/types/repositories/post-repository.interface";
import { CachedPostMapper } from "./cached-post.mapper";
import { Post } from "@/domain";
import { CACHE_EXPIRATION_TIME } from "@roastery/seedbed/constants";
import type { BaristaCacheInstance } from "@roastery-adapters/cache";
import { SafeCache } from "@roastery-adapters/cache/decorators";
import { EntitySource } from "@roastery/beans/entity/symbols";
import { Mapper } from "@roastery/beans";

export class PostRepository implements IPostRepository {
	private postCacheExpirationTime: number = CACHE_EXPIRATION_TIME.SAFE;

	constructor(
		private readonly repository: IPostRepository,
		private readonly cache: BaristaCacheInstance,
	) {}

	@SafeCache(Post[EntitySource])
	async create(post: IPost): Promise<void> {
		await this.repository.create(post);

		await this.invalidateListCache();
	}

	async findById(id: string): Promise<IPost | null> {
		const storedPost = await this.cache.get(`${Post[EntitySource]}::$${id}`);

		if (storedPost)
			return CachedPostMapper.run(`${Post[EntitySource]}::$${id}`, storedPost);

		const targetPost = await this.repository.findById(id);

		if (!targetPost) return null;

		await this.cachePost(targetPost);

		return targetPost;
	}

	async findBySlug(slug: string): Promise<IPost | null> {
		const storedId = await this.cache.get(`${Post[EntitySource]}::${slug}`);

		if (storedId) {
			const post = await this.findById(storedId);

			if (post && post.slug === slug) return post;
		}

		const targetPost = await this.repository.findBySlug(slug);

		if (!targetPost) return null;

		await this.cachePost(targetPost);

		return targetPost;
	}

	async findMany(page: number): Promise<IPost[]> {
		const key = `${Post[EntitySource]}:page::${page}`;
		const storedIds = await this.cache.get(key);

		if (storedIds) {
			const ids: string[] = JSON.parse(storedIds);
			const posts = await this.findManyByIds(ids);

			if (posts.every((post): post is IPost => post !== null)) return posts;

			await this.cache.del(key);
		}

		const targetPosts = await this.repository.findMany(page);

		await Promise.all(targetPosts.map((post) => this.cachePost(post)));

		await this.cache.set(
			key,
			JSON.stringify(targetPosts.map((post) => post.id)),
			"EX",
			this.postCacheExpirationTime,
		);

		return targetPosts;
	}

	async findManyByIds(ids: string[]): Promise<Array<IPost | null>> {
		if (ids.length === 0) return [];

		const keys = ids.map((id) => `${Post[EntitySource]}::$${id}`);
		const cachedValues = await this.cache.mget(...keys);

		const postsMap = new Map<string, IPost>();
		const missedIds: string[] = [];

		for (let i = 0; i < ids.length; i++) {
			const id = ids[i];
			if (!id) continue;

			const cached = cachedValues[i];

			if (cached) {
				try {
					const post = CachedPostMapper.run(
						`${Post[EntitySource]}::$${id}`,
						cached,
					);
					postsMap.set(id, post);
				} catch {
					missedIds.push(id);
				}
			} else {
				missedIds.push(id);
			}
		}

		if (missedIds.length > 0) {
			const fetchedPosts = await this.repository.findManyByIds(missedIds);

			for (const post of fetchedPosts) {
				if (post) {
					await this.cachePost(post);
					postsMap.set(post.id, post);
				}
			}
		}

		return ids.map((id) => postsMap.get(id) ?? null);
	}

	async findManyByPostType(postTypeId: string, page: number): Promise<IPost[]> {
		const key = `${Post[EntitySource]}:type::$${postTypeId}:page::${page}`;
		const storedIds = await this.cache.get(key);

		if (storedIds) {
			const ids: string[] = JSON.parse(storedIds);
			const posts = await this.findManyByIds(ids);

			if (posts.every((post): post is IPost => post !== null)) return posts;

			await this.cache.del(key);
		}

		const targetPosts = await this.repository.findManyByPostType(
			postTypeId,
			page,
		);

		await Promise.all(targetPosts.map((post) => this.cachePost(post)));

		await this.cache.set(
			key,
			JSON.stringify(targetPosts.map((post) => post.id)),
			"EX",
			this.postCacheExpirationTime,
		);

		return targetPosts;
	}

	async update(post: IPost): Promise<void> {
		const _cachedPost = await this.cache.get(
			`${Post[EntitySource]}::$${post.id}`,
		);

		if (_cachedPost) {
			const cachedPost: IPost = CachedPostMapper.run(
				`${Post[EntitySource]}::$${post.id}`,
				_cachedPost,
			);

			await this.cache.del(`${Post[EntitySource]}::$${cachedPost.id}`);
			await this.cache.del(`${Post[EntitySource]}::${cachedPost.slug}`);
		}

		await this.repository.update(post);

		await this.cachePost(post);
		await this.invalidateListCache();
	}

	async delete(post: IPost): Promise<void> {
		await this.cache.del(`${Post[EntitySource]}::$${post.id}`);
		await this.cache.del(`${Post[EntitySource]}::${post.slug}`);

		await this.repository.delete(post);
		await this.invalidateListCache();
	}

	count(): Promise<number> {
		return this.repository.count();
	}

	countByPostType(postTypeId: string): Promise<number> {
		return this.repository.countByPostType(postTypeId);
	}

	private async cachePost(_post: IPost): Promise<void> {
		const post = Mapper.toDTO(_post);

		await this.cache.set(
			`${Post[EntitySource]}::$${post.id}`,
			JSON.stringify(post),
			"EX",
			this.postCacheExpirationTime,
		);
		await this.cache.set(
			`${Post[EntitySource]}::${post.slug}`,
			post.id,
			"EX",
			this.postCacheExpirationTime,
		);
	}

	private async invalidateListCache(): Promise<void> {
		const patterns = [
			`${Post[EntitySource]}:page:*`,
			`${Post[EntitySource]}:type:*`,
		];

		for (const pattern of patterns) {
			let cursor = "0";
			do {
				const [newCursor, keys] = await this.cache.scan(
					cursor,
					"MATCH",
					pattern,
					"COUNT",
					100,
				);

				cursor = newCursor;

				if (keys.length > 0) {
					await this.cache.del(...keys);
				}
			} while (cursor !== "0");
		}
	}
}
