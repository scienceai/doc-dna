var d3 = require('d3')
  , url = require('url')
  , pjsonld = require('package-jsonld')
  , isUrl = require('is-url');

/**
 * Adapted from https://github.com/fzaninotto/DependencyWheel for
 * complete source and license (MIT licensed by François Zaninotto)
 */

function graph (options) {

  var width = 400
    , margin = 80
    , paddingText = 26
    , printType = false
    , padding = 0.06;

  var cols = {
    dataset: ["#fff7f3","#fde0dd","#fcc5c0","#fa9fb5","#f768a1","#dd3497","#ae017e","#7a0177","#49006a"], //RdPu
    sourceCode: ["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026","#800026"],    //YlOrRd
    article: ["#ffffff","#f0f0f0","#d9d9d9","#bdbdbd","#969696","#737373","#525252","#252525","#000000"], //Greys
    image: ["#fff7fb","#ece7f2","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#045a8d","#023858"],  //PuBu
    audio: ["#ffffe5","#f7fcb9","#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#006837","#004529"],   //YlGn
    video: ["#fff5f0","#fee0d2","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#a50f15","#67000d"]    //Reds
  };

  function chart(selection) {
    selection.each(function(data, selectionIndex) {

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
            "translate(" + (radius + paddingText) + ")" +
            (d.angle > Math.PI ? "rotate(180)" : "");
        })
        .text(function(d) {
          if(printType){
            return (labels[d.index].type === 'dataset') ? 'data': labels[d.index].type;
          }else {
            if(labels[d.index].name.length>11){
              return labels[d.index].name.slice(0,4) + '...' + labels[d.index].name.slice(labels[d.index].name.length-4,labels[d.index].name.length);
            } else {
              return labels[d.index].name;
            }
          }
        })
        .on("mouseover", function(d, i){
          fade(0.1)(d, i);

          var label = labels[d.index];
          var col = cols[label.type][d.index % cols[label.type].length]


          var el = selection[0][selectionIndex];

          var event
          if (window.CustomEvent) {
            event = new CustomEvent('show', {detail: {id:labels[d.index].name, color: col}});
          } else {
            event = document.createEvent('CustomEvent');
            event.initCustomEvent('show', true, true, {detail: {id:labels[d.index].name, color: col}});
          }
          el.dispatchEvent(event);
        })
        .on("mouseout", function(d, i){
          var el = selection[0][selectionIndex];

          var event
          if (window.CustomEvent) {
            event = new CustomEvent('hide', {detail: {id:labels[d.index].name}});
          } else {
            event = document.createEvent('CustomEvent');
            event.initCustomEvent('hide', true, true, {detail: {id:labels[d.index].name}});
          }
          el.dispatchEvent(event);

          fade(1)(d, i);
        });

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

  chart.paddingText = function(value) {
    if (!arguments.length) return paddingText;
    paddingText = value;
    return chart;
  };

  chart.printType = function() {
    printType = true;
    return chart;
  };

  return chart;
};

/**
 * from uri to local pathname (used as id)
 */
function _uri2id(uri, name, version){
  var BASE = pjsonld.BASE;

  var absUrl = (isUrl(uri)) ? uri : url.resolve(BASE, uri);
  var urlObj = url.parse(absUrl, true);

  if(urlObj.hostname === url.parse(BASE).hostname){ //it's a pkg of this registry
    var id = urlObj.pathname.replace(/^\//, '');

    //check if it's a within pkg uri
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


function compute(pkg){
  var labels = [];
  var tmp = [];
  var ndeps = 0;

  [ 'dataset', 'sourceCode', 'image', 'audio', 'video', 'article' ].forEach(function(t){
    var arr = pkg[t] || [];
    arr.forEach(function(x){
      var id = _uri2id(x['@id'], pkg.name, pkg.version);
      if(id){
        labels.push({ name: x.name, type: t });

        var deps = [];
        if (t === 'sourceCode') {
          (x.targetProduct || []).forEach(function(m){
            if(m.input){
              deps = deps.concat(m.input);
            }
          });
        }

        var entry = {
          id: id,
          deps: deps
            .concat(
              (x.isBasedOnUrl || []),
              ((x.citation && x.citation.filter(function(c){ return (c.url!=undefined) }).map(function(c){return c.url;})) || [])
            )
            .map(function(x){
              return _uri2id(x, pkg.name, pkg.version);
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
