'use strict';

module.exports = taskFactory;

function taskFactory(context) {
    var _ = context._;
    var exec = context.exec;
    var utils = context.utils;

    return taskHandler;

    function taskHandler() {
        var cpp = require(utils.getRelativePathFromRoot('./cpp.json'));

        var webRoot = cpp.NGWebServicesRoot;

        var config = require(utils.getRelativePathFromRoot(webRoot) + '/config.json');
        if (config.dependencies != undefined && config.dependencies.cpp != undefined) {
            var toFolder = utils.replacePathSeparator(webRoot + '/bin');
            var backendBinRelease = utils.replacePathSeparator(cpp.ReleaseFolder + '/');

            stopW3wp();
            utils.copyFiles(config.dependencies.cpp, backendBinRelease, toFolder);
            startW3wp();
        }
    }

    function startW3wp() {
        console.log(execCommand('Net start "World Wide Web Publishing Service"'));
    }

    function stopW3wp() {
        var status = execCommand('iisreset /status');
        if (status.lastIndexOf("Running") > 100) {
            console.log(execCommand('Net stop "World Wide Web Publishing Service"'));
            console.log(execCommand('taskkill /fi "imagename eq w3wp.exe" /f /t"'));
        }
    }

    function execCommand(command) {
        return exec(command).toString();
    }
}