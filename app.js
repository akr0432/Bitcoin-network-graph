const API_URL = 'https://api.blockchain.info/';
const ADDRESS = '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2';

// Fetch transaction data for the given address
fetch(`${API_URL}rawaddr/${ADDRESS}`)
    .then(response => response.json())
    .then(data => {
        const transactions = data.txs.filter(tx => {
            const inputAddrs = tx.inputs.map(input => input.prev_out.addr);
            const outputAddrs = tx.out.map(out => out.addr);
            return inputAddrs.includes(ADDRESS) || outputAddrs.includes(ADDRESS);
        });
        const nodes = {};
        const links = [];
        // Extract nodes and links from the transaction data
        transactions.forEach(tx => {
            const txId = tx.hash;
            const inputAddrs = tx.inputs.map(input => input.prev_out.addr);
            const outputAddrs = tx.out.map(out => out.addr);
            nodes[txId] = { id: txId };
            inputAddrs.forEach(addr => {
                if (addr === ADDRESS) return;
                const linkId = `${txId}_${addr}`;
                links.push({ source: txId, target: addr, id: linkId });
                if (!nodes[addr]) {
                    nodes[addr] = { id: addr };
                }
            });
            outputAddrs.forEach(addr => {
                if (addr === ADDRESS) return;
                const linkId = `${addr}_${txId}`;
                links.push({ source: addr, target: txId, id: linkId });
                if (!nodes[addr]) {
                    nodes[addr] = { id: addr };
                }
            });
        });
        const graph = { nodes: Object.values(nodes), links };
        createGraph(graph);
    });

// Create the graph using D3.js
function createGraph(graph) {
    const width = 800;
    const height = 600;
    const svg = d3.select('#graph').append('svg')
        .attr('width', width)
        .attr('height', height);
    const link = svg.append('g')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .selectAll('line')
        .data(graph.links)
        .join('line')
        .attr('stroke-width', d => Math.sqrt(d.value))
        .attr('id', d => d.id);
    const node = svg.append('g')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .selectAll('circle')
        .data(graph.nodes)
        .join('circle')
        .attr('r', 5)
        .attr('fill', d => d.id === ADDRESS ? 'red' : 'blue')
        .attr('id', d => d.id)
        .call(drag(simulation));
    const simulation = d3.force
