function build_graph(json) {
  var nodes = [], links = []

  // 潜在変数の定義式より、ノードとリンクを作成
  for (var left_var in json.latent_variables) {
    nodes.push({ id: left_var, group: 1 })
    for (right_var of json.latent_variables[left_var]) {
      nodes.push({ id: right_var.name, group: 2 })
      links.push({ source: left_var, target: right_var.name, value: right_var['Estimate'], p: right_var['P(>|z|)'] })
    }
  }

  // 回帰の式からリンクを作成
  for (var left_var in json.regressions) {
    for (right_var of json.regressions[left_var]) {
      links.push({ source: left_var, target: right_var.name, value: right_var['Estimate'], p: right_var['P(>|z|)'] })
    }
  }

  return {
    nodes: nodes,
    links: links
  }
}

rectSize = 10

function graph(json) {
  var graph = build_graph(json)

  var svg = d3.select('svg'),
      width = +svg.attr('width'),
      height = +svg.attr('height')

  // TODO: いい感じの矢印に
  svg.append('defs').append('marker')
    .attr('id', 'arrowhead')
    .attr('refX', 4.5)
    .attr('refY', 2)
    .attr('markerWidth', 5)
    .attr('markerHeight', 4)
    .attr('orient', 'auto')
    .append('path')
        .attr('d', 'M 0,0 V 4 L3,2 Z')
        .attr('fill', 'steelblue')

  var color = d3.scaleOrdinal(d3.schemeCategory20)

  var simulation = d3.forceSimulation()
      .force('link', d3.forceLink().distance(50).id(function(d) { return d.id }))
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2))

  var link = svg.append('g')
      .attr('class', 'links')
    .selectAll('line')
    .data(graph.links)
    .enter().append('line')
      .attr('marker-end', 'url(#arrowhead)')
      .attr('stroke-width', function(d) { return Math.sqrt(d.value * 10) })
      .attr('stroke-opacity', function(d) { return 1 - d.p })

  var node = svg.selectAll('.node')
      .data(graph.nodes)
    .enter().append('g')
      .attr('class', 'node')

  node.append('circle')
      .attr('r', 6)
      .attr('fill', function(d) { return color(d.group) })
      .style('display', function(d) { return d.group == 1 ? null : 'none' })

  node.append('rect')
      .attr('width', rectSize)
      .attr('height', rectSize)
      .attr('fill', function(d) { return color(d.group) })
      .style('display', function(d) { return d.group == 2 ? null : 'none' })

  node.append('text')
      .attr('dx', 12)
      .attr('dy', '.35em')
      .text(function(d) { return d.id })

  simulation
      .nodes(graph.nodes)
      .on('tick', ticked)

  simulation.force('link')
      .links(graph.links)

  var x, y
  function ticked() {
    link.attr('x1', function(d) { return d.source.x })
        .attr('y1', function(d) { return d.source.y })
        .attr('x2', function(d) { return d.target.x })
        .attr('y2', function(d) { return d.target.y })

    node.attr('transform', function(d) {
      if (d.group == 1) {
        x = d.x
        y = d.y
      } else {
        x = d.x - rectSize / 2
        y = d.y - rectSize / 2
      }
      return 'translate(' + x + ',' + y + ')' })
  }
}