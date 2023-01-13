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

const hosts = [
    {
        host: "danbooru.donmai.us",
        posts: "/posts.json",
        apiType: "danbooru",
    },
    {
        host: "konachan.com",
        posts: "/post.json",
        apiType: "danbooru",
    },
    {
        host: "behoimi.org",
        posts: "/post/index.json",
        apiType: "danbooru",
    },
    {
        host: "gelbooru.com",
        posts: "/index.php",
        apiType: "gelbooru",
    },
] satisfies {
    host: string
    posts: string
    apiType: "danbooru" | "gelbooru"
}[]

const pageLimit = 100

export class BooruClient {
    private readonly host: string = "https://danbooru.donmai.us"
    private readonly auth?: Auth

    constructor(config?: BooruClientConfig) {
        if (config?.host) {
            this.host = config.host
            this.auth = config.auth
        }
    }

    async getPosts(tagOptions: SearchTagOptions, params: CommonSearchParameters): Promise<Post[]> {
        const host = hosts.find((index) => index.host === new URL(this.host).hostname) ?? {
            host: this.host,
            posts: "/posts.json",
            apiType: "danbooru",
        }
        const url = new URL(host.posts, this.host)
        if (host.apiType === "gelbooru") {
            url.searchParams.set("page", "dapi")
            url.searchParams.set("s", "post")
            url.searchParams.set("q", "index")
            url.searchParams.set("json", "1")
        }

        // console.log(url)

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
                if (key === "page" && host.apiType === "gelbooru") {
                    url.searchParams.set("pid", ((parseInt(value.toString()) - 1) * pageLimit).toString())
                    return
                }
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

        // console.log(url.toString())

        const res = await fetch(url, {
            headers,
        })

        // console.log(res)

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }

        const json = await res.json()

        // console.log(json)

        if (host.apiType === "gelbooru") {
            return json.post
        }

        return json
    }
}
