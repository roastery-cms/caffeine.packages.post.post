import { describe, expect, it, beforeEach } from "bun:test";
import { CountPostsUseCase } from "./count-posts.use-case";
import { PostRepository } from "@/infra/repositories/test/post.repository";
import { Post } from "@/domain";
import type { IPostType } from "@roastery-capsules/post.post-type/domain/types";
import type { IPostTag } from "@roastery-capsules/post.post-tag/domain/types";

const mockPostTag = (overrides?: Partial<IPostTag>): IPostTag =>
	({
		id: "tag-id",
		name: "Tech",
		slug: "tech",
		hidden: false,
		createdAt: new Date().toISOString(),
		rename() {},
		reslug() {},
		changeVisibility() {},
		...overrides,
	}) as IPostTag;

const mockPostType = (overrides?: Partial<IPostType>): IPostType =>
	({
		id: "type-id",
		name: "Blog",
		slug: "blog",
		isHighlighted: true,
		createdAt: new Date().toISOString(),
		rename() {},
		reslug() {},
		setHighlightTo() {},
		...overrides,
	}) as IPostType;

describe("CountPostsUseCase", () => {
	let postRepository: PostRepository;
	let sut: CountPostsUseCase;

	beforeEach(() => {
		postRepository = new PostRepository();
		sut = new CountPostsUseCase(postRepository);
	});

	it("should return count 0 and totalPages 0 when there are no posts", async () => {
		const result = await sut.run();

		expect(result.count).toBe(0);
		expect(result.totalPages).toBe(0);
	});

	it("should return correct count for all posts", async () => {
		const type = mockPostType();
		await postRepository.create(
			Post.make({
				name: "Post A",
				description: "Desc",
				cover: "https://example.com/a.jpg",
				type,
				tags: [mockPostTag()],
			}),
		);
		await postRepository.create(
			Post.make({
				name: "Post B",
				description: "Desc",
				cover: "https://example.com/b.jpg",
				type,
				tags: [],
			}),
		);

		const result = await sut.run();

		expect(result.count).toBe(2);
		expect(result.totalPages).toBeGreaterThanOrEqual(1);
	});

	it("should count only posts matching the given post type", async () => {
		const typeA = mockPostType({ id: "type-a" });
		const typeB = mockPostType({ id: "type-b" });

		await postRepository.create(
			Post.make({
				name: "Post A",
				description: "Desc",
				cover: "https://example.com/a.jpg",
				type: typeA,
				tags: [],
			}),
		);
		await postRepository.create(
			Post.make({
				name: "Post B",
				description: "Desc",
				cover: "https://example.com/b.jpg",
				type: typeA,
				tags: [],
			}),
		);
		await postRepository.create(
			Post.make({
				name: "Post C",
				description: "Desc",
				cover: "https://example.com/c.jpg",
				type: typeB,
				tags: [],
			}),
		);

		const result = await sut.run("type-a");

		expect(result.count).toBe(2);
	});

	it("should return count 0 when no posts match the given post type", async () => {
		const result = await sut.run("non-existent-type");

		expect(result.count).toBe(0);
		expect(result.totalPages).toBe(0);
	});
});
