import type { IConstructorPost, IPost } from "./types";
import { UnpackedPostSchema } from "./schemas";
import { Entity } from "@roastery/beans";
import {
	EntityContext,
	EntitySchema,
	EntitySource,
} from "@roastery/beans/entity/symbols";
import type { Schema } from "@roastery/terroir/schema";
import {
	DefinedStringVO,
	SlugVO,
	UrlVO,
} from "@roastery/beans/collections/value-objects";
import type { IPostType } from "@roastery-capsules/post.post-type/domain/types";
import type { IPostTag } from "@roastery-capsules/post.post-tag/domain/types";
import type { EntityDTO } from "@roastery/beans/entity/dtos";
import { makeEntity } from "@roastery/beans/entity/factories";
import { AutoUpdate } from "@roastery/beans/entity/decorators";

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
		{ cover, description, tags, type, name, slug }: IConstructorPost,
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

	public static make(
		initialProps: IConstructorPost,
		entityProps?: EntityDTO,
	): IPost {
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
