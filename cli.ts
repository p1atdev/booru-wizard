import { BooruClient } from "./client.ts"
import { Command, colors } from "./deps.ts"
import { log } from "./log.ts"
import { getImageData, downloadImages, saveTags, SaveTagsOptions, SearchOptions } from "./main.ts"

await new Command()
    .name("booru-wizard")
    .version("0.1.0")
    .description("Booru Images Downloader")
    .command("download", "Download images with search query")
    .arguments("[query:string]")
    .option("--host <host:string>", "Host URL.", {
        default: "https://danbooru.donmai.us",
    })
    .option("-o, --output <path:string>", "Output path.", {
        default: "./output",
    })
    .option("-l, --limit <number:number>", "The number of images to download. Default is 200", {
        default: 200,
    })
    // .option("-r, --rating <rating:string>", "", { collect: true })
    .option("-s, --score <score:string>", 'Score range. e.g. "100", ">20", "<10", "100...200"')
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
            { host, output, limit, score, tags, character, copyright, meta, artist, additional, exclude, user, apiKey },
            query
        ) => {
            log.info("Started")
            log.info("Query:")
            log.info("Limit:", limit)
            log.info("Output path:", output)
            if (tags) {
                log.info("Save tags:", tags)
                log.info("Character:", character, "Artist:", artist, "Meta:", meta, "Copyright:", copyright)
                if (additional) {
                    log.info("Additional tags:", additional)
                }
                if (exclude) {
                    log.info("Exclude tags:", exclude)
                }
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

            const images = await client.getPosts(
                {
                    general: query,
                    optional: {
                        score,
                    },
                },
                {
                    limit,
                }
            )

            log.success("Found", images.length, "images")

            const tasks = [
                downloadImages(images, output).then(() => {
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
                        log.success("Tags saved")
                    })
                )
            }

            await Promise.all(tasks)

            log.success("Finished")
        }
    )
    .parse(Deno.args)
