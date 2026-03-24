import { describe, expect, it, beforeEach } from "bun:test";
import { FindManyPostTagsService } from "./find-many-post-tags.service";
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

describe("FindManyPostTagsService", () => {
	let repository: PostTagRepository;
	let sut: FindManyPostTagsService;

	beforeEach(() => {
		repository = new PostTagRepository();
		sut = new FindManyPostTagsService(repository);
	});

	it("should return all tags when all ids exist", async () => {
		const tagA = mockPostTag({ id: "tag-1", name: "Tech" });
		const tagB = mockPostTag({ id: "tag-2", name: "Design" });
		repository.seed([tagA, tagB]);

		const result = await sut.run(["tag-1", "tag-2"]);

		expect(result).toEqual([tagA, tagB]);
	});

	it("should return empty array when given empty ids", async () => {
		const result = await sut.run([]);

		expect(result).toEqual([]);
	});

	it("should throw ResourceNotFoundException when any tag is not found", async () => {
		const tag = mockPostTag({ id: "tag-1" });
		repository.seed([tag]);

		expect(sut.run(["tag-1", "non-existent"])).rejects.toBeInstanceOf(
			ResourceNotFoundException,
		);
	});
});
