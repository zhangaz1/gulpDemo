'use strict';

module.exports = taskFactory;

function taskFactory(context) {
    var gulp = context.gulp;
    var config = context.config;

    var taskConfig = {
        files: [
            './gf.js',
            './gulp/**/*.js',
            './gulp/**/*.json'
        ]
    };

    return taskHandler;

    function taskHandler() {
        gulp.watch(taskConfig.files, function (event) {
            console.log(event);
            return gulp.start(config.tasks.default.name);
        });
    }
}