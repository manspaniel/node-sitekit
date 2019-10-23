var browserify = require('browserify');
var babelify = require('babelify');
var fs = require('fs');
var path = require('path');
var gulpWatch = require('gulp-watch');

const isWatch = process.argv.indexOf('--watch') > -1;

function transpile() {
  console.log("Transpiling to 'dist/bundle.js'...");

  let b = browserify(path.resolve(__dirname, '../src/index.js'), {
    standalone: 'sitekit'
  });

  if (!isWatch) b = b.plugin('tinyify');

  b.transform(
    babelify.configure({
      presets: ['@babel/preset-env']
    })
  )
    .bundle()
    .pipe(fs.createWriteStream(path.resolve(__dirname, '../dist/bundle.js')));
}

transpile();

if (isWatch) {
  console.log("Watching for changes in 'src' directory...");
  gulpWatch('./src/**/*', transpile);
}
