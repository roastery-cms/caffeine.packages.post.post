import { describe, expect, it, beforeEach } from "bun:test";
import { FindManyPostTypesService } from "./find-many-post-types.service";
import { PostTypeRepository } from "@/infra/repositories/test/post-type.repository";
import type { IPostType } from "@roastery-capsules/post.post-type/domain/types";
import { ResourceNotFoundException } from "@roastery/terroir/exceptions/application";

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

describe("FindManyPostTypesService", () => {
	let repository: PostTypeRepository;
	let sut: FindManyPostTypesService;

	beforeEach(() => {
		repository = new PostTypeRepository();
		sut = new FindManyPostTypesService(repository);
	});

	it("should return all types when all ids exist", async () => {
		const typeA = mockPostType({ id: "type-1", name: "Blog" });
		const typeB = mockPostType({ id: "type-2", name: "Article" });
		repository.seed([typeA, typeB]);

		const result = await sut.run(["type-1", "type-2"]);

		expect(result).toEqual([typeA, typeB]);
	});

	it("should return empty array when given empty ids", async () => {
		const result = await sut.run([]);

		expect(result).toEqual([]);
	});

	it("should throw ResourceNotFoundException when any type is not found", async () => {
		const type = mockPostType({ id: "type-1" });
		repository.seed([type]);

		expect(sut.run(["type-1", "non-existent"])).rejects.toBeInstanceOf(
			ResourceNotFoundException,
		);
	});
});
