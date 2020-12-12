import {readLinesForDay} from "./fetchFile.js";
import R from 'ramda';
import {rotateClockwiseAroundCenter, rotateCounterClockwiseAroundCenter} from "./utils/points.js";
import {rotateGeographicDirectionClockwise, rotateGeographicDirectionCounterClockwise} from "./utils/compass.js";

const handleBasicAction = (position, s) => {
    const action = [...s][0];
    const amount = parseInt(s.substring(1), 10);

    switch (action) {
        case 'N':
            return {
                ...position,
                y: position.y + amount
            }
        case 'S':
            return {
                ...position,
                y: position.y - amount
            }
        case 'E':
            return {
                ...position,
                x: position.x + amount
            }
        case 'W':
            return {
                ...position,
                x: position.x - amount
            }
        case 'L':
            return {
                ...position,
                facing: rotateGeographicDirectionClockwise(position.facing, amount)
            }
        case 'R':
            return {
                ...position,
                facing: rotateGeographicDirectionCounterClockwise(position.facing, amount)
            }

        case 'F':
            return handleBasicAction(position, position.facing + amount);
    }
}

function computeDirection(shipPosition, waypointPosition) {
    const determineNorthSouth = () => {
        if (shipPosition.y > waypointPosition.y) {
            return 'S'
        }
        return 'N'

    }

    const determineEastWest = () => {
        if (shipPosition.x > waypointPosition.x) {
            return 'W'
        }
        return 'E';
    }
    return {horizontal: determineEastWest(), vertical: determineNorthSouth()};
}

const handleShipAndWaypointAction = (s, positions) => {
    const {shipPosition, waypointPosition} = positions;

    const action = [...s][0];
    const amount = parseInt(s.substring(1), 10);

    switch (action) {
        case 'N':
        case 'S':
        case 'E':
        case 'W':
            return {
                shipPosition: shipPosition,
                waypointPosition: handleBasicAction(waypointPosition, s)
            };
        case 'L':
            return {
                shipPosition: shipPosition,
                waypointPosition: rotateCounterClockwiseAroundCenter(shipPosition)(waypointPosition, amount)
            }
        case 'R':
            return {
                shipPosition: shipPosition,
                waypointPosition: rotateClockwiseAroundCenter(shipPosition)(waypointPosition, amount)
            }

        case 'F':
            const shipDirection = computeDirection(shipPosition, waypointPosition);
            const horizontalMove = Math.abs(shipPosition.x - waypointPosition.x) * amount;
            const verticalMove = Math.abs(shipPosition.y - waypointPosition.y) * amount;

            const doubleMove = (position) => {
                const positionAfterFirstMove = handleBasicAction(position, shipDirection.horizontal + '' + horizontalMove);
                const positionAfterSecondMove = handleBasicAction(positionAfterFirstMove, shipDirection.vertical + '' + verticalMove);
                return positionAfterSecondMove;
            }

            return {
                shipPosition: doubleMove(shipPosition),
                waypointPosition: doubleMove(waypointPosition)
            };
    }
};

const manhattanDistance = (position) => {
    return Math.abs(position.x) + Math.abs(position.y);
}
(async () => {
    const lines = await readLinesForDay(12);

    const baseShipPosition = {facing: 'E', x: 0, y: 0};
    const baseWaypointPosition = {facing: 'E', x: baseShipPosition.x + 10, y: baseShipPosition.y + 1};
    const result = R.reduce((acc, line) => {
        return handleBasicAction(acc, line);
    }, baseShipPosition, lines);

    console.log(manhattanDistance(result));

    const result2 = R.reduce((acc, line) => {
        return handleShipAndWaypointAction(line, acc);
    }, {shipPosition: baseShipPosition, waypointPosition: baseWaypointPosition}, lines);

    console.log(manhattanDistance(result2.shipPosition));

})();
