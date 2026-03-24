import { describe, expect, it } from "bun:test";
import { makePostTypeRepository } from "./post-type.repository.factory";
import { PostTypeRepository as ApiPostTypeRepository } from "@/infra/repositories/api/post-type.repository";
import { PostTypeRepository as TestPostTypeRepository } from "@/infra/repositories/test/post-type.repository";

describe("makePostTypeRepository", () => {
	it("should return a TestPostTypeRepository when target is not provided", () => {
		const repo = makePostTypeRepository({ baseUrl: "http://localhost:3000" });
		expect(repo).toBeInstanceOf(TestPostTypeRepository);
	});

	it("should return a TestPostTypeRepository when target is MEMORY", () => {
		const repo = makePostTypeRepository({
			baseUrl: "http://localhost:3000",
			target: "MEMORY",
		});
		expect(repo).toBeInstanceOf(TestPostTypeRepository);
	});

	it("should return an ApiPostTypeRepository when target is API", () => {
		const repo = makePostTypeRepository({
			baseUrl: "http://localhost:3000",
			target: "API",
		});
		expect(repo).toBeInstanceOf(ApiPostTypeRepository);
	});
});
