import { describe, expect, it, beforeEach } from "bun:test";
import { FindPostTagService } from "./find-post-tag.service";
import { PostTagRepository } from "@/infra/repositories/test/post-tag.repository";
import type { IPostTag } from "@roastery-capsules/post.post-tag/domain/types";
import { ResourceNotFoundException } from "@roastery/terroir/exceptions/application";

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

describe("FindPostTagService", () => {
	let repository: PostTagRepository;
	let sut: FindPostTagService;

	beforeEach(() => {
		repository = new PostTagRepository();
		sut = new FindPostTagService(repository);
	});

	it("should return the tag when found by id", async () => {
		const tag = mockPostTag({ id: "tag-1" });
		repository.seed([tag]);

		const result = await sut.run("tag-1");

		expect(result).toBe(tag);
	});

	it("should return the tag when found by slug", async () => {
		const tag = mockPostTag({ id: "tag-1", slug: "tech" });
		repository.seed([tag]);

		const result = await sut.run("tech");

		expect(result).toBe(tag);
	});

	it("should throw ResourceNotFoundException when tag is not found", async () => {
		expect(sut.run("non-existent")).rejects.toBeInstanceOf(
			ResourceNotFoundException,
		);
	});
});
