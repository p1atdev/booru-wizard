# booru wizard
[![Deno Test](https://github.com/p1atdev/booru-wizard/actions/workflows/testing.yaml/badge.svg)](https://github.com/p1atdev/booru-wizard/actions/workflows/testing.yaml)
![deno compatibility](https://shield.deno.dev/deno/^1.29)

Download **images** and **tags** from booru.

## Requirements

- Deno 🦕

https://deno.land/manual@v1.29.2/getting_started/installation

# Installation

```bash
git clone https://github.com/p1atdev/booru-wizard
deno task build
```

then `booru` will be created.

## Upgrade

```bash
git pull
deno task build
```

# Usage

```bash
> ./booru --help

  Usage:   booru-wizard
  Version: 0.1.1

  Description:

    Booru Images Downloader

  Options:

    -h, --help     - Show this help.
    -V, --version  - Show the version number for this program.

  Commands:

    download  [query]  - Download images with search query
```

## download

```bash
  Description:

    Download images with search query

  Options:

    -h, --help                  - Show this help.
    --host          <host>      - Host URL.                                                (Default: "https://danbooru.donmai.us")
    -o, --output    <path>      - Output path.                                             (Default: "./output")
    -b, --batch     <number>    - The number of images to download at once. Default is 1.  (Default: 1)
    -l, --limit     <number>    - The number of images to download. Default is 200         (Default: 200)
    -s, --score     <score>     - Filtering with score of images. e.g. "100", ">20", "<10", "100...200"
    -r, --rating    <rating>    - Rating of images. general/safe/questionable/explicit     (Default: [ "general", "safe", "questionable", "explicit" ])      
    -f, --filetype  <filetype>  - Filetype to download. e.g. png/jpg/webp/mp4... etc       (Default: [ "jpg", "png", "webp" ])
    -t, --tags      [tags]      - Save tags.                                               (Default: false)
    --character     [boolean]   - Include character tags.                                  (Default: true, Depends: --tags)
    --copyright     [boolean]   - Include copyright tags.                                  (Default: true, Depends: --tags)
    --meta          [boolean]   - Include meta tags.                                       (Default: false, Depends: --tags)
    --artist        [boolean]   - Include artist tags.                                     (Default: true, Depends: --tags)
    --additional    <tags>      - Additional tags to include.                              (Depends: --tags)
    --exclude       <tags>      - Tags to exclude.                                         (Depends: --tags)
    --user          <user>      - Username to auth                                         (Depends: --apiKey)
    --apiKey        <apiKey>    - API key to auth                                          (Depends: --user)
```

### Examples

- Download 500 hatsune_miku images

```bash
./booru download hatsune_miku -l 500 -o ./miku
```

- Download images with tags

```bash
./booru download hatsune_miku -t -o ./miku
```

- Download images which has score greater than 100

```bash
./booru download hatsune_miku --score ">100" -o ./high_score_miku
```

- Download images WITHOUT 1boy

```bash
./booru download "hatsune_miku -1boy" -o ./miku_without_boy
```

- Download sfw miku

```bash
./booru download hatsune_miku --rating general --rating safe -o ./sfw_miku
```

- Specify the host url

```bash
./booru download --host https://testbooru.donmai.us -o ./test
```