it('should handle parts', function () {
    const regexp = new RegExp(/.#..#..#..#..#..#.../, 'y');
    regexp.lastIndex = 0;
    const s = ".#..#.#......#.##.#..#.##..#..##.#..#......##..........##.##.#.........##..###.....#..##.#......";

    for (let i = 0; i < s.length; i++) {
        regexp.lastIndex = i;

        console.log(regexp.exec(s));
    }

});