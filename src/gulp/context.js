'use strict';

module.exports = createContext();

function createContext() {
    var gulp = require('gulp-help')(require('gulp'));
    var plugins = require('gulp-load-plugins')();

    return {
        _: require('lodash'),
        path: require('path'),
        exec: require('child_process').execSync,
        utils: require('./utils.js'),
        package: require('./../package.json'),
        config: require('./config.json'),
        gulp: gulp,
        plugins: plugins,
        map: require('map-stream'),
        autoprefixer: require('autoprefixer')
    };
}
