import {readLinesForDay} from "./fetchFile.js";
import DirectedGraph from "graph-data-structure";
import {contains, containsAll, containsAny} from "./utils/arrays.js";

const parseBagCanContain = (s) => {
    const bags = s.split(',').map(s => s.trim());
    return bags.map(b => {
        if (b === 'no other bags') {
            return {
                amount: 0, bag: ''
            }
        }
        const bs = b.match(new RegExp("([0-9]+) (.*) bag"));
        return {
            amount: bs[1],
            bag: bs[2].trim()
        }
    });
}
(async () => {
    const lines = await readLinesForDay(7);

    const graph = lines.map(l => {
        const matches = l.match(new RegExp("(.*) bags contain (.*)\."));
        const node = matches[1];
        const edges = parseBagCanContain(matches[2]);
        return {node: node, edges: edges };
    }).reduce((graph, bla) => {
        graph.addNode(bla.node);
        bla.edges.forEach((edge) => {
            graph.addNode(edge.bag);
            graph.addEdge(bla.node, edge.bag, edge.amount);
        })
        return graph;

    }, new DirectedGraph())

    const to = (nodeIds) => {
        return graph.nodes().filter(n => {
            return containsAny(nodeIds)(graph.adjacent(n));
        })
    }

    let toShinyGold = to(['shiny gold'])
    const set = new Set();
    while (toShinyGold.length) {
        toShinyGold.forEach(t => set.add(t));
        toShinyGold = to(toShinyGold);
    }

    console.log(set.size);
})();
