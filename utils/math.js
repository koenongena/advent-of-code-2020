import R from "ramda";

export const leastCommonDenominator = numbers => {
    const gcd = (a, b) => {
        return !b ? a : gcd(b, a % b);
    }
    const lcm = (a, b) => {
        return (a * b) / gcd(a, b);
    }
    return numbers.reduce((acc, a) => {
        return lcm(acc, a);
    }, Math.min(...numbers));
};

export const multiply = R.reduce(R.multiply, 1);
export const sum = R.reduce(R.add, 0);
