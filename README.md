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
Works in windows and unix environments (cygwin not supported due to this terminal/console [bug](https://github.com/joyent/node/issues/6459))
On windows I use it together with [file-tail](https://www.npmjs.com/package/file-tail) - ``` nftail -f file | lch -red error warn -green success ```

## Options
```text
  Usage: lch [options] Highlight pattern

  Options:
        -f filePath     Input file path. If this is not provided, 'stdin' is used.
        -c configPath   Path to configuration file.
        -s style        Implicit style.
        -cs             Case sensitive. By default text matching is done case insensitive.
        -p              Add color or style preset.
        -h --help       Prints this help message.

  Highlight pattern: [pattern1 pattern2 ...] [-color pattern1 pattern2 ...] ....
        pattern Regex pattern. If no color is specified, by default it is highlighted in Red.
        color   Highlighting color, style, preset or modifier. Allowed values:
                Colors: black red green yellow blue magenta cyan white gray
                Background colors: bgBlack bgRed bgGreen bgYellow bgBlue bgMagenta bgCyan bgWhite
                Styles: reset bold dim italic underline inverse hidden strikethrough
                Presets: any preset defined with '-p' parameter
                Modifiers:
	                cs ci - toggle for case sensitivity
	                esc - escape regex special characters
  Presets: -p presetName=def -p presetName=def ...
  Preset name is formed by alphanumeric characters, dash and underscores.
  Preset definition follow the same rule as for 'Highlight pattern'.

```

## Examples
* Highlight 'error' and 'warn' in default color (red) ```lch -f file error warn```

* Specific colors ```echo "errors, failures and warnings" | lch -red err fail -yellow warn```

* Styles ```echo "log color highlight" | lch -red.bold log -blue.italic.underline highlight```

* Implicit style ```echo "implicit style" | lch -s bold -red implicit -red.reset style```

* Force case sensitive globally
```echo "case sensitive" | lch -cs sensitive CASE```

* Toggle case sensitivity per pattern using cs and ci modifiers

```echo "case sensitive Case Sensitive" | lch -green.cs sensitive -red case```

```echo "case sensitive Case Sensitive" | lch -cs -green sensitive -red.ci.bold case```

* Use regex ```echo "using regular expressions" | lch -green .*regular -blue exp.*```

* Escape regex special characters. Following examples are equivalent.

```echo "[ERROR] On receive (ctrl) - monitorId" | lch -red.esc [error] -cyan.esc "receive (ctrl) - monitorId" ```

```echo "[ERROR] On receive (ctrl) - monitorId" | lch -red \[error\] -cyan "receive \(ctrl\) - monitorId" ```

* Later options take precedence over previous ones

``` echo "log color highlight" | lch -green "log color highlight" -blue "color" -red "lor hi" ```

Supports nested highlights:

``` echo "log color highlight" | lch -blue "color" -red "log color" ```

## Configuration file syntax
Use configuration file for complex highlighting. The config file supports command line syntax - any command line parameter string is a valid config file. In addition it allows # as comments and blank line  or tabs as delimiters.

``` echo "2015-08-18 [ERROR] On receive (ctrl) - monitorId: 3e5e8426" | lch -c lch.conf ```


```bash
# lch.conf
# Success
-green.bold success successful successfully
-green.bold "Operation.*completed"

# Errors
-red.bold
	"Operation.*failed"
	err error errors erroneous
	wrong
	fail failure

# Warnings
-yellow.bold warn warning warnings deprecated
```
Produces the same result as 

``` echo "2015-08-18 [ERROR] On receive (ctrl) - monitorId: 3e5e8426" | lch -green.bold start starting success successfully -red.bold error errors erroneous wrong -yellow.bold warn warning deprecated```

## Presets
Presets are provided to reuse common coloring schemes.
They are most useful together with a configuration files.
```bash
-p err=red.bold
-p ok=green.bold
-p warn=yellow.bold

# Success
-ok success successful successfully
-ok.bgwhite "Operation.*completed"

# Errors
-err
	err error errors erroneous
	wrong
	fail failure
-err.bgwhite "Operation.*failed"

# Warnings
-warn warn warning warnings deprecated
```
``` echo "errors, failures and warnings" | lch -c lch.conf ```

Presets can be combined one with another or with any color, style or modifier.
``` echo "2015-08-18 [ERROR] On receive (ctrl) - monitorId: 3e5e8426" | lch -p p1=red.italic -p p2=bgwhite -p1.bold.p2 error -p2.blue ctrl ```

## Test
```bash
cd log-color-highlight
npm install
npm test
```

## Alternatives
Lch doesn't fit? Try one of the following.
* [colout](https://github.com/nojhan/colout/tree/master)
* [ccze](https://github.com/cornet/ccze)
* [colorize](https://github.com/raszi/colorize)
* `grep --color`
* [grc](http://korpus.juls.savba.sk/~garabik/software/grc.html)
* [colorex](https://bitbucket.org/linibou/colorex/wiki/Home)
* [lwatch](http://freecode.com/projects/lwatch)