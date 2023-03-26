import { BooruClientConfig, BooruHost, ScraperProtocol } from "./client.ts"
import { SearchTagOptions, CommonSearchParameters } from "./types/mod.ts"
import { DanbooruPost } from "./types/post.ts"

export class DanbooruScraper implements ScraperProtocol {
    host: BooruHost
    config: BooruClientConfig

    constructor(config: BooruClientConfig, host: BooruHost) {
        this.host = host
        this.config = config
    }

    async getPosts(tagOptions: SearchTagOptions, params: CommonSearchParameters): Promise<DanbooruPost[]> {
        const url = new URL(this.host.postsPath, this.host.origin)

        const tags: string[] = []

        if (tagOptions.general) {
            tags.push(tagOptions.general)
        }

        if (tagOptions.optional) {
            const optionals = Object.entries(tagOptions.optional)
                .filter(([_key, value]) => value !== undefined)
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
                url.searchParams.set(key, value.toString())
            }
        })

        const headers = new Headers()

        if (this.config.auth) {
            const basic = `${this.config.auth.user}:${this.config.auth.apiKey}`
            const encoded = btoa(basic)
            headers.set("Authorization", `Basic ${encoded}`)
        }

        headers.set("Accept", "application/json")

        const res = await fetch(url, {
            headers,
        })

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }

        const json = await res.json()

        return json
    }
}
