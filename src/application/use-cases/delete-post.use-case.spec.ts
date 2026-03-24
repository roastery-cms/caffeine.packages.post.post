import { describe, expect, it, beforeEach } from "bun:test";
import { DeletePostUseCase } from "./delete-post.use-case";
import { FindPostUseCase } from "./find-post.use-case";
import { PostRepository } from "@/infra/repositories/test/post.repository";
import { Post } from "@/domain";
import type { IPostTag } from "@roastery-capsules/post.post-tag/domain/types";
import type { IPostType } from "@roastery-capsules/post.post-type/domain/types";
import { FindEntityByTypeUseCase } from "@roastery/seedbed/application/use-cases";
import { ResourceNotFoundException } from "@roastery/terroir/exceptions/application";
import type { UnpackedPostDTO } from "@/domain/dtos";
import type { IPost } from "@/domain/types";
import type { IPostRepository } from "@/domain/types/repositories";
import { generateUUID } from "@roastery/beans/entity/helpers";

const mockPostTag = (overrides?: Partial<IPostTag>): IPostTag =>
	({
		id: generateUUID(),
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
		id: generateUUID(),
		name: "Blog",
		slug: "blog",
		isHighlighted: true,
		createdAt: new Date().toISOString(),
		rename() {},
		reslug() {},
		setHighlightTo() {},
		...overrides,
	}) as IPostType;

describe("DeletePostUseCase", () => {
	let postRepository: PostRepository;
	let sut: DeletePostUseCase;

	beforeEach(() => {
		postRepository = new PostRepository();
		const findEntityByType = new FindEntityByTypeUseCase<
			typeof UnpackedPostDTO,
			IPost,
			IPostRepository
		>(postRepository);
		const findPost = new FindPostUseCase(findEntityByType);
		sut = new DeletePostUseCase(postRepository, findPost);
	});

	it("should delete a post by id", async () => {
		const post = Post.make({
			name: "My Post",
			description: "Desc",
			cover: "https://example.com/img.jpg",
			type: mockPostType(),
			tags: [mockPostTag()],
		});
		await postRepository.create(post);

		await sut.run(post.id);

		expect(postRepository.getAll()).toHaveLength(0);
	});

	it("should delete a post by slug", async () => {
		const post = Post.make({
			name: "My Post",
			description: "Desc",
			cover: "https://example.com/img.jpg",
			type: mockPostType(),
			tags: [],
		});
		await postRepository.create(post);

		await sut.run("my-post");

		expect(postRepository.getAll()).toHaveLength(0);
	});

	it("should throw ResourceNotFoundException when post does not exist", async () => {
		expect(sut.run("non-existent")).rejects.toBeInstanceOf(
			ResourceNotFoundException,
		);
	});
});
