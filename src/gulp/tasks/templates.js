'use strict';

module.exports = taskFactory;

function taskFactory(context) {
    var streamqueue = require('streamqueue');

    var gulp = context.gulp;

    var plugins = context.plugins;
    var rename = plugins.rename;
    var templateCache = plugins.angularTemplatecache;

    var paths = context.config.paths;
    var jsPath = paths.dist + '/js/';

    return taskHandler;

    function taskHandler() {
        return streamqueue({ objectMode: true }, getModulesHtmlStream(), getViewsHtmlStream())
            .pipe(catchTemplate())
            .pipe(gulp.dest(jsPath))
            .pipe(renameMin())
            .pipe(gulp.dest(jsPath));
    }

    function catchTemplate() {
        return templateCache('templates.js', { module: "nb.ng", standalone: false });
    }

    function renameMin() {
        return rename({ suffix: '.min' });
    }

    function getModulesHtmlStream() {
        return getDirHtmlStream('modules');
    }

    function getViewsHtmlStream() {
        return getDirHtmlStream('views');
    }

    function getDirHtmlStream(dir) {
        return gulp.src(paths.app + '/' + dir + '/**/*.html')
            .pipe(renameDir(dir));
    }

    function renameDir(dir) {
        return rename(function (path) {
            path.dirname = dir + '/' + path.dirname;
        });
    }
}