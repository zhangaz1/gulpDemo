'use strict';

module.exports = taskFactory;

function taskFactory(context) {
    var clean = context.plugins.clean;

    var config = context.config;
    var gulp = context.gulp;

    var paths = config.paths;

    var taskConfig = {
        folders: []
    };

    return taskHandler;

    function taskHandler() {
        var dirs = taskConfig.folders.concat([paths.dist, paths.temp]);

        return gulp.src(dirs, { read: false }).pipe(clean());
    }
}