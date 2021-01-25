log-color-highlight
==========
Node Js command line utility for highlighting log files.

![Demo](https://raw.githubusercontent.com/gliviu/log-color-highlight/master/sample.png)


## Install
```shell
$ npm install log-color-highlight -g
```

## Usage

```bash
lch [options] -style1 regex1 [-style2 regex2] ...
```

## Options
```
-f filePath     Input file path.
                If this is not provided standard input is used
-c configPath   Path to configuration file.
-s style        Implicit style.
-cs             Case sensitive.
                By default text matching is done case insensitive.
-p              Add style/modifier preset.
-h --help       Prints this help message.
```

## Highlighting

Multiple styles may be combined using dot notation.

```bash
echo Information, warnings, errors | lch -green info -yellow.bold warn error failure
```

If no style is specified it defaults to red. This behavior may be altered with ```-s``` option which is mostly useful if specified in configuration files.

```bash
echo Some errors | lch error
```

## Styles

Colors: ```black, red, green, yellow, blue, magenta, cyan, white, gray```

Background colors: ```bgBlack, bgRed, bgGreen, bgYellow, bgBlue, bgMagenta, bgCyan, bgWhite```

Styling: ```reset, bold, dim, italic, underline, inverse, hidden, strikethrough```

## Modifiers

```cs``` Forces matches to be case sensitive..
```bash
echo Info, Warn | lch -green.cs info -yellow warn
```
```wl``` Highlights the whole line
```bash
echo highlight whole line | lch -green.wl whole -yellow light
```
```esc```  Escapes regex special characters
```bash
echo [error] ... [info] | lch -red.esc [error] -yellow "\[info\]"
```

## Presets

Define common style. Useful together with configuration files.

```bash
echo "[error] ... [info]" | lch -p err=red.bold -p inf=yellow.bold -err error -inf info
```

## Configuration file

Supports the same highlighting syntax as used from command line. In addition allows multiple lines and comments.

```bash
# Presets
-p failure=red.bold
-p success=green.bold

# Highlighting
-yellow.bold warn warning warnings deprecated

-success success successful successfully
-success "Operation.*completed"

-failure "Operation.*failed"
-failure err error errors erroneous
-failure wrong
-failure fail failure
```

```bash
echo Successful, warnings, errors | lch -c lch.conf
```

## Examples
Highlight 'error' and 'warn' in default color (red)
```bash
echo some errors and warnings | lch error warn
```

Styles
```bash
echo "log color highlight" | lch -red.bold log -blue.italic.underline highlight
```

Implicit style
```bash
echo "implicit style" | lch -s bold -red implicit -red.reset style
```

Force case sensitive globally
```bash
echo "case sensitive" | lch -cs sensitive CASE
```

Toggle case sensitivity per pattern using cs and ci modifiers

```bash
echo "case sensitive Case Sensitive" | lch -green.cs sensitive -red case
```

```bash
echo "case sensitive Case Sensitive" | lch -cs -green sensitive -red.ci.bold case
```

Regular expressions

```bash
echo "using regular expressions" | lch -green .*regular -blue exp.*
```

Escape regex special characters. Following examples are equivalent.

```bash
echo "[ERROR] On receive (ctrl) - monitorId" | lch -red.esc [error] -cyan.esc "receive (ctrl) - monitorId"
```

```bash
echo "[ERROR] On receive (ctrl) - monitorId" | lch -red \[error\] -cyan "receive \(ctrl\) - monitorId"
```

Later options take precedence over previous ones

```bash
echo "log color highlight" | lch -green "log color highlight" -blue "color" -red "lor hi"
```

Nested highlights

```bash
echo "log color highlight" | lch -blue "color" -red "log color"
```

## Test
```
cd log-color-highlight
npm install
npm test
```

## Changelog

```
1.4.0 whole line modifier
      updated cli help message/readme
1.3.0 config file is searched in user home folder or LCH_CONFIG env variable path
1.2.0 presets
1.1.1 regular expression escape modifier
1.1.0 case sensitivity modifiers
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
