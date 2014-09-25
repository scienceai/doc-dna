var d3 = require('d3');
var docDna = require('./index');
var fs = require('fs');

var docAll = JSON.parse(fs.readFileSync(__dirname + '/test/fixtures/doc_all.jsonld', 'utf8'));
var docDep = JSON.parse(fs.readFileSync(__dirname + '/test/fixtures/doc_dep.jsonld', 'utf8'));
var docInd = JSON.parse(fs.readFileSync(__dirname + '/test/fixtures/doc_ind.jsonld', 'utf8'));
var docUnit = JSON.parse(fs.readFileSync(__dirname + '/test/fixtures/doc_unit.jsonld', 'utf8'));

document.addEventListener('DOMContentLoaded', function(){
  var x = docDna.graph().padding(0.08);

  d3.selectAll('.chart')
    .data([
      docDna.compute(docUnit),
      docDna.compute(docInd),
      docDna.compute(docDep),
      docDna.compute(docAll)
    ])
    .call(x);
});
