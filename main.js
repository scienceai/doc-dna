var d3 = require('d3');

/**
 * Adapted from https://github.com/fzaninotto/DependencyWheel for
 * complete source and license (MIT licensed by François Zaninotto)
 */

function dpkgDna (options) {

  var width = 500
    , margin = 80
    , padding = 0.04;

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
        .outerRadius(radius + 20);

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
  }

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


document.addEventListener('DOMContentLoaded', function(){

  var x = dpkgDna().padding(0.06);

  d3.selectAll('.chart')
    .data([
      {
        labels: [
          {name:'code', type:'code'},
          {name:'data', type:'dataset'},
          {name:'figure', type: 'figure'} 
        ],
        matrix: [
          [1, 0, 0],
          [0, 1, 0],
          [0, 0, 1]
        ]
      },
      {
        labels: [
          { name: 'figure1', type: 'figure' }, 
          { name: 'figure2', type: 'figure' }, 
          { name: 'code', type: 'code' }, 
          { name: 'result1', type: 'dataset' }, 
          { name: 'result2', type: 'dataset' }, 
          { name: 'data', type: 'dataset' }
        ],
        matrix: [
          [0, 0, 0, 0, 0, 0], //fig1 needed by nothing
          [0, 0, 0, 0, 0, 0], //fig2 needed by nothing
          [1, 1, 0, 1, 1, 0], //code needed by fig1 and fig2 and res1 and res2
          [1, 0, 0, 0, 0, 0], //res1 needed by fig1
          [0, 1, 0, 0, 0, 0], //res2 needed by fig2
          [1, 1 ,1, 1, 1, 0]  //data needed by figs code and res
        ]
      },
      {
        labels: [
          { name: 'figure1', type: 'figure' }, 
          { name: 'figure2', type: 'figure' }, 
          { name: 'code', type: 'code' }, 
          { name: 'result1', type: 'dataset' }, 
          { name: 'result2', type: 'dataset' }, 
          { name: 'data1', type: 'dataset' },
          { name: 'data2', type: 'dataset' }
        ],
        matrix: [
          [0, 0, 0, 0, 0, 0 ,0], //fig1 needed by nothing
          [0, 0, 0, 0, 0, 0 ,0], //fig2 needed by nothing
          [1, 1, 0, 1, 1, 0 ,0], //code needed by fig1 and fig2 and res1 and res2
          [1, 0, 0, 0, 0, 0 ,0], //res1 needed by fig1
          [0, 1, 0, 0, 0, 0 ,0], //res2 needed by fig2
          [1, 0 ,1, 1, 0, 0 ,0], //data1 needed by fig1 code and res1
          [0, 1 ,1, 0, 1, 0 ,0]  //data2 needed by fig2 code and res2
        ]
      }
    ])
    .call(x);

});

