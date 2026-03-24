import { BooleanDTO } from "@roastery/beans/collections/dtos";
import { t } from "@roastery/terroir";

export const UpdatePostQueryParamsDTO = t.Object({
	"update-slug": t.Optional(BooleanDTO),
});

export type UpdatePostQueryParamsDTO = t.Static<
	typeof UpdatePostQueryParamsDTO
>;
