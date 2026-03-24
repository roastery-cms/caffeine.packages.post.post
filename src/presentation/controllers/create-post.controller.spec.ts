import { describe, it, beforeEach, expect } from "bun:test";
import { bootstrap } from "../dev/bootstrap";
import { faker } from "@faker-js/faker";
import { treaty } from "@elysiajs/eden";
import { slugify } from "@roastery/beans/entity/helpers";
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

describe("CreatePostController", () => {
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

	it("should create a post and return 201", async () => {
		const options = await authenticate();

		const { status } = await api.posts.post(makeBody(), options);

		expect(status).toBe(201);
	});

	it("should return the full post payload on creation", async () => {
		const options = await authenticate();
		const body = makeBody();

		const { data } = await api.posts.post(body, options);

		expect(data).toMatchObject({
			name: body.name,
			slug: slugify(body.name),
			description: body.description,
		});
		expect(data?.id).toBeDefined();
		expect(data?.createdAt).toBeDefined();
		expect(data?.updatedAt).toBeUndefined();
	});

	it("should reject unauthenticated requests", async () => {
		const { status } = await api.posts.post(makeBody());

		expect(status).not.toBe(201);
	});

	it("should reject a request with an empty name", async () => {
		const options = await authenticate();

		const { status } = await api.posts.post(
			{ ...makeBody(), name: "" } as never,
			options,
		);

		expect(status).toBe(422);
	});

	it("should not allow duplicate posts with the same slug", async () => {
		const options = await authenticate();
		const body = makeBody({ name: "Meu Post Duplicado" });

		const first = await api.posts.post(body, options);
		expect(first.status).toBe(201);

		const second = await api.posts.post(body, options);
		expect(second.status).not.toBe(201);
	});

	it("should generate different slugs for different names", async () => {
		const options = await authenticate();

		const first = await api.posts.post(
			makeBody({ name: "Post Alpha Único" }),
			options,
		);
		const second = await api.posts.post(
			makeBody({ name: "Post Beta Diferente" }),
			options,
		);

		expect(first.status).toBe(201);
		expect(second.status).toBe(201);
		// biome-ignore lint/suspicious/noExplicitAny: dados retornados pela API
		expect((first.data as any)?.slug).not.toBe((second.data as any)?.slug);
	});
});
