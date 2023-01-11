import { Comparable } from "../types/mod.ts"
import { assertEquals, assertThrows } from "../deps.ts"

Deno.test("parse only number", () => {
    const cases = ["12", "100", "-50", "48"]
    for (const c of cases) {
        const comparable = Comparable.parse(c)
        assertEquals(comparable.value, parseInt(c))
        assertEquals(comparable.inequality, null)
    }
})

Deno.test("parse with inequalty sign", () => {
    const cases = [
        { value: ">12", inequality: ">", num: 12 },
        { value: "<100", inequality: "<", num: 100 },
        { value: ">=-50", inequality: ">=", num: -50 },
        { value: "<=48", inequality: "<=", num: 48 },
    ]
    for (const c of cases) {
        const comparable = Comparable.parse(c.value)
        assertEquals(comparable.value, c.num)
        assertEquals(comparable.inequality, c.inequality)
        assertEquals(comparable.toString(), c.value)
    }
})

Deno.test("parse invalid format string", () => {
    const cases = ["abcd", "=100", "0.3", "> 48", ">=hello"]
    for (const c of cases) {
        assertThrows(() => {
            Comparable.parse(c)
        })
    }
})
