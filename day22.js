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

function formatDecks({player1, player2}) {
    return JSON.stringify({player1, player2});
}

const isDeckRepeated = ({player1, player2, previousGameSituations}) => {
    return R.includes(formatDecks({player1, player2}), previousGameSituations || []);
};
//
// if (isDeckRepeated(player1, player2, previousGameSituations)) {
//     return {win: 'player1', player1, player2};
// }

const addDeckHistory = (fn) => {
    return ({player1, player2, previousGameSituations}) => {
        return {
            ...fn({player1, player2}),
            previousGameSituations: [...previousGameSituations, formatDecks({player1, player2})]
        }
    }
}

const triggersSubGame = ({player1, player2}) => {
    const c1 = R.head(player1);
    const c2 = R.head(player2);
    return R.tail(player1).length >= c1 && R.tail(player2).length >= c2;
};


const playGame = R.curry((deck1, deck2, hist = []) => {

    const playNormal = ({player1, player2, previousGameSituations}) => {
        const players = {player1, player2};
        return {
            ...play(players),
            previousGameSituations: [...previousGameSituations, formatDecks(players)]
        }
    };

    const {
        player1,
        player2,
        previousGameSituations
    } = R.until(R.anyPass([triggersSubGame, oneOfPlayersDecksIsEmpty, isDeckRepeated]), playNormal, {
        player1: deck1,
        player2: deck2,
        previousGameSituations: hist
    })

    if (isDeckRepeated({player1, player2, previousGameSituations})) {
        return {win: 'player1', player1, player2};
    } else if (oneOfPlayersDecksIsEmpty({player1, player2})) {
        return {win: R.isEmpty(player2) ? 'player1' : 'player2', player1, player2};
    } else {
        //let's play a subgame
        const c1 = R.head(player1);
        const c2 = R.head(player2);

        const {win} = playGame(R.take(c1, R.tail(player1)), R.take(c2, R.tail(player2)));

        const updatedHistory = [...previousGameSituations, formatDecks({player1, player2})];
        if (win === "player1") {
            return playGame(
                [...R.tail(player1), c1, c2],
                R.tail(player2),
                updatedHistory
            );
        } else {
            return playGame(
                R.tail(player1),
                [...R.tail(player2), c2, c1],
                updatedHistory
            );
        }
    }
});

function calculateScore(deck) {
    const reduceIndexed = R.addIndex(R.reduce);
    return reduceIndexed((sum, card, index) => {
        return sum + card * (index + 1)
    }, 0, R.reverse(deck))
}

const oneOfPlayersDecksIsEmpty = ({player1, player2}) => {
    return R.isEmpty(player1) || R.isEmpty(player2);
};

(async () => {
    const lines = await readLinesForDay(22);
    const [player1, player2] = parsePlayerDecks(lines);

    console.log(player1)
    console.log(player2);

    const endSituation = R.until(oneOfPlayersDecksIsEmpty, play, {player1, player2})
    console.log(endSituation);
    const score = calculateScore(R.concat(endSituation.player1, endSituation.player2));
    console.log(score)

    //part2
    const recursiveGameEndSituation = playGame(player1, player2);
    const score2 = calculateScore(R.concat(recursiveGameEndSituation.player1, recursiveGameEndSituation.player2));
    console.log(score2)
})();