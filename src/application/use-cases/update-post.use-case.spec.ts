import { describe, expect, it, beforeEach } from "bun:test";
import { UpdatePostUseCase } from "./update-post.use-case";
import { FindPostUseCase } from "./find-post.use-case";
import { PostRepository } from "@/infra/repositories/test/post.repository";
import { PostTagRepository } from "@/infra/repositories/test/post-tag.repository";
import { FindManyPostTagsService } from "../services/find-many-post-tags.service";
import { Post } from "@/domain";
import type { IPost } from "@/domain/types";
import type { IPostTag } from "@roastery-capsules/post.post-tag/domain/types";
import type { IPostType } from "@roastery-capsules/post.post-type/domain/types";
import { FindEntityByTypeUseCase } from "@roastery/seedbed/application/use-cases";
import { SlugUniquenessCheckerService } from "@roastery/seedbed/domain/services";
import {
	ResourceAlreadyExistsException,
	ResourceNotFoundException,
} from "@roastery/terroir/exceptions/application";
import type { IPostRepository } from "@/domain/types/repositories";
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

describe("UpdatePostUseCase", () => {
	let postRepository: PostRepository;
	let postTagRepository: PostTagRepository;
	let sut: UpdatePostUseCase;
	let existingPost: IPost;

	const tagA = mockPostTag({ id: "tag-a", name: "Tech", slug: "tech" });
	const tagB = mockPostTag({ id: "tag-b", name: "Design", slug: "design" });

	beforeEach(async () => {
		postRepository = new PostRepository();
		postTagRepository = new PostTagRepository();

		const findEntityByType = new FindEntityByTypeUseCase<
			typeof UnpackedPostDTO,
			IPost,
			IPostRepository
		>(postRepository);
		const findPost = new FindPostUseCase(findEntityByType);
		const findManyPostTags = new FindManyPostTagsService(postTagRepository);
		const uniquenessChecker = new SlugUniquenessCheckerService(postRepository);

		sut = new UpdatePostUseCase(
			postRepository,
			findPost,
			findManyPostTags,
			uniquenessChecker,
		);

		postTagRepository.seed([tagA, tagB]);

		existingPost = Post.make({
			name: "Original Post",
			description: "Original description",
			cover: "https://example.com/original.jpg",
			type: mockPostType(),
			tags: [tagA],
		});
		await postRepository.create(existingPost);
	});

	it("should update the post name", async () => {
		const result = await sut.run(existingPost.id, {
			name: "Updated Name",
		});

		expect(result.name).toBe("Updated Name");
	});

	it("should update the post description", async () => {
		const result = await sut.run(existingPost.id, {
			description: "Updated description",
		});

		expect(result.description).toBe("Updated description");
	});

	it("should update the post cover", async () => {
		const result = await sut.run(existingPost.id, {
			cover: "https://example.com/new-cover.jpg",
		});

		expect(result.cover).toBe("https://example.com/new-cover.jpg");
	});

	it("should update the post tags", async () => {
		const result = await sut.run(existingPost.id, {
			tags: ["tag-b"],
		});

		expect(result.tags).toHaveLength(1);
		expect(result.tags[0]).toBe(tagB);
	});

	it("should update slug when updateSlug is true", async () => {
		const result = await sut.run(
			existingPost.id,
			{ name: "New Slug Name" },
			true,
		);

		expect(result.slug).toBe("new-slug-name");
	});

	it("should not update slug when updateSlug is false", async () => {
		const originalSlug = existingPost.slug;

		const result = await sut.run(existingPost.id, {
			name: "Different Name",
		});

		expect(result.slug).toBe(originalSlug);
	});

	it("should throw ResourceAlreadyExistsException when new slug conflicts", async () => {
		const otherPost = Post.make({
			name: "Other Post",
			description: "Desc",
			cover: "https://example.com/other.jpg",
			type: mockPostType(),
			tags: [],
		});
		await postRepository.create(otherPost);

		expect(
			sut.run(existingPost.id, { name: "Other Post" }, true),
		).rejects.toBeInstanceOf(ResourceAlreadyExistsException);
	});

	it("should allow slug update when new slug matches current slug", async () => {
		const result = await sut.run(
			existingPost.id,
			{ name: "Original Post" },
			true,
		);

		expect(result.slug).toBe("original-post");
	});

	it("should throw ResourceNotFoundException when post does not exist", async () => {
		expect(sut.run("non-existent", { name: "Test" })).rejects.toBeInstanceOf(
			ResourceNotFoundException,
		);
	});

	it("should throw ResourceNotFoundException when a tag does not exist", async () => {
		expect(
			sut.run(existingPost.id, { tags: ["non-existent-tag"] }),
		).rejects.toBeInstanceOf(ResourceNotFoundException);
	});

	it("should persist changes in the repository", async () => {
		await sut.run(existingPost.id, { name: "Persisted Name" });

		const found = await postRepository.findById(existingPost.id);
		expect(found!.name).toBe("Persisted Name");
	});
});
