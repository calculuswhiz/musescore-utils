.pragma library 
/* 
	Preprocess a script file. Backwards compatible for just a list of commands too, like in the musescore repository.
	Calling process will return an array of commands. It does not check the validity of the commands.
	This is also does not make the language Turing complete. (But you can use the plugin to simulate that.) The purpose of this is to make scripting a little less cumbersome and make subroutines that are available to MuseScore plugin.
	Valid commands can be found in the MuseScore source code (scoreview.cpp and cmd.cpp).
	
	# Rep (repeat commands):
	Syntax:
		.rep X
			repeated
			repeated
		.endrep
		not-repeated

	Unmatched reps will throw an error. Indentation is not necessary, and you can nest reps.
	Duplicates the commands in the block.

	# Macro (subroutine)
	Syntax:
		.macro macroname
			commands...
		.endm
		[...]
		.insertm macroname
	
	Saves a list of commands for later. You cannot nest .macro blocks.

	# Substitution tokens
	These are tokens enclosed in <>'s.
	To use them, pass the token's key-value pair through subMap. This way you can pass arguments to the script.
	Undefined values will default to 1. For example, you can use `.rep <quarterNotes>...`. Any string should work.

	#Comments
	Script comments start with #
*/
function process(program, subMap)
{
	const invalidStartTokens = new Set();
	invalidStartTokens.add('.endm');
	invalidStartTokens.add('.endrep');

	let macroMap = {};

	function parseEngine(list)
	{
		let head = 0;
		let listing = [];
		while (head < list.length)
		{
			let line = list[head];
			if (line.startsWith('.rep '))
			{
				// Repeater definition
				let reps = Number(line.match(/\.rep (\d+)/)[1]);
				let lookAhead = head + 1;
				let balance = 1;

				while (lookAhead < list.length && balance !== 0)
				{
					if (list[lookAhead].startsWith('.rep'))
						balance++;
					else if (list[lookAhead] === '.endrep')
						balance--;
					lookAhead++;
				}
				if (balance !== 0)
					throw new Error('Unmatched .rep token!');

				let subsection = list.slice(head + 1, lookAhead - 1);
				let expanded = parseEngine(subsection);
				for (let i = 0; i < reps; i++)
				{
					listing = listing.concat(expanded);
				}
				head = lookAhead;
			}
			else if (line.startsWith('.macro '))
			{
				// Macro definition
				let macroName = line.match(/\.macro ([_\w][_\w\d]*)/)[1];
				let lookAhead = head + 1;
				let foundEnd = false;

				while (lookAhead < list.length)
				{
					if (list[lookAhead] === '.endm')
					{
						foundEnd = true;
						lookAhead++;
						break;
					}
					else if (list[lookAhead].startsWith('.macro'))
					{
						throw new Error('You cannot nest .macro\'s!');
					}
					lookAhead++;
				}
				if (!foundEnd)
					throw new Error('Unterminated .macro!');

				let subsection = list.slice(head + 1, lookAhead - 1);
				let expanded = parseEngine(subsection);
				macroMap[macroName] = expanded;
				head = lookAhead;
			}
			else if (line.startsWith('.insertm '))
			{
				// Insert Macro
				let macroName = line.match(/\.insertm ([_\w][_\w\d]*)/)[1];
				listing = listing.concat(macroMap[macroName]);
				head++;
			}
			else if (invalidStartTokens.has(line))
			{
				throw new Error(`Invalid start token: ${line}`);
			}
			else
			{
				listing.push(line);
				head++;
			}
		}

		return listing;
	}

	let tokenized = program.split('\n');
	let sanitized = tokenized
		.map(function (token, index)
		{
			// Substitute:
			let subTokenExp = /<([_\w][_\w\d]*?)>/;
			let matched;
			while (matched = token.match(subTokenExp))
			{
				token = token.replace(subTokenExp, subMap[matched[1]] || 1);
			}

			// Scrape out comments:
			token = token.replace(/#.*$/, '');

			// Remove surrounding whitespace:
			return token.trim();
		})
		// Remove blank lines:
		.filter(el => (el !== ''));

	return parseEngine(sanitized);
}
