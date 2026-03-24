import { describe, expect, it, beforeEach } from "bun:test";
import { FindPostUseCase } from "./find-post.use-case";
import { PostRepository } from "@/infra/repositories/test/post.repository";
import { Post } from "@/domain";
import type { IPostTag } from "@roastery-capsules/post.post-tag/domain/types";
import type { IPostType } from "@roastery-capsules/post.post-type/domain/types";
import { FindEntityByTypeUseCase } from "@roastery/seedbed/application/use-cases";
import { ResourceNotFoundException } from "@roastery/terroir/exceptions/application";
import { generateUUID } from "@roastery/beans/entity/helpers";
import type { IPostRepository } from "@/domain/types/repositories";
import type { IPost } from "@/domain/types";
import type { UnpackedPostDTO } from "@/domain/dtos";

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

describe("FindPostUseCase", () => {
	let postRepository: PostRepository;
	let sut: FindPostUseCase;

	beforeEach(() => {
		postRepository = new PostRepository();
		const findEntityByType = new FindEntityByTypeUseCase<
			typeof UnpackedPostDTO,
			IPost,
			IPostRepository
		>(postRepository);
		sut = new FindPostUseCase(findEntityByType);
	});

	it("should find a post by id", async () => {
		const post = Post.make({
			name: "My Post",
			description: "Desc",
			cover: "https://example.com/img.jpg",
			type: mockPostType(),
			tags: [mockPostTag()],
		});
		await postRepository.create(post);

		const result = await sut.run(post.id);

		expect(result).toBe(post);
	});

	it("should find a post by slug", async () => {
		const post = Post.make({
			name: "My Post",
			description: "Desc",
			cover: "https://example.com/img.jpg",
			type: mockPostType(),
			tags: [mockPostTag()],
		});
		await postRepository.create(post);

		const result = await sut.run("my-post");

		expect(result).toBe(post);
	});

	it("should throw ResourceNotFoundException when post is not found by id", async () => {
		expect(sut.run(generateUUID())).rejects.toBeInstanceOf(
			ResourceNotFoundException,
		);
	});

	it("should throw ResourceNotFoundException when post is not found by slug", async () => {
		expect(sut.run("non-existent-slug")).rejects.toBeInstanceOf(
			ResourceNotFoundException,
		);
	});
});
