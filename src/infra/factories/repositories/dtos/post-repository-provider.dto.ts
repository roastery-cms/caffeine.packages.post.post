import { t } from "@roastery/terroir";

export const PostRepositoryProviderDTO = t.Union([
	t.Literal("PRISMA"),
	t.Literal("MEMORY"),
]);

export type PostRepositoryProviderDTO = t.Static<
	typeof PostRepositoryProviderDTO
>;
