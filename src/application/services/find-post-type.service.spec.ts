import { describe, expect, it, beforeEach } from "bun:test";
import { FindPostTypeService } from "./find-post-type.service";
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

describe("FindPostTypeService", () => {
	let repository: PostTypeRepository;
	let sut: FindPostTypeService;

	beforeEach(() => {
		repository = new PostTypeRepository();
		sut = new FindPostTypeService(repository);
	});

	it("should return the type when found by id", async () => {
		const type = mockPostType({ id: "type-1" });
		repository.seed([type]);

		const result = await sut.run("type-1");

		expect(result).toBe(type);
	});

	it("should return the type when found by slug", async () => {
		const type = mockPostType({ id: "type-1", slug: "blog" });
		repository.seed([type]);

		const result = await sut.run("blog");

		expect(result).toBe(type);
	});

	it("should throw ResourceNotFoundException when type is not found", async () => {
		expect(sut.run("non-existent")).rejects.toBeInstanceOf(
			ResourceNotFoundException,
		);
	});
});
