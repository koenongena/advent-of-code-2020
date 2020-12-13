import {readLinesForDay} from "./fetchFile.js";
import R from 'ramda';

const timeUntilNextBus = R.curry((timestamp, bus) => {
    return (bus - (timestamp % bus)) % bus;
});

const mapBusAndWaitTime = R.curry((timestamp, bus) => {
    return {
        bus,
        waitTime: timeUntilNextBus(timestamp, bus)
    }
});

(async () => {
    const lines = await readLinesForDay(13);
    const referenceTime = parseInt(lines[0], 10);
    const busses = lines[1].split(',').filter(s => s !== 'x').map(s => parseInt(s, 10));
    const result = busses.map(mapBusAndWaitTime(referenceTime));

    const sortByMinWaitTime = R.sortBy(R.prop('waitTime'));
    const sortedAscending = sortByMinWaitTime(result);
    const waitTime = R.head(sortedAscending).waitTime;
    const bus = R.head(sortedAscending).bus;
    console.log(waitTime * bus);
})();