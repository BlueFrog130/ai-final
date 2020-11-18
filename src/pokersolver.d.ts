declare module "pokersolver" {
    class Hand {
        static solve(cards: Array<string>): Hand
        static winners(hands: Hand[]): Hand | Hand[]
        cardPool: Array<any>
        cards: Array<any>
        descr: string
        name: string
        rank: number
    }
}