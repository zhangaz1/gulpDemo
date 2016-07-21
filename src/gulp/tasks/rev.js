'use strict';

module.exports = taskFactory;

function taskFactory(context) {
    var _ = context._;
    var gulp = context.gulp;

    var plugins = context.plugins;
    var rev = plugins.revOrig;
    var rename = plugins.rename;

    var distPath = context.config.paths.dist;

    var taskConfig = {
        files: [
            '/**/*.html'
        ],
        revOption: createRevOptions()
    };

    return taskHandler;

    function taskHandler() {
        var htmls = getFiles();
        return gulp.src(htmls)
            .pipe(rev(taskConfig.revOption))
            // .pipe(renameAddRevSuffix())
            .pipe(gulp.dest(distPath));
    }

    function renameAddRevSuffix() {
        return rename({ suffix: '.rev' });
    }

    function getFiles() {
        return _(taskConfig.files).map(function (path) {
            return distPath + path;
        }).value();
    }

    function createRevOptions() {
        var options = rev.createDefaultOptions();

        options.elementAttributes.loadJs = {
            tagRegStr: '(<js [^>]+/?>)',
            pathRegStr: '(?:(\\s+src=")([^"]+)("))'
        };

        options.fileTypes.push('loadJs');

        return options;
    }
}