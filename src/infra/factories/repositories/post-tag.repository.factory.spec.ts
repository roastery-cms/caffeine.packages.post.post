import { describe, expect, it } from "bun:test";
import { makePostTagRepository } from "./post-tag.repository.factory";
import { PostTagRepository as ApiPostTagRepository } from "@/infra/repositories/api/post-tag.repository";
import { PostTagRepository as TestPostTagRepository } from "@/infra/repositories/test/post-tag.repository";

describe("makePostTagRepository", () => {
	it("should return a TestPostTagRepository when target is not provided", () => {
		const repo = makePostTagRepository({ baseUrl: "http://localhost:3000" });
		expect(repo).toBeInstanceOf(TestPostTagRepository);
	});

	it("should return a TestPostTagRepository when target is MEMORY", () => {
		const repo = makePostTagRepository({
			baseUrl: "http://localhost:3000",
			target: "MEMORY",
		});
		expect(repo).toBeInstanceOf(TestPostTagRepository);
	});

	it("should return an ApiPostTagRepository when target is API", () => {
		const repo = makePostTagRepository({
			baseUrl: "http://localhost:3000",
			target: "API",
		});
		expect(repo).toBeInstanceOf(ApiPostTagRepository);
	});
});
