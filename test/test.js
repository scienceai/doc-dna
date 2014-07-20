var pkgDna = require('../index')
  , demo = require('../demo')
  , assert = require('assert');

describe('pkgDna', function(){

  describe('compute', function(){
    it('should compute the data needed for a chord diagram', function(){    

      var expected = {
        labels: [
          { name: 'data1', type: 'dataset' },
          { name: 'data2', type: 'dataset' },
          { name: 'result1', type: 'dataset' },
          { name: 'result2', type: 'dataset' },
          { name: 'sourceCode', type: 'sourceCode' },
          { name: 'image1', type: 'image' },
          { name: 'image2', type: 'image' } 
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

      var data = pkgDna.compute(demo.pkg);
      assert.deepEqual(data, expected);
    });

    it('should compute the data needed for a chord diagram in the special case when all the element are independent', function(){

      var expected = {
        labels: [
          { name: 'data', type: 'dataset' },
          { name: 'sourceCode', type: 'sourceCode' },
          { name: 'image', type: 'image' } 
        ],
        matrix: [ //diag matrix if no deps
          [ 1, 0, 0 ],
          [ 0, 1, 0 ],
          [ 0, 0, 1 ]
        ]
      };

      var data = pkgDna.compute(demo.pkgInd);
      assert.deepEqual(data, expected);    
    });

  });

});
