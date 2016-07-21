'use strict';

module.exports = taskFactory;

function taskFactory(context) {
    var _ = context._;
    var gulp = context.gulp;
    var sequence = context.plugins.sequence;

    var utils = context.utils;

    var cpp;

    return createTaskHandler();

    function createTaskHandler() {
        cpp = require(utils.getRelativePathFromRoot('./cpp.json'));

        if (cpp.cppRequiredProjects.length < 1) {
            return;
        }

        var debugPaths = getPaths(cpp.cppRequiredProjects, '/bin/Debug/*.*');
        var releasePaths = getPaths(cpp.cppRequiredProjects, '/bin/Release/*.*');

        var subTasks = [];
        subTasks.push(createDebugTask(debugPaths));
        subTasks.push(createReleaseTask(releasePaths));

        return sequence(subTasks);
    }

    function getPaths(dirs, files) {
        return _.map(dirs, function (dir) {
            return dir + files;
        }
        );
    }

    function createDebugTask(files) {
        var taskName = 'cpp_debugtask';
        createTask(taskName, files, cpp.DebugFolder);
        return taskName;
    }

    function createReleaseTask(files) {
        var taskName = 'cpp_releasetask';
        createTask(taskName, files, cpp.ReleaseFolder);
        return taskName;
    }

    function createTask(taskName, files, destFolder) {
        gulp.task(taskName, function () {
            return gulp.src(files).pipe(gulp.dest(destFolder));
        });
    }
}