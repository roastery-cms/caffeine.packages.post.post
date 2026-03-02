import { describe, it, expect, beforeEach } from "vitest";
import { faker } from "@faker-js/faker";
import { PostTagRepository } from "./post-tag.repository";
import type { IUnmountedPostTag } from "@caffeine-packages/post.post-tag/domain/types";
import { generateUUID } from "@caffeine/entity/helpers";
import { makeEntityFactory } from "@caffeine/entity/factories";

describe("PostTagRepository", () => {
	let repository: PostTagRepository;

	/**
	 * Factory para criar dados válidos de PostTag
	 */
	const makeValidPostTagData = (
		overrides: Partial<IUnmountedPostTag> = {},
	): IUnmountedPostTag => ({
		...makeEntityFactory(),
		name: faker.lorem.word(),
		slug: faker.helpers.slugify(faker.lorem.words(2)),
		hidden: true,
		...overrides,
	});

	/**
	 * Reinicia o repositório antes de cada teste
	 */
	beforeEach(() => {
		repository = new PostTagRepository();
	});

	describe("findById()", () => {
		it("deve encontrar uma tag por ID", async () => {
			// Arrange
			const tag = makeValidPostTagData();
			repository.seed([tag]);

			// Act
			const found = await repository.findById(tag.id);

			// Assert
			expect(found).not.toBeNull();
			expect(found?.id).toBe(tag.id);
		});

		it("deve retornar null quando tag não existe", async () => {
			// Arrange
			const nonExistentId = generateUUID();

			// Act
			const found = await repository.findById(nonExistentId);

			// Assert
			expect(found).toBeNull();
		});

		it("deve retornar a tag com todas as propriedades", async () => {
			// Arrange
			const tag = makeValidPostTagData();
			repository.seed([tag]);

			// Act
			const found = await repository.findById(tag.id);

			// Assert
			expect(found).toMatchObject({
				id: tag.id,
				name: tag.name,
				slug: tag.slug,
				createdAt: tag.createdAt,
				updatedAt: tag.updatedAt,
			});
		});
	});

	describe("seed()", () => {
		it("deve popular o repositório com múltiplas tags", () => {
			// Arrange
			const tags = [
				makeValidPostTagData(),
				makeValidPostTagData(),
				makeValidPostTagData(),
			];

			// Act
			repository.seed(tags);

			// Assert
			expect(repository.count()).toBe(3);
		});

		it("deve sobrescrever tag existente com mesmo ID", () => {
			// Arrange
			const id = generateUUID();
			const tag1 = makeValidPostTagData({ id, name: "Original" });
			const tag2 = makeValidPostTagData({ id, name: "Atualizada" });

			// Act
			repository.seed([tag1]);
			repository.seed([tag2]);

			// Assert
			const found = repository.getAll();
			expect(found).toHaveLength(1);
			expect(found[0]?.name).toBe("Atualizada");
		});
	});

	describe("clear()", () => {
		it("deve limpar todas as tags do repositório", () => {
			// Arrange
			const tags = [makeValidPostTagData(), makeValidPostTagData()];
			repository.seed(tags);

			// Act
			repository.clear();

			// Assert
			expect(repository.count()).toBe(0);
		});
	});

	describe("getAll()", () => {
		it("deve retornar todas as tags", () => {
			// Arrange
			const tags = [
				makeValidPostTagData(),
				makeValidPostTagData(),
				makeValidPostTagData(),
			];
			repository.seed(tags);

			// Act
			const allTags = repository.getAll();

			// Assert
			expect(allTags).toHaveLength(3);
		});

		it("deve retornar array vazio quando repositório está vazio", () => {
			// Act
			const allTags = repository.getAll();

			// Assert
			expect(allTags).toEqual([]);
		});
	});

	describe("length()", () => {
		it("deve retornar 0 para repositório vazio", () => {
			// Act
			const length = repository.count();

			// Assert
			expect(length).toBe(0);
		});

		it("deve retornar a quantidade correta de tags", () => {
			// Arrange
			const tags = [
				makeValidPostTagData(),
				makeValidPostTagData(),
				makeValidPostTagData(),
			];
			repository.seed(tags);

			// Act
			const length = repository.count();

			// Assert
			expect(length).toBe(3);
		});

		it("deve refletir mudanças após operações", () => {
			// Arrange
			const tag1 = makeValidPostTagData();
			const tag2 = makeValidPostTagData();

			// Act & Assert
			expect(repository.count()).toBe(0);

			repository.seed([tag1]);
			expect(repository.count()).toBe(1);

			repository.seed([tag2]);
			expect(repository.count()).toBe(2);

			repository.clear();
			expect(repository.count()).toBe(0);
		});
	});
});
