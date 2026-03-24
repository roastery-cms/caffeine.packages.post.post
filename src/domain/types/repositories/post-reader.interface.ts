import type { UnpackedPostSchema } from "@/domain/schemas";
import type { IPost } from "@/domain/types";
import type {
	ICanReadId,
	ICanReadSlug,
} from "@roastery/seedbed/domain/types/repositories";

export interface IPostReader
	extends ICanReadId<UnpackedPostSchema, IPost>,
		ICanReadSlug<UnpackedPostSchema, IPost> {
	findManyByIds(ids: string[]): Promise<Array<IPost | null>>;
	findMany(page: number): Promise<IPost[]>;
	findManyByPostType(postTypeId: string, page: number): Promise<IPost[]>;
	count(): Promise<number>;
	countByPostType(postTypeId: string): Promise<number>;
}
