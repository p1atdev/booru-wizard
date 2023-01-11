import { BooruClient } from "./client.ts"
import { Command, tty, colors } from "./deps.ts"
import { log } from "./log.ts"
import { getImageData, downloadImages, saveTags, SaveTagsOptions, SearchOptions } from "./main.ts"
import { Rating, Filetype, Post } from "./types/mod.ts"

await new Command()
    .name("booru-wizard")
    .version("0.1.2")
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
    .option("-s, --score <score:string>", 'Filtering with score of images. e.g. "100", ">20", "<10", "100...200"')
    .option("-r, --rating <rating:string>", "Rating of images. general/safe/questionable/explicit", {
        default: ["general", "safe", "questionable", "explicit"],
        collect: true,
    })
    .option("-f, --filetype <filetype:string>", "Filetype to download. e.g. png/jpg/webp/mp4... etc ", {
        collect: true,
        default: ["jpg", "png", "webp"],
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
                score,
                rating,
                filetype,
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
            if (score) {
                log.info("Score:", score)
            }
            if (rating) {
                log.info("Rating:", rating)
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
                        score,
                        rating: rating as Rating[],
                        filetype: filetype as Filetype[],
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
