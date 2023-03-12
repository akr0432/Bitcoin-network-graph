// API request
const url = 'https://api.blockchain.com/v3/exchange/tickers';
fetch(url)
  .then(response => response.json())
  .then(data => {
    // Parse JSON response and extract relevant data
    const nodes = data.nodes;
    const links = data.links;

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
      .attr('r', 5);

    // Create edges
    const edge = svg.selectAll('.edge')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'edge');

    // Add tooltips
    node.append('title')
      .text(d => d.name);

    edge.append('title')
      .text(d => `${d.source.name} to ${d.target.name}`);

    // Position nodes and edges
    const simulation = d
