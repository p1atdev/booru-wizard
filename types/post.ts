import { Filetype, Rating } from "./common.ts"

export interface Post {
    id: number
    created_at: string
    parent_id: number
    md5: string
    score: number
    rating: Rating

    width: number
    height: number

    image: string
    source: string
    sample: number

    tags?: string
    tag_string_general?: string
    tag_string_character?: string
    tag_string_copyright?: string
    tag_string_artist?: string
    tag_string_meta?: string

    file_url: string
    preview_url: string
    status: Status

    has_children: string | boolean
}

export interface DanbooruPost extends Post {
    id: number
    created_at: string
    uploader_id: number
    score: number
    source: string
    md5: string
    last_comment_bumped_at: string | null
    rating: Rating
    image_width: number
    image_height: number
    tag_string: string
    fav_count: number
    file_ext: Filetype
    last_noted_at: string | null
    parent_id: number
    has_children: boolean
    approver_id: number
    tag_count_general: number
    tag_count_artist: number
    tag_count_character: number
    tag_count_copyright: number
    file_size: number
    up_score: number
    down_score: number
    is_pending: boolean
    is_flagged: boolean
    is_deleted: boolean
    tag_count: number
    updated_at: Date
    is_banned: boolean
    pixiv_id: number | null
    last_commented_at: string | null
    has_active_children: boolean
    bit_flags: number
    tag_count_meta: number
    has_large: boolean
    has_visible_children: boolean
    tag_string_general: string
    tag_string_character: string
    tag_string_copyright: string
    tag_string_artist: string
    tag_string_meta: string
    file_url: string
    large_file_url: string
    preview_file_url: string
}

export interface GelbooruPost extends Post {
    id: number
    created_at: string
    score: number
    width: number
    height: number
    md5: string
    directory: string
    image: string
    rating: Rating
    source: string
    change: number
    owner: string
    creator_id: number
    parent_id: number
    sample: number
    preview_height: number
    preview_width: number
    tags: string
    title: string
    has_notes: string
    has_comments: string
    file_url: string
    preview_url: string
    sample_url: string
    sample_height: number
    sample_width: number
    status: Status
    post_locked: number
    has_children: string
}

export enum Status {
    Active = "active",
    Pending = "pending",
}
