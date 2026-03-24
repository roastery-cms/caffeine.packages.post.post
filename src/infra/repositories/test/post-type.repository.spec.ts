import { describe, expect, it, beforeEach } from "bun:test";
import { PostTypeRepository } from "./post-type.repository";
import type { IPostType } from "@roastery-capsules/post.post-type/domain/types";

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

describe("PostTypeRepository", () => {
	let repository: PostTypeRepository;

	beforeEach(() => {
		repository = new PostTypeRepository();
	});

	describe("find", () => {
		it("should find a type by id", async () => {
			const type = mockPostType({ id: "type-1" });
			repository.seed([type]);

			const result = await repository.find("type-1");

			expect(result).toBe(type);
		});

		it("should find a type by slug", async () => {
			const type = mockPostType({ id: "type-1", slug: "blog" });
			repository.seed([type]);

			const result = await repository.find("blog");

			expect(result).toBe(type);
		});

		it("should prioritize id over slug", async () => {
			const typeA = mockPostType({ id: "blog", slug: "slug-a" });
			const typeB = mockPostType({ id: "type-b", slug: "blog" });
			repository.seed([typeA, typeB]);

			const result = await repository.find("blog");

			expect(result).toBe(typeA);
		});

		it("should return null when type is not found", async () => {
			const result = await repository.find("non-existent");

			expect(result).toBeNull();
		});
	});

	describe("seed", () => {
		it("should populate the repository with types", () => {
			const types = [
				mockPostType({ id: "type-1" }),
				mockPostType({ id: "type-2" }),
			];

			repository.seed(types);

			expect(repository.count()).toBe(2);
		});

		it("should overwrite existing types with the same id", () => {
			const original = mockPostType({ id: "type-1", name: "Original" });
			const updated = mockPostType({ id: "type-1", name: "Updated" });

			repository.seed([original]);
			repository.seed([updated]);

			expect(repository.count()).toBe(1);
			expect(repository.getAll()[0]!.name).toBe("Updated");
		});
	});

	describe("clear", () => {
		it("should remove all types", () => {
			repository.seed([mockPostType({ id: "type-1" })]);

			repository.clear();

			expect(repository.count()).toBe(0);
			expect(repository.getAll()).toEqual([]);
		});
	});

	describe("getAll", () => {
		it("should return all stored types", () => {
			const types = [
				mockPostType({ id: "type-1" }),
				mockPostType({ id: "type-2" }),
				mockPostType({ id: "type-3" }),
			];
			repository.seed(types);

			const result = repository.getAll();

			expect(result).toHaveLength(3);
		});

		it("should return empty array when repository is empty", () => {
			expect(repository.getAll()).toEqual([]);
		});
	});

	describe("count", () => {
		it("should return the number of stored types", () => {
			repository.seed([
				mockPostType({ id: "type-1" }),
				mockPostType({ id: "type-2" }),
			]);

			expect(repository.count()).toBe(2);
		});

		it("should return 0 when repository is empty", () => {
			expect(repository.count()).toBe(0);
		});
	});
});
