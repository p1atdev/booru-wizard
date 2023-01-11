import { writeAll, tty, colors } from "./deps.ts"
import { log } from "./log.ts"

export const downloadAndSaveImage = async (url: string, path: string) => {
    // if already exists, skip
    try {
        await Deno.stat(path)
        return
    } catch {
        //
    }

    try {
        const res = await fetch(url)
        const buffer = await res.arrayBuffer()
        const file = await Deno.open(path, { create: true, write: true })
        await writeAll(file, new Uint8Array(buffer))
    } catch (error) {
        tty.eraseLine.cursorMove(-1000, 0).text("")
        log.error(`Failed to download image: ${url}, ${error} `)
    }
}

export const saveTxtFile = async (content: string, path: string) => {
    // if already exists, skip
    try {
        await Deno.stat(path)
        return
    } catch {
        //
    }

    try {
        const encoder = new TextEncoder()
        const data = encoder.encode(content)

        const file = await Deno.open(path, { create: true, write: true })
        await writeAll(file, data)
    } catch {
        tty.eraseLine.cursorMove(-1000, 0).text("")
        log.error(`Failed to save txt file: ${path}`)
    }
}

export const fixTagFormat = (tagsText: string) => {
    const exclude = [
        "0_0",
        "(o)_(o)",
        "+_+",
        "+_-",
        "._.",
        "<o>_<o>",
        "<|>_<|>",
        "=_=",
        ">_<",
        "3_3",
        "6_9",
        ">_o",
        "@_@",
        "^_^",
        "o_o",
        "u_u",
        "x_x",
        "|_|",
        "||_||",
    ]

    const tags = tagsText.split(" ")

    const newTags = tags.map((tag) => {
        if (exclude.includes(tag)) {
            return tag
        }

        return tag.replace(/_/g, " ")
    })

    return newTags.join(", ")
}
