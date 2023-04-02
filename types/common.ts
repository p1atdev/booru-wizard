export type Filetype = "jpg" | "png" | "gif" | "webm" | "mp4" | "zip" | "webp" | "AVIF"

export type Rating = "general" | "sensitive" | "questionable" | "explicit" | "g" | "s" | "q" | "e"
export type LongRating = "general" | "sensitive" | "questionable" | "explicit"

export const RatingAlias: Record<Rating, LongRating> = {
    g: "general",
    s: "sensitive",
    q: "questionable",
    e: "explicit",
    general: "general",
    sensitive: "sensitive",
    questionable: "questionable",
    explicit: "explicit",
}
