import { UrlDTO } from "@roastery/beans/collections/dtos";
import { PostRepositoryProviderDTO } from "../factories/repositories/dtos";
import { t } from "@roastery/terroir";

export const PostDependenciesDTO = t.Object({
	DATABASE_URL: t.Optional(t.String()),
	DATABASE_PROVIDER: t.Optional(PostRepositoryProviderDTO),
	POST_TYPE_BASE_URL: t.Optional(UrlDTO),
	POST_TAG_BASE_URL: t.Optional(UrlDTO),
});

export type PostDependenciesDTO = t.Static<typeof PostDependenciesDTO>;
