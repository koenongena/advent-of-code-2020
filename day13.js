import {readLinesForDay} from "./fetchFile.js";
import R from 'ramda';
import {parseInteger} from "./utils/numbers.js";
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

    const findMatches = (timestamp, outOfSyncBusses, inSyncBusses) => {
        if (outOfSyncBusses.length === 0) {
            return timestamp;
        }

        const currentBus = outOfSyncBusses[0]
        //We can use an increment = least common denominator of busses that are already "in sync"
        const increment = inSyncBusses.length ? leastCommonDenominator(R.map(R.prop("bus"), inSyncBusses)) : 1;
        console.log("Starting at: %s", timestamp);
        console.log("Using increment: %s", increment);
        while (!isValid(currentBus)(timestamp)) {
            timestamp += increment;
        }
        return findMatches(timestamp, R.tail(outOfSyncBusses), [...inSyncBusses, outOfSyncBusses[0]]);
    };

    console.log(findMatches(0, busses, []));
})();