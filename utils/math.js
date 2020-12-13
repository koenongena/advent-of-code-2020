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
