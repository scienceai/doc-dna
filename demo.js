var d3 = require('d3')
  , dpkgDna = require('./index');

var dpkg = {
  name: 'mydpkg',
  version: '0.0.0',
  dataset: [
    {
      '@id': 'mydpkg/0.0.0/dataset/data1',
      name: 'data1'
    },
    {
      '@id': 'mydpkg/0.0.0/dataset/data2',
      name: 'data2',
      isBasedOnUrl: ['mydpkg/0.0.0/dataset/data1']
    },
    {
      '@id': 'mydpkg/0.0.0/dataset/result1',
      name: 'result1',
      isBasedOnUrl: ['mydpkg/0.0.0/dataset/data1', 'mydpkg/0.0.0/code/code']
    },
    {
      '@id': 'mydpkg/0.0.0/dataset/result2',
      name: 'result2',
      isBasedOnUrl: ['mydpkg/0.0.0/dataset/data2', 'mydpkg/0.0.0/code/code']
    }
  ],
  code: [
    {
      '@id': 'mydpkg/0.0.0/code/code',
      name: 'code',
      targetProduct:{
        input: ['mydpkg/0.0.0/dataset/data1', 'mydpkg/0.0.0/dataset/data2'],
        output: ['mydpkg/0.0.0/dataset/result1', 'mydpkg/0.0.0/dataset/result2', 'mydpkg/0.0.0/dataset/figure1', 'mydpkg/0.0.0/dataset/figure2']
      }
    }
  ],
  figure: [
    {
      '@id': 'mydpkg/0.0.0/figure/figure1',
      name: 'figure1',
      isBasedOnUrl: ['mydpkg/0.0.0/dataset/data1', 'mydpkg/0.0.0/dataset/result1', 'mydpkg/0.0.0/code/code']
    },
    {
      '@id': 'mydpkg/0.0.0/figure1/figure2',
      name: 'figure2',
      isBasedOnUrl: ['mydpkg/0.0.0/dataset/data2', 'mydpkg/0.0.0/dataset/result2', 'mydpkg/0.0.0/code/code']
    }
  ]
};

var dpkgInd = {
  name: 'mydpkg',
  version: '0.0.0',
  dataset: [
    {
      '@id': 'mydpkg/0.0.0/dataset/data',
      name: 'data'
    }
  ],
  code: [
    {
      '@id': 'mydpkg/0.0.0/code/code',
      name: 'code'
    }
  ],
  figure: [
    {
      '@id': 'mydpkg/0.0.0/figure/figure',
      name: 'figure'
    }
  ]
};

//export for tests
if (typeof module !== 'undefined' && module.exports){
  exports.dpkg = dpkg;
  exports.dpkgInd = dpkgInd;
} 

if(typeof window !== 'undefined'){
  window.dpkg = dpkg;
  window.dpkgInd = dpkgInd;  
  window.d3 = d3;
  window.dpkgDna = dpkgDna;
}
