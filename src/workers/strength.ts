import { Generator } from '@/helpers/generator';
import { Hand } from "pokersolver"

const ctx: Worker = self as any;

class HandStrength {
    /**
     * Compares hand strength to all possible other hands
     */
    public static async compute(hand: string[], board: string[]) {
        let ahead = 0, tied = 0, behind = 0;
        const base = [...hand, ...board];
        const ourHand = Hand.solve(base);
        const possibleHands = Generator.getPossibleHands(base);
        for(const oppCards of possibleHands) {
            const oppHand = Hand.solve([...oppCards, ...board]);
            const winner = Hand.winners([ourHand, oppHand]);
            if(winner.length > 1) {
                tied += 1;
            }
            else if(winner[0] === ourHand) {
                ahead += 1;
            }
            else {
                behind += 1;
            }
        }
        return ((ahead+tied/2)/(ahead+tied+behind));
    }
}

ctx.addEventListener("message", async (e) => {
    const { hand, board } = e.data;

    if(hand === undefined || board === undefined) {
        throw new Error("Required parameter is undefined");
    }

    let response = await HandStrength.compute(hand, board);

    ctx.postMessage(response);
})