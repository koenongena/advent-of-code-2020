import {parseInteger} from "./utils/numbers.js";
import R from 'ramda';

const pickup = (amount) => (input) => {
    const {cups} = input;

    return {...input, 'pick up': R.slice(1, 1 + amount, cups), cups: [R.head(cups), ...R.drop(1 + amount, cups)]}
};

const addDestinationCup = input => {
    const {cups} = input;
    const current = R.head(cups);
    const sorted = R.sortBy(R.identity, cups);
    const destinationIndex = R.findIndex(R.equals(current), sorted) - 1;
    if (destinationIndex >= 0) {
        return {...input, destination: sorted[destinationIndex]}
    }

    return {...input, destination: R.last(sorted)};
};

const placePickup = (input) => {
    const destinationIndex = R.findIndex(R.equals(input.destination), input.cups);

    return {
        ...input,
        'pick up': [],
        cups: [...input.cups.slice(0, destinationIndex + 1), ...input['pick up'], ...input.cups.slice(destinationIndex + 1)]
    }
}

const moveToTop = (label) => (cups) => {
    const shiftIndex = R.findIndex(R.equals(label), cups);
    return [...R.slice(shiftIndex, Infinity, cups), ...R.slice(0, shiftIndex, cups)]
}

const chooseNewCurrentCup = (input) => {
    const {cups} = input;

    return {
        ...input,
        cups: moveToTop(cups[1])(cups)
    }
}

const printMoveResult = (input) => {
    console.log("After move " + input.move + " we have:")
    console.log(input.cups.join(' '))
    return input;
}

const incrementMove = (input) => {
    return {
        ...input,
        move: input.move + 1
    }
}
(async () => {
    const labels = [...('389125467')].map(parseInteger);
    const pickupThree = pickup(3);

    const executeMove = R.pipe(incrementMove, pickupThree, addDestinationCup, placePickup, chooseNewCurrentCup, printMoveResult);

    const result = R.until((i) => i.move === 100, executeMove, {cups: labels, move: 0});

    const part1 = R.join('', await R.drop(1, await moveToTop(1)(result.cups)));

    console.log(part1);
})();