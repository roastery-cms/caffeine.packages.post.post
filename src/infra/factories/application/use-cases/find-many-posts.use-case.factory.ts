import { FindManyPostsUseCase } from "@/application/use-cases/find-many-posts.use-case";
import { makePostRepository } from "../../repositories/post.repository.factory";
import { FindPostTypeBySlugService } from "@/application/services/find-post-type-by-slug.service";
import { makePostTypeRepository } from "../../repositories/post-type.repository.factory";
import { PopulateManyPostsService } from "@/application/services/populate-many-posts.service";
import { FindPostTagsService } from "@/application/services/find-many-post-tags.service";
import { makePostTagRepository } from "../../repositories/post-tag.repository.factory";
import { FindPostTypesService } from "@/application/services/find-many-post-types.service";

export function makeFindManyPostsUseCase(): FindManyPostsUseCase {
    const postRepository = makePostRepository();
    const postTypeRepository = makePostTypeRepository();
    const postTagRepository = makePostTagRepository();

    return new FindManyPostsUseCase(
        postRepository,
        new FindPostTypeBySlugService(postTypeRepository),
        new PopulateManyPostsService(
            new FindPostTagsService(postTagRepository),
            new FindPostTypesService(postTypeRepository),
        ),
    );
}
