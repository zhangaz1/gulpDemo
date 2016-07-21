'use strict';

module.exports = taskFactory;

function taskFactory(context) {
    var _ = context._;
    var gulp = context.gulp;
    var paths = context.config.paths;
    var tasks = context.config.tasks;

    var taskConfig = {
        include: ['/**/*.*'],
        ignore: [
            '/bgimg/**',
            '/less/**',
            '/lib/**',
            '/modules/**',
            '/views/**'
        ]
    };

    var appPath = paths.app;
    var distPath = paths.dist;
    
    return taskHandler;

    function taskHandler() {
        var srcs = context.utils.getSrcs(appPath, taskConfig);

        return gulp.src(srcs).pipe(gulp.dest(distPath));
    }
}