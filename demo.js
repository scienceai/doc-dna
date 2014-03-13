var d3 = require('d3')
  , pkgDna = require('./index');

var pkg = {
  name: 'mypkg',
  version: '0.0.0',
  dataset: [
    {
      '@id': 'mypkg/0.0.0/dataset/data1',
      name: 'data1'
    },
    {
      '@id': 'mypkg/0.0.0/dataset/data2',
      name: 'data2',
      isBasedOnUrl: ['mypkg/0.0.0/dataset/data1']
    },
    {
      '@id': 'mypkg/0.0.0/dataset/result1',
      name: 'result1',
      isBasedOnUrl: ['mypkg/0.0.0/dataset/data1', 'mypkg/0.0.0/code/code']
    },
    {
      '@id': 'mypkg/0.0.0/dataset/result2',
      name: 'result2',
      isBasedOnUrl: ['mypkg/0.0.0/dataset/data2', 'mypkg/0.0.0/code/code']
    }
  ],
  code: [
    {
      '@id': 'mypkg/0.0.0/code/code',
      name: 'code',
      targetProduct:{
        input: ['mypkg/0.0.0/dataset/data1', 'mypkg/0.0.0/dataset/data2'],
        output: ['mypkg/0.0.0/dataset/result1', 'mypkg/0.0.0/dataset/result2', 'mypkg/0.0.0/dataset/figure1', 'mypkg/0.0.0/dataset/figure2']
      }
    }
  ],
  figure: [
    {
      '@id': 'mypkg/0.0.0/figure/figure1',
      name: 'figure1',
      isBasedOnUrl: ['mypkg/0.0.0/dataset/data1', 'mypkg/0.0.0/dataset/result1', 'mypkg/0.0.0/code/code']
    },
    {
      '@id': 'mypkg/0.0.0/figure1/figure2',
      name: 'figure2',
      isBasedOnUrl: ['mypkg/0.0.0/dataset/data2', 'mypkg/0.0.0/dataset/result2', 'mypkg/0.0.0/code/code']
    }
  ]
};

var pkgInd = {
  name: 'mypkg',
  version: '0.0.0',
  dataset: [
    {
      '@id': 'mypkg/0.0.0/dataset/data',
      name: 'data'
    }
  ],
  code: [
    {
      '@id': 'mypkg/0.0.0/code/code',
      name: 'code'
    }
  ],
  figure: [
    {
      '@id': 'mypkg/0.0.0/figure/figure',
      name: 'figure'
    }
  ]
};

//export for tests
if (typeof module !== 'undefined' && module.exports){
  exports.pkg = pkg;
  exports.pkgInd = pkgInd;
}

if(typeof window !== 'undefined'){
  window.pkg = pkg;
  window.pkgInd = pkgInd;
  window.d3 = d3;
  window.pkgDna = pkgDna;
}
