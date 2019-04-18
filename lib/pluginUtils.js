.pragma library

/*
	Return information about the current selection:
		startStaffIdx
		staves
		cursor
		ticks
		firstMeasure
		lastMeasure
		totalMeasures
*/
function selectionStat(score)
{
	const START = 1;
	const END = 2;

	let cursor = score.newCursor();
	cursor.rewind(START);
	let firstMeasure = cursor.measure;
	
	if (cursor.segment == null)
		throw new Error('Selection is required.');
	
	let startStaffIdx = cursor.staffIdx;

	cursor.rewind(END);
	let staves = cursor.staffIdx + 1;
	let ticks = (cursor.tick === 0) ? 
		score.lastSegment.tick + 1 : 
		cursor.tick;
	let lastMeasure = cursor.measure;

	// Count measures via difference
	let beginCount = 0;
	for (let curMeasure = firstMeasure; curMeasure != null; curMeasure = curMeasure.nextMeasure)
	{
		beginCount++;
	}

	let endCount = lastMeasure == null ? 0 : -1;
	for (let curMeasure = lastMeasure; curMeasure != null; curMeasure = curMeasure.nextMeasure)
	{
		endCount++;
	}	

	let remaining = beginCount - endCount;

	// Courtesy reset
	cursor.rewind(START);
	return (
	{
		startStaffIdx : startStaffIdx,
		staves : staves,
		cursor : cursor,
		ticks : ticks,
		firstMeasure : firstMeasure, 
		lastMeasure : lastMeasure,
		totalMeasures : remaining
	});
}

/*
	Print the key-value pair info on an object.
*/
function printMembers(object, preamble, maxDepth = 1)
{
	console.log('---' + preamble + '---');

	function recurse(object, curDepth)
	{
		if (curDepth > maxDepth)
			return;
		for (let key in object)
		{
			let value = object[key];
			console.log(`${'  '.repeat(curDepth - 1)}${key}: ${value}`);
			if (value != null && value.constructor.toString().startsWith('function Object()'))
			{
				recurse(value, curDepth + 1);
			}
		}
	}

	recurse(object, 1);
}

function freqToMidi(freq)
{
	return 12 * Math.log2(freq / 440) + 69;
}
