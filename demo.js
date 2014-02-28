var d3 = require('d3')
  , ctnrDna = require('./index');

var ctnr = {
  name: 'myctnr',
  version: '0.0.0',
  dataset: [
    {
      '@id': 'myctnr/0.0.0/dataset/data1',
      name: 'data1'
    },
    {
      '@id': 'myctnr/0.0.0/dataset/data2',
      name: 'data2',
      isBasedOnUrl: ['myctnr/0.0.0/dataset/data1']
    },
    {
      '@id': 'myctnr/0.0.0/dataset/result1',
      name: 'result1',
      isBasedOnUrl: ['myctnr/0.0.0/dataset/data1', 'myctnr/0.0.0/code/code']
    },
    {
      '@id': 'myctnr/0.0.0/dataset/result2',
      name: 'result2',
      isBasedOnUrl: ['myctnr/0.0.0/dataset/data2', 'myctnr/0.0.0/code/code']
    }
  ],
  code: [
    {
      '@id': 'myctnr/0.0.0/code/code',
      name: 'code',
      targetProduct:{
        input: ['myctnr/0.0.0/dataset/data1', 'myctnr/0.0.0/dataset/data2'],
        output: ['myctnr/0.0.0/dataset/result1', 'myctnr/0.0.0/dataset/result2', 'myctnr/0.0.0/dataset/figure1', 'myctnr/0.0.0/dataset/figure2']
      }
    }
  ],
  figure: [
    {
      '@id': 'myctnr/0.0.0/figure/figure1',
      name: 'figure1',
      isBasedOnUrl: ['myctnr/0.0.0/dataset/data1', 'myctnr/0.0.0/dataset/result1', 'myctnr/0.0.0/code/code']
    },
    {
      '@id': 'myctnr/0.0.0/figure1/figure2',
      name: 'figure2',
      isBasedOnUrl: ['myctnr/0.0.0/dataset/data2', 'myctnr/0.0.0/dataset/result2', 'myctnr/0.0.0/code/code']
    }
  ]
};

var ctnrInd = {
  name: 'myctnr',
  version: '0.0.0',
  dataset: [
    {
      '@id': 'myctnr/0.0.0/dataset/data',
      name: 'data'
    }
  ],
  code: [
    {
      '@id': 'myctnr/0.0.0/code/code',
      name: 'code'
    }
  ],
  figure: [
    {
      '@id': 'myctnr/0.0.0/figure/figure',
      name: 'figure'
    }
  ]
};

//export for tests
if (typeof module !== 'undefined' && module.exports){
  exports.ctnr = ctnr;
  exports.ctnrInd = ctnrInd;
} 

if(typeof window !== 'undefined'){
  window.ctnr = ctnr;
  window.ctnrInd = ctnrInd;  
  window.d3 = d3;
  window.ctnrDna = ctnrDna;
}
