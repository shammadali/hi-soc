const fs = require("fs");
const path = require("path");

fs.readFile(path.resolve("data/348.json"), "utf8", (err, data) => {
    if (err) {
        throw err;
    }
    const nodeData = JSON.parse(data);

    const nodes = nodeData.nodes.reduce((hash, n) => {
        hash[n.id] = n;
        return hash;
    }, {});

    // Sum all values from links for group 0
    // = 8479
    const sumZeroGroupLinks = nodeData.links.reduce((sum, link) => {
        let res = sum;

        if (nodes[link.from].group === 0 && nodes[link.to].group) {
            res += link.value;
        }

        return res;
    }, 0);

    console.log(`Sum of links for zero groups: ${sumZeroGroupLinks}`);
});