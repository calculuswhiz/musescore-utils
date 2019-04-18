# musescore-utils
A collection of scripts and plugins for MuseScore 3

# Libraries
To use, simply import the library like so:

    import "lib/pluginUtils.js" as Util
    
In this example, this exposes the functions in the pluginUtils library under the Util namespace.

## pluginUtils.js
Has the following functions:

### `selectionStat(score)`
**Description:**
Get information about the current selection:

- startStaffIdx (Number)
- staves (Number)
- cursor (Cursor)
- ticks (Number)
- firstMeasure (Measure)
- lastMeasure (Measure)
- totalMeasures (Number)
    
A selection is required. No selection throws an Error.

**Args:**

- `score` (Score) - the score containing the selection. You can pass `curScore` to it.

**Return:**

- An object that contains the above information about the selection.

### `printMembers(object, preamble, maxDepth = 1)`
**Description:**

Print the key-value pairs on an object.

**Args:**

- `object` (Object) - the object to enumerate
- `preamble` (String) - the console will write this first. e.g. If preamble is `cursor`, it will write `---cursor---` first.
- `maxDepth = 1` (Number) - the depth of the enumeration (Be careful; this can get huge quickly!)

**Return:**

- Nothing

### `freqToMidi(freq)`
**Description:**

Converts a frequency to a midi pitch.

**Args:**

- `freq` (Number) - The frequency to convert

**Return:**

- The MIDI pitch. (Number)

## mscoreCmdParser.js
Utility to preprocess a script file. Backwards compatible for just a list of commands too, like in the musescore repository.

Calling `process` will return an array of commands. It does not check the validity of the commands. This is also does not make the language Turing complete. (But you can use the plugin to simulate that.) The purpose of this is to make scripting a little less cumbersome and make subroutines that are available to MuseScore plugin.

Valid commands can be found in the MuseScore source code (scoreview.cpp and cmd.cpp). I will also keep an abridged list in this repository.

### Script Syntax Guide
`.rep` (repeat commands):
Syntax:

    .rep X
        repeated
        repeated
    .endrep
    not-repeated

Unmatched reps will throw an error. Indentation is not necessary, and you can nest reps. Duplicates the commands in the block.

`.macro` (subroutine)
Syntax:

    .macro macroname
        commands...
    .endm
    [...]
    .insertm macroname
	
Saves a list of commands for later. You cannot nest .macro blocks.

**Substitution tokens**

These are tokens enclosed in `<>`'s. To use them, pass the token's key-value pair through `subMap`. This way you can pass arguments to the script. Undefined values will default to 1. For example, you can use `.rep <quarterNotes>...`. Any string should work.

**Comments**

Script comments start with `#`.

### Using the Preprocessor
This library exposes the function `process`:

### `process(program, subMap)`
Processes a script string, returning an array of commands that the plugin library can execute with the cmd() command.

**Args:**

- `program` (String) - The script to run (syntax description above).
- `subMap` (Object) - A dictionary to look up substitution tokens. E.g. `{quarterNote : 4}` will replace all instances of `<quarterNote>` with `4`. The value is always converted to a String.

**Return:**

An array of strings, each element of which is a command. They can be executed with a simple `forEach` like so:

    commands.forEach(command => void cmd(command));
