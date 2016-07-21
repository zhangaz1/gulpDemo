'use strict';

module.exports = taskFactory;

function taskFactory(context) {
    var gulp = context.gulp;

    var sequence = context.plugins.sequence;

    var tasks = context.config.tasks;

    return sequence(tasks.clean.name, [
            tasks.html.name,
            tasks.libs.name,
            tasks.templates.name,
            tasks.modules.name
    ],
        tasks.rev.name
    );
}