import { CreatePostUseCase } from "@/application/use-cases/create-post.use-case";
import { makePostRepository } from "../../repositories/post.repository.factory";
import { PostUniquenessChecker } from "@/domain/services/post-uniqueness-checker.service";
import { PopulatePostService } from "@/application/services/populate-post.service";
import { FindPostTagsService } from "@/application/services/find-many-post-tags.service";
import { makePostTagRepository } from "../../repositories/post-tag.repository.factory";
import { FindPostTypeService } from "@/application/services/find-post-type.service";
import { makePostTypeRepository } from "../../repositories/post-type.repository.factory";

export function makeCreatePostUseCase(): CreatePostUseCase {
    const postRepository = makePostRepository();
    const postTagRepository = makePostTagRepository();
    const postTypeRepository = makePostTypeRepository();

    return new CreatePostUseCase(
        postRepository,
        new PostUniquenessChecker(postRepository),
        new PopulatePostService(
            new FindPostTagsService(postTagRepository),
            new FindPostTypeService(postTypeRepository),
        ),
    );
}
