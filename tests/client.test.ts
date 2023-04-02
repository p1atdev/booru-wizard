import { BooruClient } from "../client.ts"
import { assertEquals, assertExists, assert } from "../deps.ts"
import { getImageData } from "../main.ts"
import { Rating } from "../types/mod.ts"

Deno.test("get post", async () => {
    const client = new BooruClient()

    const posts = await client.getPosts({}, {})

    assertExists(posts)
})

Deno.test("get post with limit", async () => {
    const client = new BooruClient()

    const cases = [1, 5, 10, 100, 200]

    for await (const limit of cases) {
        const posts = await client.getPosts(
            {},
            {
                limit,
            }
        )
        assertExists(posts)
        assertEquals(posts.length, limit)
    }
})

Deno.test("get post with score", async () => {
    const client = new BooruClient()

    const cases = [
        {
            value: ">25",
            checker: (num: number) => {
                return num > 25
            },
        },
        {
            value: "<25",
            checker: (num: number) => {
                return num < 25
            },
        },
        {
            value: ">=25",
            checker: (num: number) => {
                return num >= 25
            },
        },
        {
            value: "<=25",
            checker: (num: number) => {
                return num <= 25
            },
        },
        {
            value: "25",
            checker: (num: number) => {
                return num === 25
            },
        },
    ]

    for await (const score of cases) {
        const posts = await client.getPosts(
            {
                general: score.value,
            },
            {
                limit: 10,
            }
        )
        assertExists(posts)
        posts.forEach((post) => assertEquals(score.checker(post.score), true))
    }
})

Deno.test("get posts from gelbooru", async () => {
    const client = new BooruClient({
        host: "https://gelbooru.com",
    })

    const posts = await client.getPosts({}, {})

    console.log(posts)

    assertExists(posts)
})

Deno.test("get 100 posts from gelbooru", async () => {
    const client = new BooruClient({
        host: "https://gelbooru.com",
    })

    const limits = [1, 5, 10, 100, 200]

    for await (const limit of limits) {
        const posts = await getImageData(client, {
            tags: {},
            limit,
        })
        assertExists(posts)
        assertEquals(posts.length, limit)
    }
})
