var SchemaOrgIo = require('schema-org-io')
  , path = require('path')
  , fs = require('fs');

var schema = new SchemaOrgIo();

var types = {
  dataset: ['Dataset'].concat(schema.getSubClasses('Dataset')),
  code: ['Code'].concat(schema.getSubClasses('Code'), 'SoftwareApplication', schema.getSubClasses('SoftwareApplication')),
  article: ['Article'].concat(schema.getSubClasses('Article'), 'Book', schema.getSubClasses('Book')),
  image: ['ImageObject'].concat(schema.getSubClasses('ImageObject')),
  audio: ['AudioObject'].concat(schema.getSubClasses('AudioObject')),
  video: ['VideoObject'].concat(schema.getSubClasses('VideoObject'))
};

fs.writeFileSync(path.join(__dirname,'data.json'), JSON.stringify(types, null, 2));
