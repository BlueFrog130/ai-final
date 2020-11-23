import { Generator } from '@/helpers/generator';
import { Hand } from "pokersolver";

const ctx: Worker = self as any;

class HandPotentialTracker {
    public ahead = {
        ahead: 0,
        tied: 0,
        behind: 0
    }
    public tied = {
        ahead: 0,
        tied: 0,
        behind: 0
    }
    public behind = {
        ahead: 0,
        tied: 0,
        behind: 0
    }

    public static totals(tracker: HandPotentialTracker) {
        return {
            ahead: Object.values(tracker.ahead).reduce((v, sum) => v + sum),
            tied: Object.values(tracker.tied).reduce((v, sum) => v + sum),
            behind: Object.values(tracker.behind).reduce((v, sum) => v + sum)
        }
    }
}

class HandPotential {
    /***
     * Generate potential based on a passed hand and board
     *
     * Worst case for iterations: 1,070,190
     */
    public static async generateHandPotential(hand: string[], board: string[]) {
        let HP = new HandPotentialTracker();
        const base = [...hand, ...board];
        const ourHand = Hand.solve(base)
        const possibleHands = Generator.getPossibleHands(base);
        for(const oppCards of possibleHands) {
            let key: keyof HandPotentialTracker;
            const oppHand = Hand.solve([...oppCards, ...board]);
            const winner = Hand.winners([ourHand, oppHand]);
            if(winner.length > 1) {
                key = "tied";
            }
            else if(winner[0] === ourHand) {
                key = "ahead";
            }
            else {
                key = "behind";
            }
            for(const possibleBoard of Generator.getPossibleBoards([...hand, ...oppCards], board)) {
                const oppBoardHand = Hand.solve([ ...oppCards, ...board, ...possibleBoard ]);
                const ourBoardHand = Hand.solve([...hand, ...board, ...possibleBoard]);
                const boardWinner = Hand.winners([oppBoardHand, ourBoardHand]);
                if(boardWinner.length > 1) {
                    HP[key].tied += 1;
                }
                else if(boardWinner[0] === ourBoardHand) {
                    HP[key].ahead += 1;
                }
                else {
                    HP[key].behind += 1;
                }
            }
        }
        const HPTotal = HandPotentialTracker.totals(HP);
        const PPot = (HP.behind.ahead + HP.behind.tied/2 + HP.tied.ahead/2) / (HPTotal.behind + HPTotal.tied);
        const NPot = (HP.ahead.behind + HP.tied.behind/2 + HP.ahead.tied/2) / (HPTotal.ahead + HPTotal.tied);
        return { PPot, NPot, HPTotal, HP };
    }
}

ctx.addEventListener("message", async (e) => {
    const { hand, board } = e.data;

    if(hand === undefined || board === undefined) {
        throw new Error("Required parameter is undefined");
    }

    const v = await HandPotential.generateHandPotential(hand, board);

    ctx.postMessage(v);
})