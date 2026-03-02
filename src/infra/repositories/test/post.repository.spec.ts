import { describe, it, expect, beforeEach } from "vitest";
import { faker } from "@faker-js/faker";
import { PostRepository } from "./post.repository";
import { generateUUID } from "@caffeine/entity/helpers";
import { makeEntityFactory } from "@caffeine/entity/factories";
import type { BuildPostDTO } from "@/domain/dtos/build-post.dto";
import { Post } from "@/domain";
import { MAX_ITEMS_PER_QUERY } from "@caffeine/constants";

describe("PostRepository", () => {
	let repository: PostRepository;

	const makeValidPostData = (
		overrides: Partial<BuildPostDTO> = {},
	): BuildPostDTO => {
		const name = faker.lorem.words(3);
		return {
			postTypeId: generateUUID(),
			name: name,
			description: faker.lorem.sentence(),
			cover: faker.internet.url(),
			tags: [generateUUID()],
			...overrides,
		};
	};

	beforeEach(() => {
		repository = new PostRepository();
	});

	describe("create", () => {
		it("deve criar um novo post com sucesso", async () => {
			const data = makeValidPostData();
			const post = Post.make(data, makeEntityFactory());

			await repository.create(post);

			const found = await repository.findById(post.id);
			expect(found).not.toBeNull();
			expect(found?.id).toBe(post.id);
			expect(found?.name).toBe(data.name);
		});

		it("deve lançar erro ao tentar criar post com ID duplicado", async () => {
			const data = makeValidPostData();
			const entityProps = makeEntityFactory();
			const post1 = Post.make(data, entityProps);
			// Create a second post instance with the SAME ID (simulating duplication)
			const post2 = Post.make(data, entityProps);

			await repository.create(post1);

			await expect(repository.create(post2)).rejects.toThrow(
				`Post com ID ${post1.id} já existe`,
			);
		});
	});

	describe("findById", () => {
		it("deve retornar o post quando encontrado", async () => {
			const post = Post.make(makeValidPostData(), makeEntityFactory());
			await repository.create(post);

			const result = await repository.findById(post.id);
			expect(result).not.toBeNull();
			expect(result?.id).toBe(post.id);
		});

		it("deve retornar null quando o post não existe", async () => {
			const result = await repository.findById(generateUUID());
			expect(result).toBeNull();
		});
	});

	describe("findBySlug", () => {
		it("deve retornar o post quando encontrado pelo slug", async () => {
			const data = makeValidPostData();
			const post = Post.make(data, makeEntityFactory());
			await repository.create(post);

			const result = await repository.findBySlug(post.slug);
			expect(result).not.toBeNull();
			expect(result?.id).toBe(post.id);
			expect(result?.slug).toBe(post.slug);
		});

		it("deve retornar null quando o slug não existe", async () => {
			await repository.create(
				Post.make(makeValidPostData(), makeEntityFactory()),
			);
			const result = await repository.findBySlug("non-existent-slug");
			expect(result).toBeNull();
		});
	});

	describe("findManyByIds", () => {
		it("deve retornar posts correspondentes aos IDs fornecidos", async () => {
			const post1 = Post.make(makeValidPostData(), makeEntityFactory());
			const post2 = Post.make(makeValidPostData(), makeEntityFactory());
			await repository.create(post1);
			await repository.create(post2);

			const results = await repository.findManyByIds([post1.id, post2.id]);

			expect(results).toHaveLength(2);
			expect(results[0]?.id).toBe(post1.id);
			expect(results[1]?.id).toBe(post2.id);
		});

		it("deve retornar null para IDs não encontrados mantendo a ordem", async () => {
			const post1 = Post.make(makeValidPostData(), makeEntityFactory());
			await repository.create(post1);
			const nonExistentId = generateUUID();

			const results = await repository.findManyByIds([post1.id, nonExistentId]);

			expect(results).toHaveLength(2);
			expect(results[0]?.id).toBe(post1.id);
			expect(results[1]).toBeNull();
		});

		it("deve retornar array vazio se lista de IDs for vazia", async () => {
			const results = await repository.findManyByIds([]);
			expect(results).toHaveLength(0);
		});
	});

	describe("findMany", () => {
		it("deve retornar posts paginados", async () => {
			// Create MAX_ITEMS_PER_QUERY + 5 posts
			for (let i = 0; i < MAX_ITEMS_PER_QUERY + 5; i++) {
				await repository.create(
					Post.make(makeValidPostData(), makeEntityFactory()),
				);
			}

			const page1 = await repository.findMany(1);
			expect(page1).toHaveLength(MAX_ITEMS_PER_QUERY);

			const page2 = await repository.findMany(2);
			expect(page2).toHaveLength(5);
		});

		it("deve retornar lista vazia se a página não tiver items", async () => {
			const page = await repository.findMany(1);
			expect(page).toHaveLength(0);
		});
	});

	describe("findManyByPostType", () => {
		it("deve filtrar posts pelo postTypeId e paginar", async () => {
			const targetTypeId = generateUUID();
			const otherTypeId = generateUUID();

			// Create MAX_ITEMS_PER_QUERY + 5 posts of target type
			for (let i = 0; i < MAX_ITEMS_PER_QUERY + 5; i++) {
				const data = makeValidPostData({ postTypeId: targetTypeId });
				await repository.create(Post.make(data, makeEntityFactory()));
			}

			// Create 5 posts of other type
			for (let i = 0; i < 5; i++) {
				const data = makeValidPostData({ postTypeId: otherTypeId });
				await repository.create(Post.make(data, makeEntityFactory()));
			}

			// Mock IUnmountedPostType - only ID is needed for the repo
			const postTypeMock = targetTypeId;

			const page1 = await repository.findManyByPostType(postTypeMock, 1);
			expect(page1).toHaveLength(MAX_ITEMS_PER_QUERY);
			page1.map((p) => expect(p.postTypeId).toBe(targetTypeId));

			const page2 = await repository.findManyByPostType(postTypeMock, 2);
			expect(page2).toHaveLength(5);
			page2.map((p) => expect(p.postTypeId).toBe(targetTypeId));
		});

		it("deve retornar vazio se não houver posts do tipo", async () => {
			const postTypeMock = generateUUID();
			const result = await repository.findManyByPostType(postTypeMock, 1);
			expect(result).toHaveLength(0);
		});
	});

	describe("update", () => {
		it("deve atualizar um post existente", async () => {
			const originalData = makeValidPostData({ name: "Original Name" });
			const entityProps = makeEntityFactory();
			const post = Post.make(originalData, entityProps);
			await repository.create(post);

			// Update local instance
			post.rename("Updated Name");

			// Perform update in repository
			await repository.update(post);

			const found = await repository.findById(post.id);
			expect(found?.name).toBe("Updated Name");
		});

		it("deve lançar erro ao tentar atualizar post inexistente", async () => {
			const post = Post.make(makeValidPostData(), makeEntityFactory());
			await expect(repository.update(post)).rejects.toThrow(
				`Post com ID ${post.id} não encontrado`,
			);
		});
	});

	describe("delete", () => {
		it("deve remover um post existente", async () => {
			const post = Post.make(makeValidPostData(), makeEntityFactory());
			await repository.create(post);

			await repository.delete(post);

			const found = await repository.findById(post.id);
			expect(found).toBeNull();
		});

		it("deve lançar erro ao tentar remover post inexistente", async () => {
			const post = Post.make(makeValidPostData(), makeEntityFactory());
			await expect(repository.delete(post)).rejects.toThrow(
				`Post com ID ${post.id} não encontrado`,
			);
		});
	});

	describe("count", () => {
		it("deve retornar a contagem correta de posts", async () => {
			expect(await repository.count()).toBe(0);

			const post1 = Post.make(makeValidPostData(), makeEntityFactory());
			await repository.create(post1);
			expect(await repository.count()).toBe(1);

			const post2 = Post.make(makeValidPostData(), makeEntityFactory());
			await repository.create(post2);
			expect(await repository.count()).toBe(2);

			await repository.delete(post1);
			expect(await repository.count()).toBe(1);
		});
	});

	describe("countByPostType", () => {
		it("deve contar apenas posts do tipo especificado", async () => {
			const type1 = generateUUID();
			const type2 = generateUUID();

			const post1 = Post.make(
				makeValidPostData({ postTypeId: type1 }),
				makeEntityFactory(),
			);
			const post2 = Post.make(
				makeValidPostData({ postTypeId: type1 }),
				makeEntityFactory(),
			);
			const post3 = Post.make(
				makeValidPostData({ postTypeId: type2 }),
				makeEntityFactory(),
			);

			await repository.create(post1);
			await repository.create(post2);
			await repository.create(post3);

			expect(await repository.countByPostType(type1)).toBe(2);
			expect(await repository.countByPostType(type2)).toBe(1);
		});

		it("deve retornar 0 se não houver posts do tipo", async () => {
			const type1 = generateUUID();
			const post = Post.make(
				makeValidPostData({ postTypeId: type1 }),
				makeEntityFactory(),
			);
			await repository.create(post);

			expect(await repository.countByPostType(generateUUID())).toBe(0);
		});
	});

	describe("getAll (auxiliary)", () => {
		it("deve retornar todos os posts", async () => {
			await repository.create(
				Post.make(makeValidPostData(), makeEntityFactory()),
			);
			await repository.create(
				Post.make(makeValidPostData(), makeEntityFactory()),
			);

			const all = repository.getAll();
			expect(all).toHaveLength(2);
		});
	});

	describe("clear (auxiliary)", () => {
		it("deve limpar o repositório", async () => {
			await repository.create(
				Post.make(makeValidPostData(), makeEntityFactory()),
			);
			expect(await repository.count()).toBe(1);

			repository.clear();
			expect(await repository.count()).toBe(0);
		});
	});
});
