import {parseInteger} from "./utils/numbers.js";
import R from 'ramda';


const pickup = (amount) => (input) => {
    const {cups, current} = input;

    const currentCup = cups[current];
    const firstNextCup = cups[currentCup.next];
    const secondNextCup = cups[firstNextCup.next];
    const thirdNextNextCup = cups[secondNextCup.next];
    const fourthNextNextCup = cups[thirdNextNextCup.next];

    currentCup.next = fourthNextNextCup.id;
    fourthNextNextCup.prev = currentCup.id;

    firstNextCup.prev = undefined;
    thirdNextNextCup.next = undefined;
    return {...input, 'pick up': [firstNextCup, secondNextCup, thirdNextNextCup], cups: cups}
};

const addDestinationCup = input => {
    const {current, cups} = input;
    const pickedUpCups = input['pick up'];

    const minusOne = (cups) => (l) => l <= 1 ? cups.length - 1: l - 1;
    const notPickedUp = (pickedUpCups) => {
        const pickedUpIds = R.map(R.prop("id"), pickedUpCups);
        return (newLabel) => newLabel > 0 && !R.includes(newLabel, pickedUpIds);
    }
    const destination = R.until(notPickedUp(pickedUpCups), minusOne(cups), current - 1);
    return {
        ...input,
        destination
    }
};

const placePickup = (input) => {
    const pickedUpCups = input['pick up'];
    const {cups, destination} = input;

    pickedUpCups[2].next = cups[destination].next;
    cups[destination].next = pickedUpCups[0].id;

    return input;
}

const chooseNewCurrentCup = (input) => {
    const {cups, current} = input;

    return {
        ...input,
        current: cups[current].next
    }
}

const printMoveResult = (startLabel) => (input) => {
    let cup = input.cups[startLabel];
    let s = "";
    for (let i = 0; i < input.cups.length - 1; i++) {
        if (cup.id === input.current) {
            s += " (" + cup.id + ")";
        } else {
            s += " " + cup.id;
        }
        cup = input.cups[cup.next];
    }
    console.log(s);
    return input
}

const incrementMove = (input) => {
    return {
        ...input,
        move: input.move + 1
    }
}

const createLinkedList = labels => {
    const max = Math.max(...labels);
    const last = R.last(labels);
    const first = R.head(labels);
    const reduceIndexed = R.addIndex(R.reduce);
    return reduceIndexed((list, label, index) => {
        list[label] = {
            id: label,
            prev: index === 0 ? last : labels[index - 1],
            next: index === labels.length - 1 ? first : labels[index + 1]
        };
        return list;
    }, new Array(max + 1), labels)
};

(async () => {
    const input = '487912365';

    const pickupThree = pickup(3);
    const cups = createLinkedList([...input].map(parseInteger));

    const executeMove = R.pipe(incrementMove, pickupThree, addDestinationCup, placePickup, chooseNewCurrentCup);

    const result = R.until((i) => i.move === 100, executeMove, {cups: cups, move: 0, current: R.head([...input].map(parseInteger))});

    printMoveResult(1)(result);
})();