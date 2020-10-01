declare module "pokersolver" {
    interface Hand {
        cardPool: Array<any>
        cards: Array<any>
        descr: string
        name: string
        rank: number
    }
    function solve(cards: Array<string>): Hand

    function winners(hands: Hand[]): Hand
}