import { Filetype } from "./mod.ts"
// import { Comparable } from "./comparable.ts"
import { Rating } from "./common.ts"

export interface SearchTagOptions {
    general?: string
    optional?: {
        score?: string
        rating?: Rating | Rating[]
        filetype?: Filetype | Filetype[]
    }
}
