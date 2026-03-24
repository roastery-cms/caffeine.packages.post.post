import { describe, expect, it, beforeEach } from "bun:test";
import { PostTagRepository } from "./post-tag.repository";
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

describe("PostTagRepository", () => {
	let repository: PostTagRepository;

	beforeEach(() => {
		repository = new PostTagRepository();
	});

	describe("find", () => {
		it("should find a tag by id", async () => {
			const tag = mockPostTag({ id: "tag-1" });
			repository.seed([tag]);

			const result = await repository.find("tag-1");

			expect(result).toBe(tag);
		});

		it("should find a tag by slug", async () => {
			const tag = mockPostTag({ id: "tag-1", slug: "tech" });
			repository.seed([tag]);

			const result = await repository.find("tech");

			expect(result).toBe(tag);
		});

		it("should prioritize id over slug", async () => {
			const tagA = mockPostTag({ id: "tech", slug: "slug-a" });
			const tagB = mockPostTag({ id: "tag-b", slug: "tech" });
			repository.seed([tagA, tagB]);

			const result = await repository.find("tech");

			expect(result).toBe(tagA);
		});

		it("should return null when tag is not found", async () => {
			const result = await repository.find("non-existent");

			expect(result).toBeNull();
		});
	});

	describe("seed", () => {
		it("should populate the repository with tags", () => {
			const tags = [mockPostTag({ id: "tag-1" }), mockPostTag({ id: "tag-2" })];

			repository.seed(tags);

			expect(repository.count()).toBe(2);
		});

		it("should overwrite existing tags with the same id", () => {
			const original = mockPostTag({ id: "tag-1", name: "Original" });
			const updated = mockPostTag({ id: "tag-1", name: "Updated" });

			repository.seed([original]);
			repository.seed([updated]);

			expect(repository.count()).toBe(1);
			expect(repository.getAll()[0]!.name).toBe("Updated");
		});
	});

	describe("clear", () => {
		it("should remove all tags", () => {
			repository.seed([mockPostTag({ id: "tag-1" })]);

			repository.clear();

			expect(repository.count()).toBe(0);
			expect(repository.getAll()).toEqual([]);
		});
	});

	describe("getAll", () => {
		it("should return all stored tags", () => {
			const tags = [
				mockPostTag({ id: "tag-1" }),
				mockPostTag({ id: "tag-2" }),
				mockPostTag({ id: "tag-3" }),
			];
			repository.seed(tags);

			const result = repository.getAll();

			expect(result).toHaveLength(3);
		});

		it("should return empty array when repository is empty", () => {
			expect(repository.getAll()).toEqual([]);
		});
	});

	describe("count", () => {
		it("should return the number of stored tags", () => {
			repository.seed([
				mockPostTag({ id: "tag-1" }),
				mockPostTag({ id: "tag-2" }),
			]);

			expect(repository.count()).toBe(2);
		});

		it("should return 0 when repository is empty", () => {
			expect(repository.count()).toBe(0);
		});
	});
});
