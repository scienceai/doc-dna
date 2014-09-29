var docDna = require('../index')
  , path = require('path')
  , fs = require('fs')
  , assert = require('assert');

var docAll = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'doc_all.jsonld')));
var docDep = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'doc_dep.jsonld')));
var docInd = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'doc_ind.jsonld')));
var docUnit = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'doc_unit.jsonld')));

describe('docDna', function(){

  it('should compute the dependencies taking into account the side cases of hasPart, isPartOf, targetProduct, sourceCode', function(){
    var expected = {
      labels: [
        { name: 'doc all', type: 'CreativeWork' },
        { name: 'data1', type: 'Dataset' },
        { name: 'data2', type: 'Dataset' },
        { name: 'code', type: 'Code' },
        { name: 'prog', type: 'SoftwareApplication' },
        { name: 'prog2', type: 'SoftwareApplication' }
      ],
      matrix: [
        [ 0, 0, 0, 0, 0, 0], //doc all needed by nothing
        [ 1, 0, 0, 0, 0, 0], //data1 needed by doc all (hasPart)
        [ 1, 1, 0, 0, 0, 0], //data2 needed by doc all (hasPart) and data2 (due to isPartOf)
        [ 1, 0, 0, 0, 1, 1], //code needed by doc all (hasPart), prog (due to targetProduct) and prog2 (soruceCode)
        [ 0, 0, 0, 0, 0, 0],  //prog needed by nothing
        [ 1, 0, 0, 0, 0, 0]  //prog2 needed by doc all
      ]
    };

    var data = docDna.compute(docAll);
    assert.deepEqual(data, expected);
  });

  it('should compute the data needed for a chord diagram', function(){
    var expected = {
      labels: [
        { name: 'data1', type: 'Dataset' },
        { name: 'data2', type: 'Dataset' },
        { name: 'result1', type: 'Dataset' },
        { name: 'result2', type: 'Dataset' },
        { name: 'prog', type: 'SoftwareApplication' },
        { name: 'image1', type: 'ImageObject' },
        { name: 'image2', type: 'ImageObject' }
      ],
      matrix: [
        [ 0, 1, 1, 0, 1, 1, 0 ], //data1 needed by data2, result1, sourceCode and image1
        [ 0, 0, 0, 1, 1, 0, 1 ], //data2 needed by result2, sourceCode and image2
        [ 0, 0, 0, 0, 0, 1, 0 ], //result1 needed by image 1
        [ 0, 0, 0, 0, 0, 0, 1 ], //result2 needed by image 2
        [ 0, 0, 1, 1, 0, 1, 1 ], //sourceCode needed by results1, results2, image1 and image2
        [ 0, 0, 0, 0, 0, 0, 0 ], //image 1 needed by nothing
        [ 0, 0, 0, 0, 0, 0, 0 ], //image 2 needed by nothing
      ]
    };

    var data = docDna.compute(docDep);
    assert.deepEqual(data, expected);
  });

  it('should compute the data needed for a chord diagram in the special case when all the element are independent', function(){
    var expected = {
      labels: [
        { name: 'data', type: 'Dataset' },
        { name: 'prog', type: 'SoftwareApplication' },
        { name: 'image', type: 'ImageObject' }
      ],
      matrix: [ //diag matrix if no deps
        [ 1, 0, 0 ],
        [ 0, 1, 0 ],
        [ 0, 0, 1 ]
      ]
    };
    var data = docDna.compute(docInd);
    assert.deepEqual(data, expected);
  });

  it('should compute the data needed for a chord diagram when only one resource exists', function(){
    var expected =  {
      'labels':[{'name':'doc unit','type':'ScholarlyArticle'}],
      'matrix':[[1]]
    };
    var data = docDna.compute(docUnit);
    assert.deepEqual(data, expected);
  });

});
