import { BooruClient } from "../client.ts"
import { assertEquals, assertExists } from "../deps.ts"
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

Deno.test("get post with rating", async () => {
    const client = new BooruClient()

    const cases = [Rating.General, Rating.Safe, Rating.Questionable, Rating.Explicit]

    for await (const rating of cases) {
        const posts = await client.getPosts(
            {
                optional: {
                    rating,
                },
            },
            {
                limit: 10,
            }
        )
        assertExists(posts)
        posts.forEach((post) => assertEquals(post.rating, rating))
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
                optional: {
                    score: score.value,
                },
            },
            {
                limit: 10,
            }
        )
        assertExists(posts)
        posts.forEach((post) => assertEquals(score.checker(post.score), true))
    }
})
