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

## Options
```
  Usage: lch [options] Highlight pattern

  Options:
        -f filePath     File to open. If this is not provided, content taken from pipe.
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
Highlight in default color - ```lch error,warn```

Force case sensitive - ```lch -cs ERROR,WARN```

Specify color - ```lch -red error -blue warn```

Add style - ```lch -red.bold error -blue.italic.underline warn```

Use regex - ```lch -green .*success.* ```


## Test
```
cd log-color-highlight
npm install
npm test
```

