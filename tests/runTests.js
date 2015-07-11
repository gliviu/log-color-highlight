"use strict";
var colors = require('colors');
var fs = require('fs');
var path = require('path');
var util = require('util');
var execute = require(__dirname + '/../index.js');
var streams = require('memory-streams');
var async = require('async');
var stringArgv = require('../string-argv');

var INPUT1_PATH = path.normalize(__dirname + '/input1.txt');
var INPUT2_PATH = path.normalize(__dirname + '/input2.txt');

var count = 0, failed = 0, successful = 0;

function passed (value) {
    count++;
    if(value){
        successful++;
    } else{
        failed++;
    }
    return value ? 'Passed'.green : '!!!!FAILED!!!!'.yellow;
}

var currentTest = 0;
var tests = [
             {
                 name: 'test1',
                 args: "-f "+INPUT1_PATH+" -blue.bold SysMonWidget -blue 9084 -yellow ' \\d\\d\\d' -RED.bold '.*at .*?(\\d|native method)\\)' -GREEN.BOLD 'start timer activated' -BGGREEN.BOLD.WHITE end",
                 res: false
             },
             
             // TEST SET 2 - processLine()
             // Case 1
             {
                 name: 'test2_case1_1',
                 args: "-f "+INPUT2_PATH+" -green receive -red ctrl",
                 res: false
             },
             {
                 name: 'test2_case1_2',
                 args: "-f "+INPUT2_PATH+" -red ctrl -green receive",
                 res: false
             },
             {
                 name: 'test2_case1_3',
                 args: "-f "+INPUT2_PATH+" -green monitorid -red ctrl",
                 res: false
             },
             {
                 name: 'test2_case1_4',
                 args: "-f "+INPUT2_PATH+" -red monit -green orid",
                 res: false
             },
             {
                 name: 'test2_case1_5',
                 args: "-f "+INPUT2_PATH+" -red orid -green monit",
                 res: false
             },
             // Case 2
             {
                 name: 'test2_case2_1',
                 args: "-f "+INPUT2_PATH+" -green onit -red monitorid",
                 res: false
             },
             {
                 name: 'test2_case2_2',
                 args: "-f "+INPUT2_PATH+" -green monit -red monitorid",
                 res: false
             },
             {
                 name: 'test2_case2_3',
                 args: "-f "+INPUT2_PATH+" -green onitorid -red monitorid",
                 res: false
             },
             // Case 3
//             {
//                 name: 'test2_case3_1',
//                 args: "-f "+INPUT2_PATH+" -green nitor -red monit",
//                 res: false
//             },
//             {
//                 name: 'test2_case3_2',
//                 args: "-f "+INPUT2_PATH+" -green nitor -red mon",
//                 res: false
//             },
//             // Case 4
//             {
//                 name: 'test2_case4_1',
//                 args: "-f "+INPUT2_PATH+" -green nitor -red torid",
//                 res: false
//             },
//             {
//                 name: 'test2_case4_2',
//                 args: "-f "+INPUT2_PATH+" -green nitor -red rid",
//                 res: false
//             },
//             // Case 5
//             {
//                 name: 'test2_case5_1',
//                 args: "-f "+INPUT2_PATH+" -green monitorid -red itor",
//                 res: false
//             },
//             {
//                 name: 'test2_case5_2',
//                 args: "-f "+INPUT2_PATH+" -green monitorid -red monit",
//                 res: false
//             },
//             {
//                 name: 'test2_case5_3',
//                 args: "-f "+INPUT2_PATH+" -green monitorid -red orid",
//                 res: false
//             },
    ];

function test() {
    var t = tests[currentTest++];
    var args = stringArgv.parseArgsStringToArgv(t.args);
    
    var writer = new streams.WritableStream();
    var handler = execute(args, writer);
    handler.on('finished', function(){
        var output = writer.toString();
        var expected = fs.readFileSync(__dirname + '/expected/' + t.name + '.txt', 'utf8');
        if (t.name == 'test2_1') {
          console.log(output);
        }
        var res = output === expected;
        t.res = res;
        if(currentTest<tests.length){
            test();
        } else{
            for (var i = 0; i < tests.length; i++) {
                var testres = tests[i];
                console.log(testres.name+': ' + passed(testres.res));
            }
            console.log();
            console.log('Tests: ' + count + ', failed: ' + failed.toString().yellow + ', succeeded: ' + successful.toString().green);
        }
    });
}

function test1(callback){
    var params;
    
    params = stringArgv.parseArgsStringToArgv("-f "+INPUT1_PATH+" -blue.bold SysMonWidget -blue 9084 -yellow ' \\d\\d\\d' -RED.bold '.*at .*?(\\d|native method)\\)' -GREEN.BOLD 'start timer activated' -BGGREEN.BOLD.WHITE end");
    test('test1', params, callback);
}

function test2(callback){
    var params;
    
    params = stringArgv.parseArgsStringToArgv("-f "+INPUT2_PATH+" -green receive -red ctrl");
    test('test2_1', params, callback);
    
}

function runTests () {
    test();
}

runTests();
