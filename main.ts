import { BooruClient } from "./client.ts"
import { SearchTagOptions, Post } from "./types/mod.ts"
import { downloadAndSaveImage, fixTagFormat, saveTxtFile } from "./utils.ts"
import { tty, colors } from "./deps.ts"

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
    const images: Post[] = []

    let page = 1
    while (images.length < options.limit) {
        const posts = await client.getPosts(options.tags, {
            limit: 200,
            page: page,
        })

        if (posts.length === 0) {
            break
        }

        posts.filter((post) => post.file_url !== undefined).forEach((post) => images.push(post))

        page += 1
    }

    return images.slice(0, options.limit)
}

export const downloadImages = async (images: Post[], outputPath: string, batch: number) => {
    // check output path exists
    try {
        await Deno.stat(outputPath)
    } catch {
        await Deno.mkdir(outputPath, { recursive: true })
    }

    const batches = Math.ceil(images.length / batch)
    const tasks: Promise<void[]>[] = []

    for (let i = 0; i < batches; i++) {
        const batchImages = (() => {
            if (i === batches - 1) {
                return images.slice(i * batch)
            } else {
                return images.slice(i * batch, (i + 1) * batch)
            }
        })()

        tasks.push(
            Promise.all(
                batchImages.map(async (image) => {
                    const ext = image.file_ext
                    const id = image.id
                    const path = `${outputPath}/${id}.${ext}`

                    // console.log(image)

                    await downloadAndSaveImage(image.file_url, path)

                    tty.eraseLine.cursorMove(-1000, 0).text(`${colors.blue.bold("[INFO]")} Downloaded: ${id}.${ext}`)
                })
            )
        )
    }

    await Promise.all(tasks)
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
