import { DanbooruScraper } from "./danbooru.ts"
import { GelbooruScraper } from "./gelbooru.ts"
import { log } from "./log.ts"
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

export interface BooruHost {
    origin: string
    postsPath: string
    apiType: "danbooru" | "gelbooru"
}

const BOORU_HOSTS: BooruHost[] = [
    {
        origin: "https://danbooru.donmai.us",
        postsPath: "/posts.json",
        apiType: "danbooru",
    },
    {
        origin: "https://konachan.com",
        postsPath: "/post.json",
        apiType: "danbooru",
    },
    {
        origin: "http://behoimi.org",
        postsPath: "/post/index.json",
        apiType: "danbooru",
    },
    {
        origin: "https://gelbooru.com",
        postsPath: "/index.php",
        apiType: "gelbooru",
    },
]

const DEFAULT_CONFIG = {
    host: "https://danbooru.donmai.us",
}

const PAGE_LIMIT = 100

export interface ScraperProtocol {
    config: BooruClientConfig
    host: BooruHost
    getPosts(tagOptions: SearchTagOptions, params: CommonSearchParameters): Promise<Post[]>
}

const createScraper = (config?: BooruClientConfig): ScraperProtocol => {
    const host = config?.host ?? "https://danbooru.donmai.us"
    const origin = new URL(host).origin

    const hostConfig = BOORU_HOSTS.find((index) => index.origin === origin)

    switch (hostConfig?.apiType) {
        case "danbooru": {
            return new DanbooruScraper(config ?? DEFAULT_CONFIG, hostConfig)
        }
        case "gelbooru": {
            return new GelbooruScraper(config ?? DEFAULT_CONFIG, hostConfig)
        }
        default: {
            log.error(`Unknown host: ${host}`)
            throw new Error(`Unknown host: ${host}`)
        }
    }
}

export class BooruClient {
    readonly scraper: ScraperProtocol

    constructor(config?: BooruClientConfig) {
        this.scraper = createScraper(config)
    }

    async getPosts(tagOptions: SearchTagOptions, params: CommonSearchParameters): Promise<Post[]> {
        return await this.scraper.getPosts(tagOptions, params)
    }
}
