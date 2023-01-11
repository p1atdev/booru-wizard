import { BooruClient } from "./client.ts"
import { SearchTagOptions, Post } from "./types/mod.ts"
import { downloadAndSaveImage, fixTagFormat, saveTxtFile } from "./utils.ts"

export interface SearchOptions {
    tags: SearchTagOptions
    limit: number
}

export interface SaveTagsOptions {
    character: boolean
    copyright: boolean
    artist: boolean
    meta: boolean
    additional?: string
    exclude?: string
}

export const getImageData = async (client: BooruClient, options: SearchOptions) => {
    const count = (options.limit % 200) + 1

    const images: Post[] = []

    for (let i = 0; i < count; i++) {
        const posts = await client.getPosts(options.tags, {
            limit: 200,
            page: i + 1,
        })

        posts.forEach((post) => images.push(post))
    }

    return images.slice(0, options.limit)
}

export const downloadImages = async (images: Post[], outputPath: string) => {
    // check output path exists
    try {
        await Deno.stat(outputPath)
    } catch {
        await Deno.mkdir(outputPath, { recursive: true })
    }

    for (const image of images) {
        const ext = image.file_ext
        const id = image.id
        const path = `${outputPath}/${id}.${ext}`

        await downloadAndSaveImage(image.file_url, path)
    }
}

export const saveTags = async (images: Post[], outputPath: string, options: SaveTagsOptions) => {
    try {
        await Deno.stat(outputPath)
    } catch {
        await Deno.mkdir(outputPath, { recursive: true })
    }

    for (const image of images) {
        const id = image.id
        const path = `${outputPath}/${id}.txt`

        const tags: string[] = []

        if (options.additional) {
            tags.push(...options.additional.split(",").map((tag) => tag.trim().replaceAll(" ", "_")))
        }

        if (options.character) {
            tags.push(image.tag_string_character)
        }
        if (options.copyright) {
            tags.push(image.tag_string_copyright)
        }
        tags.push(image.tag_string_general)
        if (options.meta) {
            tags.push(image.tag_string_meta)
        }
        if (options.artist) {
            // tags.push(`by_${image.tag_string_artist}`)
            tags.push(image.tag_string_artist)
        }

        const tagText = (() => {
            if (options.exclude) {
                const exclude = options.exclude.split(",").map((tag) => tag.trim())

                return tags.filter((tag) => !exclude.includes(tag)).join(" ")
            } else {
                return tags.join(" ")
            }
        })()

        const fixedTagText = fixTagFormat(tagText)

        await saveTxtFile(fixedTagText, path)
    }
}
