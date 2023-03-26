import { BooruClientConfig, BooruHost, ScraperProtocol } from "./client.ts"
import { SearchTagOptions, CommonSearchParameters, Post, GelbooruPost } from "./types/mod.ts"

const PAGE_LIMIT = 100

export class GelbooruScraper implements ScraperProtocol {
    host: BooruHost
    config: BooruClientConfig

    constructor(config: BooruClientConfig, host: BooruHost) {
        this.host = host
        this.config = config
    }

    async getPosts(tagOptions: SearchTagOptions, params: CommonSearchParameters): Promise<Post[]> {
        const url = new URL(this.host.postsPath, this.host.origin)
        url.searchParams.set("page", "dapi")
        url.searchParams.set("s", "post")
        url.searchParams.set("q", "index")
        url.searchParams.set("json", "1")

        const tags: string[] = []

        if (tagOptions.general) {
            tags.push(tagOptions.general)
        }

        if (tagOptions.optional) {
            const optionals = Object.entries(tagOptions.optional)
                .filter(([_key, value]) => value !== undefined)
                .filter(([key, _value]) => key !== "filetype") // not supported by gelbooru
                .map(([key, value]) => {
                    if (Array.isArray(value)) {
                        return `${key}:${value.join(",")}}`
                    } else {
                        return `${key}:${value}`
                    }
                })
            tags.push(...optionals)
        }

        url.searchParams.set("tags", tags.join(" "))

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                if (key === "page") {
                    url.searchParams.set("pid", ((parseInt(value.toString()) - 1) * PAGE_LIMIT).toString())
                    return
                }
            }
        })

        const headers = new Headers()

        if (this.config.auth) {
            const basic = `${this.config.auth.user}:${this.config.auth.apiKey}`
            const encoded = btoa(basic)
            headers.set("Authorization", `Basic ${encoded}`)
        }

        headers.set("Accept", "application/json")

        // console.log(url.toString())

        const res = await fetch(url, {
            headers,
        })

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }

        const json = await res.json()

        console.log(json)

        const posts = (() => {
            // filter with filetype
            if (tagOptions.optional && tagOptions.optional.filetype) {
                if (tagOptions.optional.filetype.length === 0) {
                    return []
                }
                let filetype: string[] = []
                if (typeof tagOptions.optional.filetype === "string") {
                    filetype = [tagOptions.optional.filetype]
                } else if (Array.isArray(tagOptions.optional.filetype)) {
                    filetype = tagOptions.optional.filetype
                }
                return json.post.filter((post: GelbooruPost) => {
                    const ext = post.file_url.split(".").pop()?.toLowerCase()
                    if (ext === undefined) {
                        return false // unknown filetype
                    }
                    if (ext === "jpeg") {
                        return filetype.includes("jpg")
                    } else {
                        return filetype.includes(ext)
                    }
                })
            } else {
                return json.post
            }
        })()

        console.log(posts)

        return posts
    }
}
