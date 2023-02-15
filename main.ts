import { BooruClient } from "./client.ts"
import { SearchTagOptions, Post } from "./types/mod.ts"
import { downloadAndSaveImage, fixTagFormat, saveTxtFile } from "./utils.ts"
import { tty, colors } from "./deps.ts"
import { log } from "./log.ts"

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

const pageLimit = 100

export const getImageData = async (client: BooruClient, options: SearchOptions) => {
    const images: Post[] = []

    let page = 1
    while (images.length < options.limit) {
        const posts = await client
            .getPosts(options.tags, {
                limit: pageLimit,
                page: page,
            })
            .then((res) => {
                return res
            })
            .catch(() => {
                tty.eraseLine
                    .cursorMove(-1000, 0)
                    .text(`${colors.red.bold("[ERROR]")} Failed to get posts. Up to ${images.length} images.`)
                return []
            })

        if (posts.length === 0) {
            break
        }

        posts.filter((post) => post.file_url !== undefined).forEach((post) => images.push(post))

        page += 1

        tty.eraseLine.cursorMove(-1000, 0).text(`${colors.blue.bold("[INFO]")} Getting urls... (${images.length})`)
    }

    tty.eraseLine.cursorMove(-1000, 0).text("")

    return images.slice(0, options.limit)
}

export const downloadImages = async (images: Post[], outputPath: string, batch: number) => {
    // check output path exists
    try {
        await Deno.stat(outputPath)
    } catch {
        await Deno.mkdir(outputPath, { recursive: true })
    }

    const tasks: Promise<void>[] = []

    const batchCount = Math.ceil(images.length / batch)

    for (let i = 0; i < batch; i++) {
        const batchImages = (() => {
            if (i === batch - 1) {
                return images.slice(i * batchCount)
            } else {
                return images.slice(i * batchCount, (i + 1) * batchCount)
            }
        })()

        tasks.push(
            (async () => {
                for (const image of batchImages) {
                    const ext = image.file_url.split(".").pop()!
                    const id = image.id
                    const path = `${outputPath}/${id}.${ext}`

                    tty.eraseLine.cursorMove(-1000, 0).text(`${colors.blue.bold("[INFO]")} Downloading: ${id}.${ext}`)

                    await downloadAndSaveImage(image.file_url, path)
                }
            })()
        )
    }

    await Promise.all(tasks)

    tty.eraseLine.cursorMove(-1000, 0).text("")
    log.success("Download completed!")
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
                const exclude = options.exclude
                    .split(",")
                    .map((tag) => tag.trim())
                    .map((tag) => tag.replaceAll(" ", "_"))

                return tags
                    .join(" ")
                    .split(" ")
                    .filter((tag) => !exclude.includes(tag))
                    .filter((tag) => tag !== "")
                    .join(" ")
            } else {
                return tags.filter((tag) => tag !== "").join(" ")
            }
        })()

        const fixedTagText = fixTagFormat(tagText)

        await saveTxtFile(fixedTagText, path)
    }
}
