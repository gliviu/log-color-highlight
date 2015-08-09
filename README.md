log-color-highlight
==========
Node Js command line utility for highlighting log files.

![Demo](https://raw.githubusercontent.com/gliviu/log-color-highlight/master/sample.png)


## Installation
```shell
$ npm install log-color-highlight -g
```

## Usage
```
lch -f file -red error warn -green success

tail -f file | lch -red error warn -green success

```
Work in windows and unix environments.
Cygwin is not supported due to this terminal/console bug - https://github.com/joyent/node/issues/6459
On windows I use https://www.npmjs.com/package/file-tail as tail command - ``` nftail -f file | lch -red error warn -green success ```

## Options
```
  Usage: lch [options] Highlight pattern

  Options:
        -f filePath     Input file path. If this is not provided, 'stdin' is used.
        -c configPath   Path to configuration file. See Highlight pattern below.
        -s style        Implicit style. See Styles below for valid value.
        -cs             Case sensitive.
        -h --help       Prints this help message.

  Highlight pattern: [pattern1 pattern2 ...] [-color pattern1 pattern2 ...] ....
        pattern Regex pattern. If no color is specified, by default it is highlighted in Red.
        color   Highlighting color or style. Can be combined using dot. Allowed values:
                Colors: black red green yellow blue magenta cyan white gray
                Background colors: bgBlack bgRed bgGreen bgYellow bgBlue bgMagenta bgCyan bgWhite
                Styles: reset bold dim italic underline inverse hidden strikethrough

```

## Examples
* Highlight errors and warnings in default color ```lch -f file error warn```

* Specific colors ```echo "errors, failures and warnings" | lch -red err fail -yellow warn```

* Styles ```echo "log color highlight" | lch -red.bold log -blue.italic.underline highlight```

* Implicit style ```echo "implicit style" | lch -s bold -red implicit -red.reset style```

* Force case sensitive ```echo "case sensitive" | lch -cs sensitive CASE```

* Use regex ```echo "using regular expressions" | lch -green .*regular -blue exp.*```

* Later options take precedence over previous ones
``` echo "log color highlight" | lch -green "log color highlight" -blue "color" -red "lor hi" ```


## Test
```
cd log-color-highlight
npm install
npm test
```

