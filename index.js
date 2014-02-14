var d3 = require('d3')
  , url = require('url')
  , isUrl = require('is-url');

/**
 * Adapted from https://github.com/fzaninotto/DependencyWheel for
 * complete source and license (MIT licensed by François Zaninotto)
 */

function graph (options) {

  var width = 400
    , margin = 80
    , padding = 0.06;

  var cols = {
    dataset: ["#fff7f3","#fde0dd","#fcc5c0","#fa9fb5","#f768a1","#dd3497","#ae017e","#7a0177","#49006a"],
    code: ["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026","#800026"],
    figure: ["#fff7fb","#ece7f2","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#045a8d","#023858"]
  };
  
  function chart(selection) {
    selection.each(function(data) {

      var matrix = data.matrix;
      var labels = data.labels;
      var radius = width / 2 - margin;

      // create the layout
      var chord = d3.layout.chord()
        .padding(padding)
        .sortSubgroups(d3.descending);

      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([data]);

      // Otherwise, create the skeletal chart.
      var gEnter = svg.enter().append("svg:svg")
        .attr("width", width)
        .attr("height", width)
        .attr("class", "dependencyWheel")
        .append("g")
        .attr("transform", "translate(" + (width / 2) + "," + (width / 2) + ")");

      var arc = d3.svg.arc()
        .innerRadius(radius)
        .outerRadius(radius *1.1);

      var fill = function(d) {
        var label = labels[d.index];
        return cols[label.type][d.index % cols[label.type].length]
      };

      // Returns an event handler for fading a given chord group.
      var fade = function(opacity) {
        return function(g, i) {

          svg.selectAll(".chord")
            .filter(function(d) {
              return d.source.index != i && d.target.index != i;
            })
            .transition()
            .style("opacity", opacity);

          var groups = [];
          svg.selectAll(".chord")
            .each(function(d) {
              if (d.source.index == i) {
                groups.push(d.target.index);
              }
              if (d.target.index == i) {
                groups.push(d.source.index);
              }
            });
          groups.push(i);

          var length = groups.length;
          svg.selectAll('.group')
            .filter(function(d) {
              for (var i = 0; i < length; i++) {
                if(groups[i] == d.index) return false;
              }
              return true;
            })
            .transition()
            .style("opacity", opacity);
        };
      };

      chord.matrix(matrix);

      var rootGroup = chord.groups()[0];
      var rotation = - (rootGroup.endAngle - rootGroup.startAngle) / 2 * (180 / Math.PI);

      var g = gEnter.selectAll("g.group")
        .data(chord.groups)
        .enter().append("svg:g")
        .attr("class", "group")
        .attr("transform", function(d) {
          return "rotate(" + rotation + ")";
        });

      g.append("svg:path")
        .style("fill", fill)
        .style("stroke", fill)
        .attr("d", arc)
        .on("mouseover", fade(0.1))
        .on("mouseout", fade(1));

      g.append("svg:text")
        .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
          .attr("dy", ".35em")
        .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
        .attr("transform", function(d) {
          return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
            "translate(" + (radius + 26) + ")" +
            (d.angle > Math.PI ? "rotate(180)" : "");
        })
        .text(function(d) { return labels[d.index].name; })
        .on("mouseover", fade(0.1))
        .on("mouseout", fade(1));

      gEnter.selectAll("path.chord")
        .data(chord.chords)
        .enter().append("svg:path")
        .attr("class", "chord")
        .style("stroke", function(d) { return d3.rgb(fill(d.source)).darker(); })
        .style("fill", function(d) { return fill(d.source); })
        .attr("d", d3.svg.chord().radius(radius))
        .attr("transform", function(d) {
          return "rotate(" + rotation + ")";
        })
        .style("opacity", 1);
    });
  };

  chart.width = function(value) {
    if (!arguments.length) return width;
    width = value;
    return chart;
  };

  chart.margin = function(value) {
    if (!arguments.length) return margin;
    margin = value;
    return chart;
  };

  chart.padding = function(value) {
    if (!arguments.length) return padding;
    padding = value;
    return chart;
  };

  return chart;
};

/**
 * from uri to local pathname (used as id)
 */
function _uri2id(uri, name, version){
  var BASE = "https://registry.standardanalytics.io/";

  var absUrl = (isUrl(uri)) ? uri : url.resolve(BASE, uri);
  var urlObj = url.parse(absUrl, true);

  if(urlObj.hostname === url.parse(BASE).hostname){ //it's a dpkg of this registry
    var id = urlObj.pathname.replace(/^\//, '');

    //check if it's a within dpkg uri
    if(name && version){
      var splt = id.split('/'); //name, version, ...
      if(splt[0] === name && splt[1] === version){
        return id;
      }
    } else {
      return id;
    }
    
  }
};


function compute(dpkg){
  var d = dpkg.dataset || []
    , c = dpkg.code || []
    , f = dpkg.figure || [];

  var labels = [];
  var tmp = [];
  var ndeps = 0;

  ['dataset', 'code', 'figure'].forEach(function(t){
    var arr = dpkg[t] || [];
    arr.forEach(function(x){
      var id = _uri2id(x['@id'], dpkg.name, dpkg.version);
      if(id){
        labels.push({ name: x.name, type: t });
        var entry = {
          id: id,
          deps: ((x.targetProduct && x.targetProduct.input) || x.isBasedOnUrl || [])
            .map(function(x){
              return _uri2id(x, dpkg.name, dpkg.version);
            })
            .filter(function(x) {return x;})
        };
        tmp.push(entry);
        ndeps += entry.deps.length;
      }
    });
  });
  
  //tmp to matrix TODO optimize with has o(N^2) is not acceptable
  var matrix = [];
  tmp.forEach(function(x, i){
    var row = Array.apply(null, new Array(tmp.length)).map(Number.prototype.valueOf,0);
    if(!ndeps){
      row[i] = 1;
    } else {
      tmp.forEach(function(y, j){
        if(y.deps.indexOf(x.id) !== -1){
          row[j] = 1;
        }
      });
    }
    matrix.push(row);
  });

  return {
    labels: labels,
    matrix: matrix
  };
  
};

if (typeof module !== 'undefined' && module.exports){
  exports.graph = graph;
  exports.compute = compute;
}
