import PostTypeTags from "../tags";
import {
	makePostRepository,
	makePostTagRepository,
	makePostTypeRepository,
} from "@/infra/factories/repositories";
import { PostTypeRoutes } from "../routes";
import { PostDependenciesDTO } from "@/infra/dependencies";
import { PostRepositoryPlugin } from "../plugins";
import type {
	IPostRepository,
	IPostTagRepository,
	IPostTypeRepository,
} from "@/domain/types/repositories";
import { barista } from "@roastery/barista";
import { CacheEnvDependenciesDTO } from "@roastery-adapters/cache/dtos";
import { AuthEnvDependenciesDTO } from "@roastery-capsules/auth/dtos";
import { GetAccessController } from "@roastery-capsules/auth/plugins/controllers";
import BaristaAuthTags from "@roastery-capsules/auth/plugins/tags";
import { baristaEnv } from "@roastery-capsules/env";
import { baristaErrorHandler } from "@roastery-capsules/api-error-handler";
import { baristaResponseMapper } from "@roastery-capsules/api-response-mapper";
import { cache } from "@roastery-adapters/cache";
import { postAdapter as baristaPostAdapter } from "@roastery-adapters/post/plugins";
import { baristaApiDocs } from "@roastery-capsules/api-docs";
import { UnknownException } from "@roastery/terroir/exceptions";

export async function bootstrap(open: boolean = false) {
	const app = barista({ name: "@caffeine" })
		.use(
			baristaEnv(
				CacheEnvDependenciesDTO,
				AuthEnvDependenciesDTO,
				PostDependenciesDTO,
			),
		)
		.use(baristaErrorHandler)
		.use(baristaResponseMapper)
		.use((app) => {
			const { CACHE_PROVIDER, REDIS_URL } = app.decorator.env;

			return app.use(cache({ CACHE_PROVIDER, REDIS_URL }));
		});

	const { env } = app.decorator;
	const {
		AUTH_EMAIL,
		AUTH_PASSWORD,
		JWT_SECRET,
		DATABASE_URL,
		DATABASE_PROVIDER,
		PORT,
		NODE_ENV,
		CACHE_PROVIDER,
		REDIS_URL,
		POST_TAG_BASE_URL,
		POST_TYPE_BASE_URL,
	} = env;

	let postRepository: IPostRepository;
	const postTagRepository: IPostTagRepository = makePostTagRepository({
		baseUrl: POST_TAG_BASE_URL ?? `http://localhost:${PORT}`,
		target: POST_TAG_BASE_URL ? "API" : "MEMORY",
	});
	const postTypeRepository: IPostTypeRepository = makePostTypeRepository({
		baseUrl: POST_TYPE_BASE_URL ?? `http://localhost:${PORT}`,
		target: POST_TYPE_BASE_URL ? "API" : "MEMORY",
	});

	if (DATABASE_URL && DATABASE_PROVIDER === "PRISMA") {
		const postAdapter = await baristaPostAdapter(DATABASE_URL);

		app.use(postAdapter).use((app) => {
			const { postPrismaClient: prismaClient, cache } = app.decorator;

			postRepository = makePostRepository({
				cache,
				prismaClient,
				target: DATABASE_PROVIDER,
			});

			return app.use(
				PostRepositoryPlugin(
					postRepository,
					postTagRepository,
					postTypeRepository,
				),
			);
		});
	} else {
		app.use((app) => {
			const { cache } = app.decorator;

			postRepository = makePostRepository({
				cache,
				target: "MEMORY",
			});

			return app.use(
				PostRepositoryPlugin(
					postRepository,
					postTagRepository,
					postTypeRepository,
				),
			);
		});
	}

	if (!postRepository!) throw new UnknownException();

	return app
		.use(
			GetAccessController({
				AUTH_EMAIL,
				AUTH_PASSWORD,
				JWT_SECRET,
				CACHE_PROVIDER,
				REDIS_URL,
			}),
		)
		.use((app) => {
			const { env } = app.decorator;
			const { CACHE_PROVIDER, JWT_SECRET, REDIS_URL } = env;
			return app.use(
				PostTypeRoutes({
					cacheProvider: CACHE_PROVIDER,
					jwtSecret: JWT_SECRET,
					postRepository,
					postTagRepository,
					postTypeRepository,
					redisUrl: REDIS_URL,
				}),
			);
		})
		.use(
			baristaApiDocs(NODE_ENV === "DEVELOPMENT", `http://localhost:${PORT}`, {
				info: {
					title: "Caffeine",
					version: "1.0",
					contact: {
						email: "alanreisanjo@gmail.com",
						name: "Alan Reis",
						url: "https://hoyasumii.dev",
					},
					description:
						"A RESTful API for managing Post Types within the Caffeine CMS platform. This microservice is responsible for creating, retrieving, updating, and deleting Post Types, handling global uniqueness through slugs, schema management for diverse content structures, and toggleable highlight states.",
				},
				tags: [BaristaAuthTags, PostTypeTags],
			}),
		)
		.use((app) => {
			if (open) {
				app.listen(app.decorator.env.PORT, () => {
					console.log(
						`🦊 Server is running at: http://localhost:${app.decorator.env.PORT}`,
					);
				});
			}

			return app;
		});
}
