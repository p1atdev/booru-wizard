import { BooruClient } from "./client.ts"
import { Command, tty } from "./deps.ts"
import { log } from "./log.ts"
import { getImageData, downloadImages, saveTags, SaveTagsOptions } from "./main.ts"
import { Filetype, Post } from "./types/mod.ts"

await new Command()
    .name("booru-wizard")
    .version("0.2.2")
    .description("Booru Images Downloader")
    .globalOption("--debug", "Debug mode", {
        hidden: true,
    })
    .command("download", "Download images with search query")
    .arguments("[query:string]")
    .option("--host <host:string>", "Host URL.", {
        default: "https://danbooru.donmai.us",
    })
    .option("-o, --output <path:string>", "Output path.", {
        default: "./output",
    })
    .option("-b, --batch <number:number>", "The number of images to download at once. Default is 4.", {
        default: 4,
    })
    .option("-l, --limit <number:number>", "The number of images to download. Default is 200", {
        default: 200,
    })
    .option("-f, --filetype <filetype:string>", "Filetype to download. e.g. png/jpg/webp/mp4... etc ", {
        default: ["jpg", "png", "webp"],
        collect: true,
    })
    .option("--no-filetype [boolean:boolean]", "Not to use filetype filtering", {
        default: false,
    })
    .option("-t, --tags [tags:boolean]", "Save tags.", {
        default: false,
    })
    .option("--character [boolean:boolean]", "Include character tags.", {
        default: true,
        depends: ["tags"],
    })
    .option("--copyright [boolean:boolean]", "Include copyright tags.", {
        default: true,
        depends: ["tags"],
    })
    .option("--meta [boolean:boolean]", "Include meta tags.", {
        default: false,
        depends: ["tags"],
    })
    .option("--artist [boolean:boolean]", "Include artist tags.", {
        default: true,
        depends: ["tags"],
    })
    .option("--rating [boolean:boolean]", "Include rating tags. (sensitive, nsfw...)", {
        default: true,
        depends: ["tags"],
    })
    .option("--additional <tags:string>", "Additional tags to include.", {
        depends: ["tags"],
    })
    .option("--exclude <tags:string>", "Tags to exclude.", {
        depends: ["tags"],
    })
    .option("--user <user:string>", "Username to auth", {
        depends: ["apiKey"],
    })
    .option("--apiKey <apiKey:string>", "API key to auth", {
        depends: ["user"],
    })

    .action(
        async (
            {
                host,
                output,
                limit,
                rating,
                filetype,
                noFiletype,
                tags,
                character,
                copyright,
                meta,
                artist,
                additional,
                exclude,
                user,
                apiKey,
                batch,
                debug,
            },
            query
        ) => {
            log.info("Started")
            log.info("Query:", query)
            log.info("Limit:", limit)
            log.info("Output path:", output)
            if (tags) {
                log.info("Save tags:", tags)
                log.info("Character:", character, "Artist:", artist, "Meta:", meta, "Copyright:", copyright)
                log.info("Rating:", rating === true)

                if (additional) {
                    log.info(
                        "Additional tags:",
                        additional.split(",").map((tag) => tag.trim())
                    )
                }
                if (exclude) {
                    log.info(
                        "Exclude tags:",
                        exclude.split(",").map((tag) => tag.trim())
                    )
                }
            }
            if (filetype) {
                log.info("Filetype:", filetype)
            }

            if (debug) {
                return
            }

            const client = new BooruClient({
                host: host,
                auth:
                    user && apiKey
                        ? {
                              user,
                              apiKey,
                          }
                        : undefined,
            })

            const images: Post[] = await getImageData(client, {
                tags: {
                    general: query,
                    optional: {
                        filetype: noFiletype ? undefined : filetype ? filetype.map((f) => f as Filetype) : undefined,
                    },
                },
                limit,
            })

            log.success("Found", images.length, "images")

            const tasks = [
                downloadImages(images, output, batch).then(() => {
                    tty.eraseLine.cursorMove(-1000, 0).text("")
                    log.success("Images downloaded")
                }),
            ]

            if (tags) {
                const saveTagsOptions: SaveTagsOptions = {
                    character,
                    artist,
                    meta,
                    copyright,
                    rating,
                    additional,
                    exclude,
                }
                tasks.push(
                    saveTags(images, output, saveTagsOptions).then(() => {
                        tty.eraseLine.cursorMove(-1000, 0).text("")
                        log.success("Tags saved")
                    })
                )
            }

            await Promise.all(tasks)

            log.success("Finished")
        }
    )
    .parse(Deno.args)
