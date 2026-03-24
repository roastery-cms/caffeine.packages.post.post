import { describe, expect, it, beforeEach } from "bun:test";
import { CreatePostUseCase } from "./create-post.use-case";
import { PostRepository } from "@/infra/repositories/test/post.repository";
import { PostTagRepository } from "@/infra/repositories/test/post-tag.repository";
import { PostTypeRepository } from "@/infra/repositories/test/post-type.repository";
import { FindPostTypeService } from "../services/find-post-type.service";
import { FindManyPostTagsService } from "../services/find-many-post-tags.service";
import type { CreatePostDTO } from "../dtos";
import type { IPostTag } from "@roastery-capsules/post.post-tag/domain/types";
import { generateUUID } from "@roastery/beans/entity/helpers";
import type { IPostType } from "@roastery-capsules/post.post-type/domain/types";
import { SlugUniquenessCheckerService } from "@roastery/seedbed/domain/services";
import {
	ResourceAlreadyExistsException,
	ResourceNotFoundException,
} from "@roastery/terroir/exceptions/application";

const TAG_ID = generateUUID();
const TYPE_ID = generateUUID();

const mockPostTag = (overrides?: Partial<IPostTag>): IPostTag =>
	({
		id: TAG_ID,
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
		id: TYPE_ID,
		name: "Blog",
		slug: "blog",
		isHighlighted: true,
		createdAt: new Date().toISOString(),
		rename() {},
		reslug() {},
		setHighlightTo() {},
		...overrides,
	}) as IPostType;

const makeCreateDTO = (overrides?: Partial<CreatePostDTO>): CreatePostDTO => ({
	postTypeId: TYPE_ID,
	tags: [TAG_ID],
	name: "My First Post",
	description: "A description of the post",
	cover: "https://example.com/cover.jpg",
	...overrides,
});

describe("CreatePostUseCase", () => {
	let postRepository: PostRepository;
	let postTagRepository: PostTagRepository;
	let postTypeRepository: PostTypeRepository;
	let sut: CreatePostUseCase;

	beforeEach(() => {
		postRepository = new PostRepository();
		postTagRepository = new PostTagRepository();
		postTypeRepository = new PostTypeRepository();

		const uniquenessChecker = new SlugUniquenessCheckerService(postRepository);
		const findPostType = new FindPostTypeService(postTypeRepository);
		const findManyPostTags = new FindManyPostTagsService(postTagRepository);

		sut = new CreatePostUseCase(
			postRepository,
			uniquenessChecker,
			findPostType,
			findManyPostTags,
		);

		postTagRepository.seed([mockPostTag()]);
		postTypeRepository.seed([mockPostType()]);
	});

	it("should create a post and store it in the repository", async () => {
		const dto = makeCreateDTO();

		const result = await sut.run(dto);

		expect(result.name).toBe(dto.name);
		expect(result.description).toBe(dto.description);
		expect(result.cover).toBe(dto.cover);
		expect(result.type.id).toBe(TYPE_ID);
		expect(result.tags).toHaveLength(1);
		expect(postRepository.getAll()).toHaveLength(1);
	});

	it("should throw ResourceAlreadyExistsException when slug already exists", async () => {
		await sut.run(makeCreateDTO());

		expect(sut.run(makeCreateDTO())).rejects.toBeInstanceOf(
			ResourceAlreadyExistsException,
		);
	});

	it("should throw ResourceNotFoundException when post type does not exist", async () => {
		const dto = makeCreateDTO({
			postTypeId: generateUUID(),
		});

		expect(sut.run(dto)).rejects.toBeInstanceOf(ResourceNotFoundException);
	});

	it("should throw ResourceNotFoundException when a tag does not exist", async () => {
		const dto = makeCreateDTO({
			tags: [generateUUID()],
		});

		expect(sut.run(dto)).rejects.toBeInstanceOf(ResourceNotFoundException);
	});

	it("should allow creating a post with no tags", async () => {
		const dto = makeCreateDTO({ tags: [] });

		const result = await sut.run(dto);

		expect(result.tags).toEqual([]);
	});
});
