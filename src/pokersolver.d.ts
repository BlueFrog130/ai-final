declare module "pokersolver" {
    class Hand {
        static solve(cards: Array<string>): Hand
        static winners(hands: Hand[]): Hand[]
        cardPool: Array<Card>
        cards: Array<Card>
        descr: string
        name: string
        rank: number
        toString(): string
    }

    class Card {
        value: string
        suit: string
        rank: number
        wildValue: string
    }
}