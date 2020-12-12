
const rotateClockwise = (facing, rotation) => {
    if (rotation === 0) {
        return facing;
    } else if (rotation < 0) {
        rotateCounterClockwise(facing, -1 * rotation);
    } else if (rotation === 90) {
        switch (facing) {
            case 'N':
                return 'E';
            case 'E':
                return 'S';
            case 'S':
                return 'W';
            case 'W':
                return 'N'
        }
    }

    return rotateClockwise(rotateClockwise(facing, 90), rotation - 90)
};

export const rotateGeographicDirectionClockwise = rotateClockwise;

function rotateCounterClockwise(facing, amount) {
    if (amount < 0) {
        return rotateClockwise(-1 * amount);
    }
    return rotateClockwise(facing, 360 - amount);
}

export const rotateGeographicDirectionCounterClockwise = rotateCounterClockwise;