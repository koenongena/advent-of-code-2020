import {readLinesForDay} from "./fetchFile.js";
import R from 'ramda';
import {parseInteger} from "./utils/numbers.js";

const timeUntilNextBus = R.curry((timestamp, bus) => {
    return (bus - (timestamp % bus)) % bus;
});

const waitTimeUntilBus = R.curry((timestamp, bus) => {
    return {
        bus,
        waitTime: timeUntilNextBus(timestamp, bus)
    }
});

(async () => {
    const lines = await readLinesForDay(13);
    const referenceTime = parseInt(lines[0], 10);
    const busInput = lines[1].split(',');
    const unconstrainedBus = s => s === 'x';
    const mapWaitTime = waitTimeUntilBus(referenceTime);

    const busses = R.map(parseInteger, R.reject(unconstrainedBus, busInput));
    const bussesWithWaitTime = R.map(mapWaitTime, busses);

    const sortByMinWaitTime = R.sortBy(R.prop('waitTime'));
    const sortedAscending = sortByMinWaitTime(bussesWithWaitTime);
    const waitTime = R.head(sortedAscending).waitTime;
    const bus = R.head(sortedAscending).bus;
    console.log(waitTime * bus);


})();