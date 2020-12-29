import {parseInteger} from "./utils/numbers.js";
import R from 'ramda';


const pickup = (input) => {
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
    input['pick up'] = [firstNextCup, secondNextCup, thirdNextNextCup];
    return input;
};

const addDestinationCup = input => {
    const {current, cups} = input;
    const pickedUpCups = input['pick up'];

    const minusOne = (cups) => (l) => l <= 1 ? cups.length - 1 : l - 1;
    const notPickedUp = (pickedUpCups) => {
        const pickedUpIds = R.map(R.prop("id"), pickedUpCups);
        return (newLabel) => newLabel > 0 && !R.includes(newLabel, pickedUpIds);
    }
    const destination = R.until(notPickedUp(pickedUpCups), minusOne(cups), current - 1);
    input.destination = destination;
    return input;
}

const placePickup = (input) => {
    const pickedUpCups = input['pick up'];
    const {cups, destination} = input;

    pickedUpCups[2].next = cups[destination].next;
    cups[destination].next = pickedUpCups[0].id;

    return input;
}

const chooseNewCurrentCup = (input) => {
    const {cups, current} = input;
    input.current = cups[current].next;
    return input;
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
    const max = labels.length;
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

    const cups = createLinkedList([...input].map(parseInteger));

    const executeMove = R.pipe(incrementMove, pickup, addDestinationCup, placePickup, chooseNewCurrentCup);

    //part 1
    const part1 = R.until((i) => i.move === 100, executeMove, {
        cups: cups,
        move: 0,
        current: R.head([...input].map(parseInteger))
    });
    printMoveResult(1)(part1);

    //part 2
    const extraLabels = Array.from({length: 1_000_000 - input.length}, (_, i) => i + 10);
    const additionalCups = createLinkedList(
        R.concat([...input].map(parseInteger), extraLabels)
    );

    const part2 = R.until((i) => i.move === 10_000_000, executeMove, {
        cups: additionalCups,
        move: 0,
        current: R.head([...input].map(parseInteger))
    });
    const part2Cups = part2.cups;
    const next1 = part2Cups[part2Cups[1].next];
    const next2 = part2Cups[next1.next];

    console.log(next1.id * next2.id);
})();