import type { IPostReader } from "@/domain/types/repositories/post-reader.interface";
import { GetNumberOfPagesService } from "@roastery/seedbed/application/services";
import type { ICountItems } from "@roastery/seedbed/application/types";

export class CountPostsUseCase {
	public constructor(private readonly reader: IPostReader) {}

	public async run(postTypeId?: string): Promise<ICountItems> {
		const count = await (postTypeId
			? this.reader.countByPostType(postTypeId)
			: this.reader.count());

		return {
			totalPages: GetNumberOfPagesService.run(count),
			count,
		};
	}
}
