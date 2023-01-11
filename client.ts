import { CommonSearchParameters } from "./types/commonSearchParameters.ts"
import { SearchTagOptions } from "./types/mod.ts"
import { Post } from "./types/post.ts"

export interface Auth {
    user: string
    apiKey: string
}

export interface BooruClientConfig {
    host?: string
    auth?: Auth
}

export class BooruClient {
    private readonly host: string = "https://danbooru.donmai.us"
    private readonly auth?: Auth

    constructor(config?: BooruClientConfig) {
        if (config?.host) {
            this.host = config.host
            this.auth = config.auth
        }
    }

    async getPosts(tagOptions: SearchTagOptions, params: CommonSearchParameters) {
        const url = new URL("/posts.json", this.host)

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

        if (this.auth) {
            const basic = `${this.auth.user}:${this.auth.apiKey}`
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

        const json: Post[] = await res.json()

        return json
    }
}
