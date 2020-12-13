import {readLinesForDay} from "./fetchFile.js";
import R from 'ramda';
import {parseInteger} from "./utils/numbers.js";
import {first} from "./utils/arrays.js";
import {leastCommonDenominator} from "./utils/math.js";

const timeUntilNextBus = R.curry((timestamp, bus) => {
    return (bus - (timestamp % bus)) % bus;
});

const waitTimeUntilBus = R.curry((timestamp, bus) => {
    return {
        bus,
        waitTime: timeUntilNextBus(timestamp, bus)
    }
});

const isValid = (b) => (timestamp) => {
    return (timestamp + b.index) % b.bus === 0;
}
const mapIndexed = R.addIndex(R.map());

(async () => {
    const lines = await readLinesForDay(13);
    const referenceTime = parseInt(lines[0], 10);
    const busInput = R.map(parseInteger, lines[1].split(','));

    const mapWaitTime = waitTimeUntilBus(referenceTime);
    const bussesWithIndex = mapIndexed((bus, index) => ({index, bus}), busInput)
    const busses = R.reject(R.pipe(R.prop('bus'), Number.isNaN), bussesWithIndex);

    const bussesWithWaitTime = R.map(R.pipe(R.prop('bus'), mapWaitTime), busses);
    const sortByMinWaitTime = R.sortBy(R.prop('waitTime'));
    const sortedAscending = sortByMinWaitTime(bussesWithWaitTime);

    const waitTime = R.head(sortedAscending).waitTime;
    const bus = R.head(sortedAscending).bus;
    console.log(waitTime * bus);

    //part 2
    console.log(busses);

    const busWithLongestRoute = R.last(R.sortBy(R.prop("bus"), busses));

    let timestamp = -busWithLongestRoute.index;
    const smallestDifference = busWithLongestRoute.bus;
    console.log("Difference: %s", smallestDifference);
    const matches = R.allPass(busses.map(b => isValid(b)));
    while (!matches(timestamp)) {
        // console.log("Validating %s", timestamp);
        timestamp += smallestDifference;
    }
    console.log(timestamp);

    //wolfram alpha: solve ((t + 0) mod 29) = 0 and ((t + 23) mod 37) = 0 and ((t + 29) mod 467) = 0 and ((t + 37) mod 23) = 0 and ((t + 42) mod 13) = 0 and ((t + 46) mod 17) = 0 and ((t + 48) mod 19) = 0 and ((t + 60) mod 443) = 0 and ((t + 101) mod 41) = 0 for t

    //t = 11525093 n + 1584502, n element Z
    //t = 76266437 n + 25664259, n element Z
})();