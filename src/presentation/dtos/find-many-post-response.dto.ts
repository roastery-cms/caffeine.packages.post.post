import { UnpackedPostDTO } from "@/domain/dtos";
import { t } from "@roastery/terroir";

export const FindManyPostsResponseDTO = t.Array(UnpackedPostDTO, {
	description: "A paginated list of post types.",
});

export type FindManyPostsResponseDTO = t.Static<
	typeof FindManyPostsResponseDTO
>;
