import { describe, expect, it } from "bun:test";
import { makeFindManyPostTypesService } from "./make-find-many-post-types.service.factory";
import { PostTypeRepository } from "@/infra/repositories/test/post-type.repository";
import { FindManyPostTypesService } from "@/application/services";

describe("makeFindManyPostTypesService", () => {
	it("should return a FindManyPostTypesService instance", () => {
		const service = makeFindManyPostTypesService(new PostTypeRepository());
		expect(service).toBeInstanceOf(FindManyPostTypesService);
	});
});
