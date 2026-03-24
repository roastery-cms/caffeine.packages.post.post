import { describe, expect, it } from "bun:test";
import { makeFindPostTagService } from "./make-find-post-tag.service.factory";
import { PostTagRepository } from "@/infra/repositories/test/post-tag.repository";
import { FindPostTagService } from "@/application/services";

describe("makeFindPostTagService", () => {
	it("should return a FindPostTagService instance", () => {
		const service = makeFindPostTagService(new PostTagRepository());
		expect(service).toBeInstanceOf(FindPostTagService);
	});
});
