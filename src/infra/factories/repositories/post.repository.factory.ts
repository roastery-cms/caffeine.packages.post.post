import type { IPostRepository } from "@/domain/types/repositories/post-repository.interface";
import type { PostRepositoryProviderDTO } from "./dtos";
import { Post } from "@/domain";
import { PostRepository as PrismaPostRepository } from "@/infra/repositories/prisma";
import { PostRepository as TestPostRepository } from "@/infra/repositories/test";
import { PostRepository as CachedPostRepository } from "@/infra/repositories/cached";
import type { BaristaCacheInstance } from "@roastery-adapters/cache";
import type { PrismaClient } from "@roastery-adapters/post";
import { ResourceNotFoundException } from "@roastery/terroir/exceptions/infra";
import { EntitySource } from "@roastery/beans/entity/symbols";

type MakePostRepositoryArgs = {
	target?: PostRepositoryProviderDTO;
	cache: BaristaCacheInstance;
	prismaClient?: PrismaClient;
};

export function makePostRepository({
	cache,
	prismaClient,
	target,
}: MakePostRepositoryArgs): IPostRepository {
	if (target === "PRISMA" && !prismaClient)
		throw new ResourceNotFoundException(Post[EntitySource]);

	const repository: IPostRepository =
		target === "PRISMA" && prismaClient
			? new PrismaPostRepository(prismaClient)
			: new TestPostRepository();

	return new CachedPostRepository(repository, cache);
}
