import type { IRawEntity } from "@roastery/beans/entity/types";
import type { IRawPost } from "./raw-post.interface";

export interface IUnpackedPost extends IRawPost, IRawEntity {}
