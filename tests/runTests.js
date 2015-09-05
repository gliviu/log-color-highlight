"use strict";
var colors = require('colors');
var fs = require('fs');
var path = require('path');
var util = require('util');
var parseCmd = require(__dirname + '/../parseCmd.js');
var highlight = require(__dirname + '/../index.js');
var streams = require('memory-streams');
var stringArgv = require('../string-argv');
var events = require('events');

var INPUT1_PATH = path.normalize(__dirname + '/input1.txt');
var INPUT2_PATH = path.normalize(__dirname + '/input2.txt');
var INPUT3_PATH = path.normalize(__dirname + '/input3.txt');
var INPUT4_PATH = path.normalize(__dirname + '/input4.txt');

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
                 name: 'test1_case1',
                 args: "-f "+INPUT1_PATH+" -blue.bold SysMonWidget -blue 9084 -yellow ' \\d\\d\\d' -RED.bold '.*at .*?(\\d|native method)\\)' -GREEN.BOLD 'start timer activated' -BGGREEN.BOLD.WHITE end",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test1_case2',
                 args: "-f "+INPUT3_PATH+" -green 1234 123456",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test1_case3',
                 args: "-f "+INPUT3_PATH+" -green 1234 123456 5678",
                 shouldFail: false,
                 res: false
             }, 
             
             // TEST SET 2 - processLine()
             // Case 1
             {
                 name: 'test2_case1_1',
                 args: "-f "+INPUT2_PATH+" -green receive -red ctrl",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test2_case1_2',
                 args: "-f "+INPUT2_PATH+" -red ctrl -green receive",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test2_case1_3',
                 args: "-f "+INPUT2_PATH+" -green monitorid -red ctrl",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test2_case1_4',
                 args: "-f "+INPUT2_PATH+" -red monit -green orid",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test2_case1_5',
                 args: "-f "+INPUT2_PATH+" -red orid -green monit",
                 shouldFail: false,
                 res: false
             },
             // Case 2
             {
                 name: 'test2_case2_1',
                 args: "-f "+INPUT2_PATH+" -green onit -red monitorid",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test2_case2_2',
                 args: "-f "+INPUT2_PATH+" -green monit -red monitorid",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test2_case2_3',
                 args: "-f "+INPUT2_PATH+" -green onitorid -red monitorid",
                 shouldFail: false,
                 res: false
             },
             // Case 3
             {
                 name: 'test2_case3_1',
                 args: "-f "+INPUT2_PATH+" -green nitor -red monit",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test2_case3_2',
                 args: "-f "+INPUT2_PATH+" -green nitor -red mon",
                 shouldFail: false,
                 res: false
             },
             // Case 4
             {
                 name: 'test2_case4_1',
                 args: "-f "+INPUT2_PATH+" -green nitor -red torid",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test2_case4_2',
                 args: "-f "+INPUT2_PATH+" -green nitor -red rid",
                 shouldFail: false,
                 res: false
             },
             // Case 5
             {
                 name: 'test2_case5_1',
                 args: "-f "+INPUT2_PATH+" -green monitorid -red itor",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test2_case5_2',
                 args: "-f "+INPUT2_PATH+" -green monitorid -red monit",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test2_case5_3',
                 args: "-f "+INPUT2_PATH+" -green monitorid -red orid",
                 shouldFail: false,
                 res: false
             },
             
             // TEST SET 3 - Modifiers - ci, cs
             {
                 name: 'test3_case1',
                 args: "-f "+INPUT4_PATH+" -green monitorid 'On receive' -red ctrl",
                 expected: "[32mOn receive[39m ([31mCtrl[39m) - [32mmonitorId[39m: 3e5e8426-5891-4256-8bda-b03bf6f14d67",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test3_case2',
                 args: "-f "+INPUT4_PATH+" -cs -green monitorid 'On receive' -red ctrl",
                 expected: "[32mOn receive[39m (Ctrl) - monitorId: 3e5e8426-5891-4256-8bda-b03bf6f14d67",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test3_case3',
                 args: "-f "+INPUT4_PATH+" -green monitorid 'On receive' -cs -red ctrl",
                 expected: "[32mOn receive[39m (Ctrl) - monitorId: 3e5e8426-5891-4256-8bda-b03bf6f14d67",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test3_case4',
                 args: "-f "+INPUT4_PATH+" -green monitorid 'On receive' -red ctrl -cs",
                 expected: "[32mOn receive[39m (Ctrl) - monitorId: 3e5e8426-5891-4256-8bda-b03bf6f14d67",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test3_case5',
                 args: "-f "+INPUT4_PATH+" -green.ci monitorid 'On receive' -red ctrl",
                 expected: "[32mOn receive[39m ([31mCtrl[39m) - [32mmonitorId[39m: 3e5e8426-5891-4256-8bda-b03bf6f14d67",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test3_case6',
                 args: "-f "+INPUT4_PATH+" -ci.green monitorid 'On receive' -red.ci ctrl",
                 expected: "[32mOn receive[39m ([31mCtrl[39m) - [32mmonitorId[39m: 3e5e8426-5891-4256-8bda-b03bf6f14d67",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test3_case7',
                 args: "-f "+INPUT4_PATH+" -cs.green monitorid 'On receive' -red.cs ctrl",
                 expected: "[32mOn receive[39m (Ctrl) - monitorId: 3e5e8426-5891-4256-8bda-b03bf6f14d67",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test3_case8',
                 args: "-f "+INPUT4_PATH+" -cs -cs.green monitorid 'On receive' -red.cs ctrl",
                 expected: "[32mOn receive[39m (Ctrl) - monitorId: 3e5e8426-5891-4256-8bda-b03bf6f14d67",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test3_case9',
                 args: "-f "+INPUT4_PATH+" -cs -ci.green monitorid 'On receive' -red.cs ctrl",
                 expected: "[32mOn receive[39m (Ctrl) - [32mmonitorId[39m: 3e5e8426-5891-4256-8bda-b03bf6f14d67",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test3_case10',
                 args: "-f "+INPUT4_PATH+" -cs -ci.green monitorid 'On receive' -red.ci ctrl",
                 expected: "[32mOn receive[39m ([31mCtrl[39m) - [32mmonitorId[39m: 3e5e8426-5891-4256-8bda-b03bf6f14d67",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test3_case11',
                 args: "-f "+INPUT4_PATH+" -cs -bold.ci.green monitorid 'On receive' -red.ci.bold ctrl",
                 expected: "[1m[32mOn receive[39m[22m ([31m[1mCtrl[22m[39m) - [1m[32mmonitorId[39m[22m: 3e5e8426-5891-4256-8bda-b03bf6f14d67",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test3_case12',
                 args: "-f "+INPUT4_PATH+" -cs -bold.ci.cs.green monitorid 'On receive' -red.ci.bold ctrl",
                 expected: "[1m[32mOn receive[39m[22m ([31m[1mCtrl[22m[39m) - [1m[32mmonitorId[39m[22m: 3e5e8426-5891-4256-8bda-b03bf6f14d67",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test3_case13',
                 args: "-f "+INPUT4_PATH+" -cs -bold.ci.ci.green monitorid 'On receive' -red.ci.bold ctrl",
                 expected: "[1m[32mOn receive[39m[22m ([31m[1mCtrl[22m[39m) - [1m[32mmonitorId[39m[22m: 3e5e8426-5891-4256-8bda-b03bf6f14d67",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test3_case14',
                 args: "-f "+INPUT4_PATH+" -cs -bold.cs.cs.green monitorid 'On receive' -red.ci.bold ctrl",
                 expected: "[1m[32mOn receive[39m[22m ([31m[1mCtrl[22m[39m) - monitorId: 3e5e8426-5891-4256-8bda-b03bf6f14d67",
                 shouldFail: false,
                 res: false
             },
             
             // TEST SET 4 - Modifiers - esc
             {
                 name: 'test4_case1',
                 expected: "On receive (Ctrl) - monitorId: 3e5e8426-5891-4256-8bda-b03bf6f14d67",
                 args: "-f "+INPUT4_PATH+" -green 'receive (ctrl) -'",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test4_case2',
                 args: "-f "+INPUT4_PATH+" -esc.green 'receive (ctrl) -'",
                 expected: "On [32mreceive (Ctrl) -[39m monitorId: 3e5e8426-5891-4256-8bda-b03bf6f14d67",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test4_case3',
                 args: "-f "+INPUT4_PATH+" -green.esc.bold 'receive (ctrl) -'",
                 expected: "On [32m[1mreceive (Ctrl) -[22m[39m monitorId: 3e5e8426-5891-4256-8bda-b03bf6f14d67",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test4_case4',
                 args: "-f "+INPUT4_PATH+" -green 'receive \\(ctrl\\) -'",
                 expected: "On [32mreceive (Ctrl) -[39m monitorId: 3e5e8426-5891-4256-8bda-b03bf6f14d67",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test4_case5',
                 args: "-f "+INPUT4_PATH+" -green.esc 'receive \\(ctrl\\) -'",
                 expected: "On receive (Ctrl) - monitorId: 3e5e8426-5891-4256-8bda-b03bf6f14d67",
                 shouldFail: false,
                 res: false
             },
             
             // TEST SET 5 - Default highlight
             {
                 name: 'test5_case1',
                 args: "-f "+INPUT4_PATH+" ctrl monitor",
                 expected: "On receive ([31mCtrl[39m) - [31mmonitor[39mId: 3e5e8426-5891-4256-8bda-b03bf6f14d67",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test5_case2',
                 args: "-f "+INPUT4_PATH+" -blue ctrl monitor",
                 expected: "On receive ([34mCtrl[39m) - [34mmonitor[39mId: 3e5e8426-5891-4256-8bda-b03bf6f14d67",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test5_case3',
                 args: "-f "+INPUT4_PATH+" id -blue ctrl monitor",
                 expected: "On receive ([34mCtrl[39m) - [34mmonitor[39m[31mId[39m: 3e5e8426-5891-4256-8bda-b03bf6f14d67",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test5_case4',
                 args: "-f "+INPUT4_PATH+" id -blue ctrl monitor -cs receive",
                 expected: "On [31mreceive[39m (Ctrl) - [34mmonitor[39mId: 3e5e8426-5891-4256-8bda-b03bf6f14d67",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test5_case5',
                 args: "-f "+INPUT4_PATH+" Id Ctrl -blue ctrl monitor -cs receive 3e5",
                 expected: "On [31mreceive[39m ([31mCtrl[39m) - [34mmonitor[39m[31mId[39m: [31m3e5[39me8426-5891-4256-8bda-b03bf6f14d67",
                 shouldFail: false,
                 res: false
             },
             
             // TEST SET 6 - Default style '-s'
             {
                 name: 'test6_case1',
                 args: "-f "+INPUT4_PATH+" -s bold.bggreen ctrl",
                 shouldFail: false,
                 expected: "On receive ([1m[42m[31mCtrl[39m[49m[22m) - monitorId: 3e5e8426-5891-4256-8bda-b03bf6f14d67",
                 res: false
             },
             {
                 name: 'test6_case2',
                 args: "-f "+INPUT4_PATH+" -s bold.bGGreen ctrl -blue monitor",
                 expected: "On receive ([1m[42m[31mCtrl[39m[49m[22m) - [1m[42m[34mmonitor[39m[49m[22mId: 3e5e8426-5891-4256-8bda-b03bf6f14d67",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test6_case3',
                 args: "-f "+INPUT4_PATH+" -s bold.bGGreen ctrl -s bold.BGWHITE -blue monitor",
                 expected: "On receive ([1m[47m[31mCtrl[39m[49m[22m) - [1m[47m[34mmonitor[39m[49m[22mId: 3e5e8426-5891-4256-8bda-b03bf6f14d67",
                 shouldFail: false,
                 res: false
             },
             
             // TEST SET 7 - Presets
             {
                 name: 'test7_case1',
                 args: "-f "+INPUT4_PATH+" -p p1=bold -p p2=white -p2.p1 ctrl",
                 expected: "On receive ([37m[1mCtrl[22m[39m) - monitorId: 3e5e8426-5891-4256-8bda-b03bf6f14d67",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test7_case2',
                 args: "-f "+INPUT4_PATH+" -p p1=bold.green.bggreen -p p2=cyan -p2.p1 ctrl -p1 monitor -p2 id -p1.p2 receive",
                 expected: "On [1m[32m[42m[36mreceive[39m[49m[39m[22m ([36m[1m[32m[42mCtrl[49m[39m[22m[39m) - [1m[32m[42mmonitor[49m[39m[22m[36mId[39m: 3e5e8426-5891-4256-8bda-b03bf6f14d67",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test7_case3',
                 args: "-f "+INPUT4_PATH+" -p p1=bold.green.bggreen -p p2=cyan -p2.red.p1 ctrl -p1.red monitor -red.p2 id -p1.p2 receive",
                 expected: "On [1m[32m[42m[36mreceive[39m[49m[39m[22m ([36m[31m[1m[32m[42mCtrl[49m[39m[22m[39m[39m) - [1m[32m[42m[31mmonitor[39m[49m[39m[22m[31m[36mId[39m[39m: 3e5e8426-5891-4256-8bda-b03bf6f14d67",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test7_case4',
                 args: "-f "+INPUT4_PATH+" -p p1=bold.green.bggreen -p p1=x -p1 ctrl",
                 expected: "Preset value 'x' is not valid",
                 shouldFail: true,
                 res: false
             },
             {
                 name: 'test7_case5',
                 args: "-f "+INPUT4_PATH+" -p p1= -p p1=reds -p1 ctrl",
                 expected: "Preset 'p1=' is not defined correctly.",
                 shouldFail: true,
                 res: false
             },
             {
                 name: 'test7_case6',
                 args: "-f "+INPUT4_PATH+" -p aB=green -aB ctrl -ab monitor",
                 expected: "On receive ([32mCtrl[39m) - [32mmonitor[39mId: 3e5e8426-5891-4256-8bda-b03bf6f14d67",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test7_case7',
                 args: "-f "+INPUT4_PATH+" -p -a-B2_3x=green --a-B2_3x ctrl --A-b2_3x monitor",
                 expected: "On receive ([32mCtrl[39m) - [32mmonitor[39mId: 3e5e8426-5891-4256-8bda-b03bf6f14d67",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test7_case8',
                 args: "-f "+INPUT4_PATH+" -p a=blue -p a=green -a ctrl",
                 expected: "On receive ([32mCtrl[39m) - monitorId: 3e5e8426-5891-4256-8bda-b03bf6f14d67",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test7_case9',
                 args: "-f "+INPUT4_PATH+" -p blue=green -blue ctrl",
                 expected: "On receive ([32mCtrl[39m) - monitorId: 3e5e8426-5891-4256-8bda-b03bf6f14d67",
                 shouldFail: false,
                 res: false
             },
             {
                 name: 'test7_case10',
                 args: "-f "+INPUT4_PATH+" -p a=green.a -a ctrl",
                 expected: "Preset value 'green.a' is not valid.",
                 shouldFail: true,
                 res: false
             },
    ];

function escape(str){
    return str.replace("\r\n", "").replace("\n", "");
}

function test() {
    var t = tests[currentTest++];
    var args = stringArgv.parseArgsStringToArgv(t.args);
    var handler = new events.EventEmitter();
    
    var writer = new streams.WritableStream();
    
    var options = parseCmd(args, writer);
    
    setImmediate(function(){
        if(!options){
            handler.emit('failed');
            return;
        }
        highlight(options, writer, handler);
    });
    handler.on('finished', function(){
        var output = writer.toString();
        var expected = t.expected?t.expected:fs.readFileSync(__dirname + '/expected/' + t.name + '.txt', 'utf8').replace("\r\n|\n", "");
//        if (t.name == 'test7_case4') {
//          console.log(output);
//        }
        var res = t.shouldFail===false && escape(output) === escape(expected);
        t.res = res;
        nextTest();
    });
    handler.on('failed', function(){
        var output = writer.toString();
        var expected = t.expected?t.expected:fs.readFileSync(__dirname + '/expected/' + t.name + '.txt', 'utf8').replace("\r\n|\n", "");
        if (t.name == 'test3_case1') {
//          console.log(output);
        }
        var res = t.shouldFail===true && escape(output).indexOf(escape(expected))>-1;
        t.res = res;
        nextTest();
    });
}

function nextTest(){
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
