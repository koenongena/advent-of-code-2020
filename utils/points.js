import R from "ramda";

export const rotateClockwiseAroundCenter = R.curry((center, point, rotation) => {

    const rotateClockwise = rotateClockwiseAroundCenter(center);

    if (rotation === 0) {
        return point;
    } else if (rotation < 0) {
        return rotateClockwise(point, -1 * rotation);
    } else if (rotation === 90) {
        const xDiff = point.x - center.x
        const yDiff = point.y - center.y

        return {
            ...point,
            x: yDiff + center.x,
            y: - xDiff + center.y
        }
    }

    return rotateClockwise(rotateClockwise(point, 90), rotation - 90)
});

export const rotateCounterClockwiseAroundCenter = R.curry((center, point, rotation) => {
    const rotateClockwise = rotateClockwiseAroundCenter(center, point);
    if (rotation < 0) {
        return rotateClockwise(-1 * rotation);
    }
    return rotateClockwise(360 - rotation);
});

export const manhattanDistance = (position) => {
    return Math.abs(position.x) + Math.abs(position.y);
}