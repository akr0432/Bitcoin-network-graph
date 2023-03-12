// API request
const walletAddress = '1F1tAaz5x1HUXrCNLbtMDqcw6o5GNn4xqX'; // Replace with desired wallet address
const url = `https://api.blockchain.info/rawaddr/${walletAddress}?limit=50`;
fetch(url)
  .then(response => response.json())
  .then(data => {
    // Parse JSON response and extract relevant data
    const inputs = data.txs.flatMap(tx => tx.inputs.filter(input => input.prev_out.addr === walletAddress));
    const outputs = data.txs.flatMap(tx => tx.out.filter(out => out.addr === walletAddress));
    const nodes = Array.from(new Set([...inputs.map(input => input.prev_out.addr), ...outputs.map(output => output.addr)]))
      .map((addr, i) => ({id: i, name: addr}));
    const links = inputs.map(input => ({
      source: nodes.find(node => node.name === input.prev_out.addr).id,
      target: nodes.find(node => node.name === walletAddress).id
    })).concat(outputs.map(output => ({
      source: nodes.find(node => node.name === walletAddress).id,
      target: nodes.find(node => node.name === output.addr).id
    })));

    // Create SVG element
    const svg = d3.select('#graph')
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .call(d3.zoom().on('zoom', () => {
        svg.attr('transform', d3.event.transform);
      }))
      .append('g');

    // Create nodes
    const node = svg.selectAll('.node')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('r', 5)
      .on('mouseover', (event, d) => {
        tooltip.style('visibility', 'visible')
          .text(d.name);
      })
      .on('mousemove', event => {
        tooltip.style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', () => {
        tooltip.style('visibility', 'hidden');
      });

    // Create links
    const link = svg.selectAll('.link')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'edge');

    // Create tooltip
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('visibility', 'hidden');

    // Update positions of nodes and links
    function tick() {
      link.attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      node.attr('cx', d => d.x)
        .attr('cy', d => d.y);
    }

    // Initialize force layout
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id))
      .force('charge', d3.forceManyBody().strength(-50))
      .force('center', d3.forceCenter(svg.attr('width') / 2, svg.attr('height') / 2))
      .on('tick', tick);

    // Set initial positions of nodes and links
   
