import type { IPost } from "./types";
import { Entity } from "@caffeine/entity";
import { UnpackedPostSchema } from "./schemas";
import type { IPostTag } from "@caffeine-packages/post.post-tag/domain/types";
import type { IPostType } from "@caffeine-packages/post.post-type/domain/types";
import {
    EntityContext,
    EntitySchema,
    EntitySource,
} from "@caffeine/entity/symbols";
import type { Schema } from "@caffeine/schema";
import { DefinedStringVO, SlugVO, UrlVO } from "@caffeine/value-objects";
import type { EntityDTO } from "@caffeine/entity/dtos";
import type { IRawPost } from "./types/raw-post.interface";
import { AutoUpdate } from "@caffeine/entity/decorators";
import { makeEntity } from "@caffeine/entity/factories";

export class Post extends Entity<UnpackedPostSchema> implements IPost {
    public override readonly [EntitySource]: string = "post@post";
    public static readonly [EntitySource]: string = "post@post";
    public override readonly [EntitySchema]: Schema<UnpackedPostSchema> =
        UnpackedPostSchema;

    private _name: DefinedStringVO;
    private _slug: SlugVO;
    private _description: DefinedStringVO;
    private _cover: UrlVO;
    private _type: IPostType;
    private _tags: IPostTag[];

    private constructor(
        { cover, description, tags, type, name, slug }: IRawPost,
        entityProps: EntityDTO,
    ) {
        super(entityProps);

        this._name = DefinedStringVO.make(name, this[EntityContext]("name"));
        this._slug = SlugVO.make(slug ?? name, this[EntityContext]("slug"));
        this._description = DefinedStringVO.make(
            description,
            this[EntityContext]("description"),
        );
        this._cover = UrlVO.make(cover, this[EntityContext]("cover"));
        this._type = type;
        this._tags = tags;
    }

    public static make(initialProps: IRawPost, entityProps?: EntityDTO): IPost {
        return new Post(initialProps, entityProps ?? makeEntity());
    }

    @AutoUpdate
    rename(value: string): void {
        this._name = DefinedStringVO.make(value, this[EntityContext]("name"));
    }

    @AutoUpdate
    reslug(value: string): void {
        this._slug = SlugVO.make(value, this[EntityContext]("slug"));
    }

    @AutoUpdate
    updateDescription(value: string): void {
        this._description = DefinedStringVO.make(
            value,
            this[EntityContext]("description"),
        );
    }

    @AutoUpdate
    updateCover(value: string): void {
        this._cover = UrlVO.make(value, this[EntityContext]("cover"));
    }

    @AutoUpdate
    updateTags(values: IPostTag[]): void {
        this._tags = values;
    }

    get name(): string {
        return this._name.value;
    }

    get slug(): string {
        return this._slug.value;
    }

    get description(): string {
        return this._description.value;
    }

    get cover(): string {
        return this._cover.value;
    }

    get tags(): IPostTag[] {
        return this._tags;
    }

    get type(): IPostType {
        return this._type;
    }
}
