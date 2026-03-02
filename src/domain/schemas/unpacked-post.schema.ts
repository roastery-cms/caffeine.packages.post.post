import { Schema } from "@caffeine/schema";
import { UnpackedPostDTO } from "../dtos";

export const UnpackedPostSchema: Schema<typeof UnpackedPostDTO> =
    Schema.make<typeof UnpackedPostDTO>(UnpackedPostDTO);

export type UnpackedPostSchema = typeof UnpackedPostDTO;
