'use strict';

var requireDir = require('requiredir');

module.exports = taskLoader;

function taskLoader(context) {
    var _ = context._;
    var gulp = context.gulp;

    var definedTasks = loadTasks();
    var taskSettings = context.config.tasks;

    updateTaskSettings(definedTasks, taskSettings);
    registerTasks(definedTasks, taskSettings);

    //return;

    function loadTasks() {
        var tasks = requireDir('./tasks');
        return _.omit(tasks, 'length', 'toArray');
    }

    function registerTasks(definedTasks, taskSettings) {
        _.mapKeys(definedTasks, function (taskFactory, taskName) {
            var taskHandler = taskFactory(context);
            if (taskHandler.dependencies) {
                gulp.task(taskName, taskHandler.dependencies, taskHandler);
            } else {
                gulp.task(taskName, taskHandler);
            }
        });
    }

    function updateTaskSettings(definedTasks, taskSettings) {
        _.mapKeys(definedTasks, function (taskFactory, taskName) {
            var taskSetting = taskSettings[taskName] ? taskSettings[taskName] : taskSettings[taskName] = {};
            taskSetting.name = taskName;
        });
    }
}