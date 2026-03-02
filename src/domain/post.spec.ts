import { describe, expect, it } from "bun:test";
import { Post } from "./post";
import { InvalidPropertyException } from "@caffeine/errors/domain";
import type { IRawPost } from "./types/raw-post.interface";
import type { IPostTag } from "@caffeine-packages/post.post-tag/domain/types";
import type { IPostType } from "@caffeine-packages/post.post-type/domain/types";
import { makeEntity } from "@caffeine/entity/factories";

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

const makeValidProps = (overrides?: Partial<IRawPost>): IRawPost => ({
	name: "My First Post",
	description: "A description",
	cover: "https://example.com/image.jpg",
	type: mockPostType(),
	tags: [mockPostTag()],
	...overrides,
});

describe("Post Entity", () => {
	describe("make", () => {
		it("should create a valid instance with correct properties", () => {
			const props = makeValidProps();
			const post = Post.make(props);

			expect(post).toBeInstanceOf(Post);
			expect(post.name).toBe(props.name);
			expect(post.slug).toBe("my-first-post");
			expect(post.description).toBe(props.description);
			expect(post.cover).toBe(props.cover);
			expect(post.type).toBe(props.type);
			expect(post.tags).toEqual(props.tags);
			expect(post.id).toBeDefined();
			expect(post.createdAt).toBeDefined();
		});

		it("should generate slug from name when slug is omitted", () => {
			const post = Post.make(makeValidProps({ name: "Some Title" }));

			expect(post.slug).toBe("some-title");
		});

		it("should use provided slug when given", () => {
			const post = Post.make(makeValidProps({ slug: "custom-slug" }));

			expect(post.slug).toBe("custom-slug");
		});

		it("should accept custom entityProps", () => {
			const entityProps = makeEntity();
			const post = Post.make(makeValidProps(), entityProps);

			expect(post.id).toBe(entityProps.id);
			expect(post.createdAt).toBe(entityProps.createdAt);
		});

		it("should throw InvalidPropertyException for invalid cover url", () => {
			expect(() => Post.make(makeValidProps({ cover: "invalid-url" }))).toThrow(
				InvalidPropertyException,
			);
		});

		it("should throw InvalidPropertyException for empty name", () => {
			expect(() => Post.make(makeValidProps({ name: "" }))).toThrow(
				InvalidPropertyException,
			);
		});

		it("should throw InvalidPropertyException for empty description", () => {
			expect(() => Post.make(makeValidProps({ description: "" }))).toThrow(
				InvalidPropertyException,
			);
		});
	});

	describe("rename", () => {
		it("should update the name", () => {
			const post = Post.make(makeValidProps()) as Post;
			const newName = "New Name For Post";

			post.rename(newName);

			expect(post.name).toBe(newName);
		});

		it("should set updatedAt after rename", () => {
			const post = Post.make(makeValidProps()) as Post;

			post.rename("Another Name");

			expect(post.updatedAt).toBeDefined();
		});

		it("should throw InvalidPropertyException for empty name", () => {
			const post = Post.make(makeValidProps()) as Post;

			expect(() => post.rename("")).toThrow(InvalidPropertyException);
		});
	});

	describe("updateDescription", () => {
		it("should update the description", () => {
			const post = Post.make(makeValidProps()) as Post;
			const newDescription = "New description content";

			post.updateDescription(newDescription);

			expect(post.description).toBe(newDescription);
		});

		it("should set updatedAt after updateDescription", () => {
			const post = Post.make(makeValidProps()) as Post;

			post.updateDescription("Updated");

			expect(post.updatedAt).toBeDefined();
		});

		it("should throw InvalidPropertyException for empty description", () => {
			const post = Post.make(makeValidProps()) as Post;

			expect(() => post.updateDescription("")).toThrow(InvalidPropertyException);
		});
	});

	describe("updateCover", () => {
		it("should update the cover", () => {
			const post = Post.make(makeValidProps()) as Post;
			const newCover = "https://example.com/new-cover.jpg";

			post.updateCover(newCover);

			expect(post.cover).toBe(newCover);
		});

		it("should set updatedAt after updateCover", () => {
			const post = Post.make(makeValidProps()) as Post;

			post.updateCover("https://example.com/updated.jpg");

			expect(post.updatedAt).toBeDefined();
		});

		it("should throw InvalidPropertyException for invalid cover url", () => {
			const post = Post.make(makeValidProps()) as Post;

			expect(() => post.updateCover("invalid-url")).toThrow(InvalidPropertyException);
		});
	});

	describe("updateTags", () => {
		it("should update the tags", () => {
			const post = Post.make(makeValidProps()) as Post;
			const newTags = [mockPostTag({ name: "Design", slug: "design" })];

			post.updateTags(newTags);

			expect(post.tags).toEqual(newTags);
		});

		it("should set updatedAt after updateTags", () => {
			const post = Post.make(makeValidProps()) as Post;

			post.updateTags([]);

			expect(post.updatedAt).toBeDefined();
		});

		it("should allow setting empty tags array", () => {
			const post = Post.make(makeValidProps()) as Post;

			post.updateTags([]);

			expect(post.tags).toEqual([]);
		});
	});

	describe("getters", () => {
		it("should return the type", () => {
			const type = mockPostType({ name: "Article" });
			const post = Post.make(makeValidProps({ type }));

			expect(post.type).toBe(type);
		});

		it("should return the tags", () => {
			const tags = [mockPostTag({ name: "A" }), mockPostTag({ name: "B" })];
			const post = Post.make(makeValidProps({ tags }));

			expect(post.tags).toHaveLength(2);
			expect(post.tags).toEqual(tags);
		});
	});
});
