import {readLinesForDay} from "./fetchFile.js";
import R from 'ramda';

const parsePlayerDecks = R.reduce((players, line) => {
    if (line.startsWith('Player')) {
        return [...players, []];
    }
    if (line === '') {
        return players;
    }

    const player = R.last(players);
    player.push(parseInt(line, 10));
    return players;
}, []);

const play = ({player1, player2}) => {
    const c1 = R.head(player1);
    const c2 = R.head(player2);
    if (c1 > c2) {
        return {
            player1: [...R.tail(player1), c1, c2],
            player2: R.tail(player2)
        }
    } else {
        return {
            player1: R.tail(player1),
            player2: [...R.tail(player2), c2, c1]
        }
    }
};

function calculateScore(deck) {
    const reduceIndexed = R.addIndex(R.reduce);
    return reduceIndexed((sum, card, index) => {
        return sum + card * (index + 1)
    }, 0, R.reverse(deck))
}

(async () => {
    const lines = await readLinesForDay(22);
    const [player1, player2] = parsePlayerDecks(lines);

    console.log(player1)
    console.log(player2);
    const oneOfPlayersDecksIsEmpty = ({player1, player2}) => R.isEmpty(player1) || R.isEmpty(player2);

    const endSituation = R.until(oneOfPlayersDecksIsEmpty, play, {player1, player2})
    console.log(endSituation);
    const score = calculateScore(R.concat(endSituation.player1, endSituation.player2));
    console.log(score)
})();