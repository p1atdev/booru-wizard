export type InequalitySign = ">" | "<" | ">=" | "<=" | null

export class Comparable {
    inequality: InequalitySign = null
    value: number

    constructor(value: number, inequality: InequalitySign = null) {
        this.value = value
        this.inequality = inequality
    }

    static parse = (value: string): Comparable => {
        const match = value.match(/^([<>]=?|)(-?[0-9]+)$/)
        if (match) {
            const symbol = match[1] == "" ? null : match[1]
            const num = parseInt(match[2])

            return new Comparable(num, symbol as InequalitySign)
        } else {
            throw new Error("Invalid string format")
        }
    }

    toString = (): string => {
        return `${this.inequality ?? ""}${this.value}`
    }
}
