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
      isBasedOnUrl: ['mypkg/0.0.0/dataset/data1', 'mypkg/0.0.0/sourceCode/sourceCode']
    },
    {
      '@id': 'mypkg/0.0.0/dataset/result2',
      name: 'result2',
      isBasedOnUrl: ['mypkg/0.0.0/dataset/data2', 'mypkg/0.0.0/sourceCode/sourceCode']
    }
  ],
  sourceCode: [
    {
      '@id': 'mypkg/0.0.0/sourceCode/sourceCode',
      name: 'sourceCode',
      targetProduct: [{
        input: ['mypkg/0.0.0/dataset/data1', 'mypkg/0.0.0/dataset/data2'],
        output: ['mypkg/0.0.0/dataset/result1', 'mypkg/0.0.0/dataset/result2', 'mypkg/0.0.0/dataset/image1', 'mypkg/0.0.0/dataset/image2']
      }]
    }
  ],
  image: [
    {
      '@id': 'mypkg/0.0.0/image/image1',
      name: 'image1',
      isBasedOnUrl: ['mypkg/0.0.0/dataset/data1', 'mypkg/0.0.0/dataset/result1', 'mypkg/0.0.0/sourceCode/sourceCode']
    },
    {
      '@id': 'mypkg/0.0.0/image1/image2',
      name: 'image2',
      isBasedOnUrl: ['mypkg/0.0.0/dataset/data2', 'mypkg/0.0.0/dataset/result2', 'mypkg/0.0.0/sourceCode/sourceCode']
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
  sourceCode: [
    {
      '@id': 'mypkg/0.0.0/sourceCode/sourceCode',
      name: 'sourceCode'
    }
  ],
  image: [
    {
      '@id': 'mypkg/0.0.0/image/image',
      name: 'image'
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
