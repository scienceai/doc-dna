var d3 = require('d3')
  , clone = require('clone')
  , url = require('url');

//avoid to load the whole schema.org ontology in memory
var TYPES = require('./data/data.json');

/**
 * Adapted from https://github.com/fzaninotto/DependencyWheel
 */

function graph (options) {

  var width = 400
    , margin = 80
    , paddingText = 26
    , printType = false
    , padding = 0.06;

  var cols = {
    dataset: ["#fff7f3","#fde0dd","#fcc5c0","#fa9fb5","#f768a1","#dd3497","#ae017e","#7a0177","#49006a"], //RdPu
    code: ["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026","#800026"],    //YlOrRd
    article: ["#ffffff","#f0f0f0","#d9d9d9","#bdbdbd","#969696","#737373","#525252","#252525","#000000"], //Greys
    image: ["#fff7fb","#ece7f2","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#045a8d","#023858"],   //PuBu
    audio: ["#ffffe5","#f7fcb9","#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#006837","#004529"],   //YlGn
    video: ["#fff5f0","#fee0d2","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#a50f15","#67000d"],   //Reds
    other: ["#fcfbfd","#efedf5","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#54278f","#3f007d"], //Purples
  };

  function mapSchemaType(type){
    for (var key in TYPES) {
      if (~TYPES[key].indexOf(type)){
        return key;
      }
    }
    return 'other';
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
        .append("g")
        .attr("transform", "translate(" + (width / 2) + "," + (width / 2) + ")");

      if (!matrix) {
        return;
      }

      var arc = d3.svg.arc()
        .innerRadius(radius)
        .outerRadius(radius *1.1);

      var fill = function(d) {
        var label = labels[d.index];
        return cols[mapSchemaType(label.type)][d.index % cols[mapSchemaType(label.type)].length]
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
            return labels[d.index].type;
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
          var col = cols[mapSchemaType(label.type)][d.index % cols[mapSchemaType(label.type)].length]


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


function compute(cdoc, opts){
  function _intersect(list1, list2){
    for (var i=0; i<list1.length; i++){
      for (var j=0; j<list2.length; j++){
        if(list1[i] === list2[j]) return true;
      }
    }
    return false;
  };

  function _forEachNode(doc, callback){
    for (var prop in doc) {
      if (prop === '@context' || !doc.hasOwnProperty(prop)) continue;

      if (Array.isArray(doc[prop])) {
        for (var i=0; i<doc[prop].length; i++) {
          if (typeof doc[prop][i] === 'object') {
            callback( prop, doc[prop][i]);
            _forEachNode(doc[prop][i], callback);
          }
        }
      } else if (typeof doc[prop] === 'object') {
        callback(prop, doc[prop]);
        _forEachNode(doc[prop], callback);
      }
    }
  };

  function _setIds(cdoc, env) {
    env = env || {counter: 0};

    if (!('@id' in cdoc) ) {
      var id = '_:n' + env.counter++;
      cdoc['@id'] = id;
    }

    //traverse
    _forEachNode(cdoc, function(prop, node){
      _setIds(node, env);
    });

    return cdoc;
  };

  //make sure that all node have an @id
  cdoc = _setIds(clone(cdoc));

  var entries = {};
  var refs = {};
  var hasDeps = false;

  //properties making a node a "downloadable"
  var dprops = ['encoding', 'distribution', 'codeRepository', 'downloadUrl', 'installUrl'];

  function _getEntry(node){
    //is the node a downloadable ?
    if (_intersect(Object.keys(node), dprops)) {
      refs[node['@id']] = node;
      entries[node['@id']] = {
        name: node.name || node['@id'],
        type: node['@type'] || 'CreativeWork',
        deps: []
      };
    }
  };

  //unnest
  _getEntry(cdoc)
  _forEachNode(cdoc, function(prop, node){
    _getEntry(node);
  });

  var keys = Object.keys(entries);

  function _getUrlOfReverseProp(x){
    if (!x) return;

    x = Array.isArray(x)? x: [x];
    return x.map(function(y){
      return (typeof y === 'string') ? y : y['@id'];
    });
  };

  //fill deps
  keys.forEach(function(key){
    var node = refs[key];
    var entry = entries[key];
    var parts;
    if (node.hasPart) {
      parts = Array.isArray(node.hasPart)? node.hasPart: [entry.hasPart];
    }

    entry.deps = (entry.deps).concat(
      node.isBasedOnUrl || [],
      node.requirements || [],
      _getUrlOfReverseProp(node.sourceCode) || [],
      (parts || []).map(function(x){
        return (typeof x === 'string')? x : x['@id'];
      })
    );

    //target products depends on source code
    if (node.targetProduct) {
      var targetProducts = Array.isArray(node.targetProduct)? node.targetProduct: [node.targetProduct];
      targetProducts.forEach(function(tp){
        var id = (typeof x === 'string')? tp : tp['@id'];
        if (id in entries) {
          entries[id].deps.push(node['@id']);
        }
      });
    }

    //isPartOf: is x isPartOf y then y depends on x
    (_getUrlOfReverseProp(node.isPartOf) || []).forEach(function(id){
      if (id in entries) {
        entries[id].deps.push(node['@id']);
      }
    });

    //only keep within document links
    entry.deps.filter(function(x){
      return ~keys.indexOf(x);
    });

    if (entry.deps.length) {
      hasDeps = true;
    }
  });

  var matrix = [];
  keys.forEach(function(xkey, i){
    var x = entries[xkey];
    var row = Array.apply(null, new Array(keys.length)).map(Number.prototype.valueOf,0);
    if (!hasDeps) {
      row[i] = 1;
    } else {
      keys.forEach(function(ykey, j){
        var y = entries[ykey];
        if (y.deps.indexOf(xkey) !== -1) {
          row[j] = 1;
        }
      });
    }
    matrix.push(row);
  });

  return {
    labels: keys.map(function(x) {return {name: entries[x].name, type: entries[x].type}}),
    matrix: matrix
  };

};

if (typeof module !== 'undefined' && module.exports){
  exports.graph = graph;
  exports.compute = compute;
}
