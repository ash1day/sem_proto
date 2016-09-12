function covariances_matrix(json) {
  raw_matrix = {}

  names = json.names.sort()
  len   = names.length

  for (var row_name of json.names) {
    raw_matrix[row_name] = {}
    for (var column_name of json.names) {
      raw_matrix[row_name][column_name] = 0 // 0でいいのか?
    }

    // 分散
    raw_matrix[row_name][row_name] = json.variances[row_name].Estimate
  }

  // 共分散
  for (var row_name in json.covariances) {
    for (co_obj of json.covariances[row_name]) {
      raw_matrix[row_name][co_obj.name] = co_obj.Estimate
      raw_matrix[co_obj.name][row_name] = co_obj.Estimate
    }
  }

  matrix = []

  for (i = 0; i < len; i++) {
    matrix[i] = []
    for (j = 0; j < len; j++) {
      matrix[i][j] = raw_matrix[names[i]][names[j]]
    }
  }

  return { names: names, matrix: matrix }
}

function heatmap(data, id){
  names = data.names
  matrix = data.matrix

  var data = [
    {
      x: names,
      y: names.concat().reverse(),
      z: matrix.reverse(),
      type: 'heatmap'
    }
  ]

  var layout = {
    title: id.replace('_',' '),
    annotations: [],
    xaxis: {
      ticks: '',
      side: 'top'
    },
    yaxis: {
      ticks: ' ',
      ticksuffix: ' ',
      autosize: false
    },
    width: 400,
    height: 400
  }

  Plotly.newPlot(id, data, layout);
}