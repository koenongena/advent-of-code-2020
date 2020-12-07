import {readLinesForDay} from "./fetchFile.js";
import DirectedGraph from "graph-data-structure";
import {containsAny} from "./utils/arrays.js";

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
            amount: parseInt(bs[1], 10),
            bag: bs[2].trim()
        }
    });
}

const reduceBagsSpecificationToGraph = (graph, l) => {
    const matches = l.match(new RegExp("(.*) bags contain (.*)\."));
    const node = matches[1];
    const edges = parseBagCanContain(matches[2]);

    graph.addNode(node);
    edges.forEach((edge) => {
        graph.addNode(edge.bag);
        graph.addEdge(node, edge.bag, edge.amount);
    })
    return graph;
};

const incomingNodesFor = (graph) => (nodeIds) => {
    return graph.nodes().filter(n => {
        return containsAny(nodeIds)(graph.adjacent(n));
    })
}

const recursive = (acc, findIncoming) => (targetNodes) => {
    const sourceNodes = findIncoming(targetNodes)
    if (sourceNodes.length > 0) {
        return recursive(new Set([...acc, ...sourceNodes]), findIncoming)(sourceNodes);
    }

    return acc;
}

const findAllIncomingNodes = (graph) => {
    const findIncoming = incomingNodesFor(graph);
    return recursive(new Set(), findIncoming);
};

const getContainedInBagCount = (graph) => {
    const countChildBags = (nodeId) => {
        const childBags = graph.adjacent(nodeId);
        if (childBags.length) {
            return childBags.reduce((sum, child) => {
                const childCount = graph.getEdgeWeight(nodeId, child);
                return sum + childCount + childCount * countChildBags(child);
            }, 0)
        } else {
            return 0;
        }

    };
    return countChildBags;
}
(async () => {
    const lines = await readLinesForDay(7);

    const graph = lines.reduce(reduceBagsSpecificationToGraph, new DirectedGraph())

    const set = findAllIncomingNodes(graph)(['shiny gold'])

    console.log(set.size);

    console.log(getContainedInBagCount(graph)("shiny gold"));
})();
