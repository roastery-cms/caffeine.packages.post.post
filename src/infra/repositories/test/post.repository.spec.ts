import { describe, expect, it, beforeEach } from "bun:test";
import { PostRepository } from "./post.repository";
import { Post } from "@/domain";
import type { IConstructorPost, IPost } from "@/domain/types";
import type { IRawPost } from "@/domain/types/raw-post.interface";
import type { IPostTag } from "@roastery-capsules/post.post-tag/domain/types";
import type { IPostType } from "@roastery-capsules/post.post-type/domain/types";
import { ConflictException } from "@roastery/terroir/exceptions/infra";

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

const makeValidProps = (overrides?: Partial<IRawPost>): IConstructorPost => ({
	name: "My First Post",
	description: "A description",
	cover: "https://example.com/image.jpg",
	type: mockPostType(),
	tags: [mockPostTag()],
	...overrides,
});

const makePost = (overrides?: Partial<IRawPost>): IPost =>
	Post.make(makeValidProps(overrides));

describe("PostRepository", () => {
	let repository: PostRepository;

	beforeEach(() => {
		repository = new PostRepository();
	});

	describe("create", () => {
		it("should store a post", async () => {
			const post = makePost();

			await repository.create(post);

			expect(repository.getAll()).toHaveLength(1);
		});

		it("should throw ConflictException when post with same id already exists", async () => {
			const post = makePost();
			await repository.create(post);

			expect(repository.create(post)).rejects.toBeInstanceOf(ConflictException);
		});
	});

	describe("findById", () => {
		it("should return the post when found", async () => {
			const post = makePost();
			await repository.create(post);

			const result = await repository.findById(post.id);

			expect(result).toBe(post);
		});

		it("should return null when post is not found", async () => {
			const result = await repository.findById("non-existent");

			expect(result).toBeNull();
		});
	});

	describe("findBySlug", () => {
		it("should return the post when found by slug", async () => {
			const post = makePost({ name: "My Post" });
			await repository.create(post);

			const result = await repository.findBySlug(post.slug);

			expect(result).toBe(post);
		});

		it("should return null when slug is not found", async () => {
			const result = await repository.findBySlug("non-existent-slug");

			expect(result).toBeNull();
		});
	});

	describe("findManyByIds", () => {
		it("should return posts matching the given ids", async () => {
			const postA = makePost({ name: "Post A" });
			const postB = makePost({ name: "Post B" });
			await repository.create(postA);
			await repository.create(postB);

			const result = await repository.findManyByIds([postA.id, postB.id]);

			expect(result).toEqual([postA, postB]);
		});

		it("should return null for ids not found", async () => {
			const post = makePost();
			await repository.create(post);

			const result = await repository.findManyByIds([post.id, "non-existent"]);

			expect(result).toEqual([post, null]);
		});
	});

	describe("findMany", () => {
		it("should return paginated posts", async () => {
			const post = makePost();
			await repository.create(post);

			const result = await repository.findMany(1);

			expect(result).toHaveLength(1);
			expect(result[0]).toBe(post);
		});

		it("should return empty array for pages beyond data", async () => {
			const post = makePost();
			await repository.create(post);

			const result = await repository.findMany(999);

			expect(result).toEqual([]);
		});
	});

	describe("findManyByPostType", () => {
		it("should return only posts matching the post type", async () => {
			const typeA = mockPostType({ id: "type-a" });
			const typeB = mockPostType({ id: "type-b" });
			const postA = makePost({ name: "Post A", type: typeA });
			const postB = makePost({ name: "Post B", type: typeB });
			await repository.create(postA);
			await repository.create(postB);

			const result = await repository.findManyByPostType("type-a", 1);

			expect(result).toHaveLength(1);
			expect(result[0]).toBe(postA);
		});

		it("should return empty array when no posts match the type", async () => {
			const post = makePost();
			await repository.create(post);

			const result = await repository.findManyByPostType(
				"non-existent-type",
				1,
			);

			expect(result).toEqual([]);
		});
	});

	describe("update", () => {
		it("should update an existing post", async () => {
			const post = makePost() as Post;
			await repository.create(post);

			post.rename("Updated Name");
			await repository.update(post);

			const found = await repository.findById(post.id);
			expect(found!.name).toBe("Updated Name");
		});

		it("should throw when post does not exist", async () => {
			const post = makePost();

			expect(repository.update(post)).rejects.toThrow();
		});
	});

	describe("delete", () => {
		it("should remove the post", async () => {
			const post = makePost();
			await repository.create(post);

			await repository.delete(post);

			expect(repository.getAll()).toHaveLength(0);
		});

		it("should throw when post does not exist", async () => {
			const post = makePost();

			expect(repository.delete(post)).rejects.toThrow();
		});
	});

	describe("count", () => {
		it("should return the total number of posts", async () => {
			await repository.create(makePost({ name: "Post A" }));
			await repository.create(makePost({ name: "Post B" }));

			const result = await repository.count();

			expect(result).toBe(2);
		});

		it("should return 0 when repository is empty", async () => {
			const result = await repository.count();

			expect(result).toBe(0);
		});
	});

	describe("countByPostType", () => {
		it("should return the count of posts matching the type", async () => {
			const typeA = mockPostType({ id: "type-a" });
			const typeB = mockPostType({ id: "type-b" });
			await repository.create(makePost({ name: "Post A", type: typeA }));
			await repository.create(makePost({ name: "Post B", type: typeA }));
			await repository.create(makePost({ name: "Post C", type: typeB }));

			const result = await repository.countByPostType("type-a");

			expect(result).toBe(2);
		});

		it("should return 0 when no posts match the type", async () => {
			const result = await repository.countByPostType("non-existent");

			expect(result).toBe(0);
		});
	});

	describe("clear", () => {
		it("should remove all posts", async () => {
			await repository.create(makePost({ name: "Post A" }));
			await repository.create(makePost({ name: "Post B" }));

			repository.clear();

			expect(repository.getAll()).toEqual([]);
		});
	});

	describe("getAll", () => {
		it("should return all stored posts", async () => {
			await repository.create(makePost({ name: "Post A" }));
			await repository.create(makePost({ name: "Post B" }));

			const result = repository.getAll();

			expect(result).toHaveLength(2);
		});

		it("should return empty array when repository is empty", () => {
			expect(repository.getAll()).toEqual([]);
		});
	});
});
