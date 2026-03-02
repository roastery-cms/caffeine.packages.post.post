import { describe, it, expect, beforeEach } from "vitest";
import { faker } from "@faker-js/faker";
import { PostTypeRepository } from "./post-type.repository";
import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";
import { t } from "@caffeine/models";
import { generateUUID } from "@caffeine/entity/helpers";
import { makeEntityFactory } from "@caffeine/entity/factories";
import { Schema } from "@caffeine/schema";

describe("PostTypeRepository", () => {
	let repository: PostTypeRepository;

	/**
	 * Factory para criar dados válidos de PostType
	 */
	const makeValidPostTypeData = (
		overrides: Partial<IUnmountedPostType> = {},
	): IUnmountedPostType => ({
		...makeEntityFactory(),
		name: faker.lorem.word(),
		slug: faker.helpers.slugify(faker.lorem.words(2)),
		schema: Schema.make(t.Object({ name: t.String() })).toString(),
		isHighlighted: true,
		...overrides,
	});

	/**
	 * Reinicia o repositório antes de cada teste
	 */
	beforeEach(() => {
		repository = new PostTypeRepository();
	});

	describe("findById()", () => {
		it("deve encontrar um tipo por ID", async () => {
			// Arrange
			const type = makeValidPostTypeData();
			repository.seed([type]);

			// Act
			const found = await repository.findById(type.id);

			// Assert
			expect(found).not.toBeNull();
			expect(found?.id).toBe(type.id);
		});

		it("deve retornar null quando tipo não existe", async () => {
			// Arrange
			const nonExistentId = generateUUID();

			// Act
			const found = await repository.findById(nonExistentId);

			// Assert
			expect(found).toBeNull();
		});

		it("deve retornar o tipo com todas as propriedades", async () => {
			// Arrange
			const type = makeValidPostTypeData();
			repository.seed([type]);

			// Act
			const found = await repository.findById(type.id);

			// Assert
			expect(found).toMatchObject({
				id: type.id,
				name: type.name,
				slug: type.slug,
				createdAt: type.createdAt,
				updatedAt: type.updatedAt,
			});
		});
	});

	describe("findBySlug()", () => {
		it("deve encontrar um tipo por slug", async () => {
			// Arrange
			const type = makeValidPostTypeData({ slug: "artigo-teste" });
			repository.seed([type]);

			// Act
			const found = await repository.findBySlug("artigo-teste");

			// Assert
			expect(found).not.toBeNull();
			expect(found?.slug).toBe("artigo-teste");
			expect(found?.id).toBe(type.id);
		});

		it("deve retornar null quando tipo não existe", async () => {
			// Arrange
			const nonExistentSlug = "slug-inexistente";

			// Act
			const found = await repository.findBySlug(nonExistentSlug);

			// Assert
			expect(found).toBeNull();
		});

		it("deve retornar o tipo com todas as propriedades", async () => {
			// Arrange
			const type = makeValidPostTypeData({ slug: "tutorial" });
			repository.seed([type]);

			// Act
			const found = await repository.findBySlug("tutorial");

			// Assert
			expect(found).toMatchObject({
				id: type.id,
				name: type.name,
				slug: type.slug,
				createdAt: type.createdAt,
				updatedAt: type.updatedAt,
			});
		});

		it("deve encontrar o tipo correto quando há múltiplos tipos", async () => {
			// Arrange
			const types = [
				makeValidPostTypeData({ slug: "artigo" }),
				makeValidPostTypeData({ slug: "tutorial" }),
				makeValidPostTypeData({ slug: "video" }),
			];
			repository.seed(types);

			// Act
			const found = await repository.findBySlug("tutorial");

			// Assert
			expect(found).not.toBeNull();
			expect(found?.slug).toBe("tutorial");
			expect(found?.id).toBe(types[1]?.id);
		});
	});

	describe("seed()", () => {
		it("deve popular o repositório com múltiplos tipos", () => {
			// Arrange
			const types = [
				makeValidPostTypeData(),
				makeValidPostTypeData(),
				makeValidPostTypeData(),
			];

			// Act
			repository.seed(types);

			// Assert
			expect(repository.count()).toBe(3);
		});

		it("deve sobrescrever tipo existente com mesmo ID", () => {
			// Arrange
			const id = generateUUID();
			const type1 = makeValidPostTypeData({ id, name: "Original" });
			const type2 = makeValidPostTypeData({ id, name: "Atualizado" });

			// Act
			repository.seed([type1]);
			repository.seed([type2]);

			// Assert
			const found = repository.getAll();
			expect(found).toHaveLength(1);
			expect(found[0]?.name).toBe("Atualizado");
		});
	});

	describe("clear()", () => {
		it("deve limpar todos os tipos do repositório", () => {
			// Arrange
			const types = [makeValidPostTypeData(), makeValidPostTypeData()];
			repository.seed(types);

			// Act
			repository.clear();

			// Assert
			expect(repository.count()).toBe(0);
		});
	});

	describe("getAll()", () => {
		it("deve retornar todos os tipos", () => {
			// Arrange
			const types = [
				makeValidPostTypeData(),
				makeValidPostTypeData(),
				makeValidPostTypeData(),
			];
			repository.seed(types);

			// Act
			const allTypes = repository.getAll();

			// Assert
			expect(allTypes).toHaveLength(3);
		});

		it("deve retornar array vazio quando repositório está vazio", () => {
			// Act
			const allTypes = repository.getAll();

			// Assert
			expect(allTypes).toEqual([]);
		});
	});

	describe("length()", () => {
		it("deve retornar 0 para repositório vazio", () => {
			// Act
			const length = repository.count();

			// Assert
			expect(length).toBe(0);
		});

		it("deve retornar a quantidade correta de tipos", () => {
			// Arrange
			const types = [
				makeValidPostTypeData(),
				makeValidPostTypeData(),
				makeValidPostTypeData(),
			];
			repository.seed(types);

			// Act
			const length = repository.count();

			// Assert
			expect(length).toBe(3);
		});

		it("deve refletir mudanças após operações", () => {
			// Arrange
			const type1 = makeValidPostTypeData();
			const type2 = makeValidPostTypeData();

			// Act & Assert
			expect(repository.count()).toBe(0);

			repository.seed([type1]);
			expect(repository.count()).toBe(1);

			repository.seed([type2]);
			expect(repository.count()).toBe(2);

			repository.clear();
			expect(repository.count()).toBe(0);
		});
	});
});
