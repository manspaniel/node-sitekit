var browserify = require('browserify');
var babelify = require('babelify');
var fs = require('fs');
var path = require('path');
var gulpWatch = require('gulp-watch');

function transpile() {
  console.log("Transpiling to 'dist/bundle.js'...");
  browserify(path.resolve(__dirname, '../src/index.js'), {
    standalone: "sitekit"
  })
    .transform(babelify.configure({
      presets: [["env", {
        targets: {
          "browsers": [
            "last 2 versions",
            "ie >= 9"
          ]
        },
        "useBuiltIns": true
      }]]
    }))
    .bundle()
    .pipe(fs.createWriteStream(path.resolve(__dirname, '../dist/bundle.js')));
}

transpile();

if(process.argv.indexOf("--watch") > -1) {
  console.log("Watching for changes in 'src' directory...");
  gulpWatch("./src/**/*", transpile);
}