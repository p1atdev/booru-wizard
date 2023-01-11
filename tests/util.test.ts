import { fixTagFormat } from "../utils.ts"
import { assertEquals } from "../deps.ts"

Deno.test("fix tag format", () => {
    const cases = [
        {
            input: "1girl bat_wings dress",
            expect: "1girl, bat wings, dress",
        },
        {
            input: "1girl blonde_hair",
            expect: "1girl, blonde hair",
        },
        {
            input: "1girl blush flat_chest short_hair black_hair blue_eyes petite",
            expect: "1girl, blush, flat chest, short hair, black hair, blue eyes, petite",
        },
    ]

    cases.forEach((c) => {
        assertEquals(fixTagFormat(c.input), c.expect)
    })
})

Deno.test("fix tag format with exluded tags", () => {
    const cases = [
        {
            input: "1girl bat_wings dress @_@",
            expect: "1girl, bat wings, dress, @_@",
        },
        {
            input: "1girl blonde_hair +_+",
            expect: "1girl, blonde hair, +_+",
        },
        {
            input: "1girl blush ^_^ flat_chest short_hair black_hair blue_eyes petite",
            expect: "1girl, blush, ^_^, flat chest, short hair, black hair, blue eyes, petite",
        },
    ]

    cases.forEach((c) => {
        assertEquals(fixTagFormat(c.input), c.expect)
    })
})
