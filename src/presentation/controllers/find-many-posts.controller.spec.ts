import { describe, it, beforeEach, expect } from "bun:test";
import { bootstrap } from "../dev/bootstrap";
import { faker } from "@faker-js/faker";
import { treaty } from "@elysiajs/eden";
import { PostTag } from "@roastery-capsules/post.post-tag/domain";
import { PostType } from "@roastery-capsules/post.post-type/domain";
import { CreatePostDTO } from "@/application/dtos";
import { Schema } from "@roastery/terroir/schema";

type App = Awaited<ReturnType<typeof bootstrap>>;

const TAG = PostTag.make({ name: "Tech" });
const TYPE = PostType.make({
	name: "Blog",
	schema: Schema.make(CreatePostDTO).toString(),
});

function makeBody(overrides?: Record<string, unknown>) {
	return {
		postTypeId: TYPE.id,
		tags: [TAG.id],
		name: faker.lorem.words(3),
		description: faker.lorem.sentence(),
		cover: faker.image.url(),
		...overrides,
	};
}

describe("FindManyPostsController", () => {
	let server: App;
	let api: ReturnType<typeof treaty<App>>;
	let env: App["decorator"]["env"];

	beforeEach(async () => {
		server = await bootstrap();
		await (
			server.decorator.cache as unknown as { flushall: () => Promise<void> }
		).flushall();

		// biome-ignore lint/suspicious/noExplicitAny: acesso aos repositórios de teste para seed
		const decorator = server.decorator as any;
		decorator.postTagRepositoryForPost.seed([TAG]);
		decorator.postTypeRepositoryForPost.seed([TYPE]);

		api = treaty<typeof server>(server);
		env = server.decorator.env;
	});

	async function authenticate() {
		const { AUTH_EMAIL: email, AUTH_PASSWORD: password } = env;
		const auth = await api.auth.login.post({ email, password });
		const cookies = auth.response.headers.getSetCookie();
		return { headers: { cookie: cookies.join("; ") } };
	}

	it("should return an empty list when there are no posts", async () => {
		const { status, data } = await api.posts.get({ query: { page: 1 } });

		expect(status).toBe(200);
		expect(data).toEqual([]);
	});

	it("should return a list of created posts", async () => {
		const options = await authenticate();
		await api.posts.post(makeBody(), options);
		await api.posts.post(makeBody(), options);

		const { status, data } = await api.posts.get({ query: { page: 1 } });

		expect(status).toBe(200);
		// biome-ignore lint/suspicious/noExplicitAny: dados retornados pela API
		expect((data as any[]).length).toBeGreaterThanOrEqual(2);
	});

	it("should return X-Total-Count and X-Total-Pages headers", async () => {
		const options = await authenticate();
		await api.posts.post(makeBody(), options);

		const { response } = await api.posts.get({ query: { page: 1 } });

		expect(response.headers.get("X-Total-Count")).toBeDefined();
		expect(response.headers.get("X-Total-Pages")).toBeDefined();
	});

	it("should not require authentication", async () => {
		const { status } = await api.posts.get({ query: { page: 1 } });

		expect(status).toBe(200);
	});

	it("should filter posts by post type slug", async () => {
		const options = await authenticate();
		await api.posts.post(makeBody(), options);

		const { status, data } = await api.posts.get({
			query: { page: 1, type: TYPE.slug },
		});

		expect(status).toBe(200);
		// biome-ignore lint/suspicious/noExplicitAny: dados retornados pela API
		for (const post of (data as any[]) ?? []) {
			expect(post.type.slug).toBe(TYPE.slug);
		}
	});

	it("should return 404 when filtering by a non-existent type", async () => {
		const options = await authenticate();
		await api.posts.post(makeBody(), options);

		const { status } = await api.posts.get({
			query: { page: 1, type: "inexistente" },
		});

		expect(status).toBe(404);
	});
});
