import type { BaseType, Selection } from 'd3-selection';
import { select } from 'd3-selection';

const LINE_HEIGHT = 1.1;

type TSpanState = {
  dy: number;
  lineNumber: number;
  y: string;
};

/**
 * Takes a list of selected elements and formats the text to fit within the given width and number of lines. This method will attempt to
 * break works and wrap multiple lines.
 *
 * NOTE: This method does not consider the height of the current text element due to limitations in detecting default font sizes and text height;
 *
 * @method formatTextForElements
 */
export const formatTextForElements = (
  selection: Selection<BaseType, unknown, SVGGElement, unknown>,
  maxWidth: number,
  maxLines = 2
) => {
  let shouldClearAll = false;

  selection.each(function () {
    shouldClearAll = shouldClearAll || !wrapLinesForElement(this, maxWidth, maxLines);
  });

  if (shouldClearAll) {
    selection.each(function () {
      select(this).text(null);
    });
  }
};

const createTSpan = (selection: Selection<BaseType, unknown, null, undefined>, state: TSpanState, text?: string) => {
  const element = selection
    .append('tspan')
    .attr('x', 0)
    .attr('y', state.y)
    .attr('dy', state.lineNumber * LINE_HEIGHT + state.dy + 'em');

  if (text?.length) element.text(text);

  return element;
};

/**
 * Compares the current elements computed text width against the max width available.
 *
 * @method isValidWidth
 */
const isValidWidth = (selection: Selection<any, unknown, null, undefined>, maxWidth: number) => {
  const selectedNode = selection.node();
  return selectedNode && selectedNode.getComputedTextLength() < maxWidth;
};

/**
 * Wraps the text of a given element into a series of tspan nodes. Will attempt to break and truncate the final words of the last line.
 *
 * Based on the work of THE Mike Bostock https://gist.github.com/mbostock/7555321
 *
 * @method wrapLinesForElement
 */
const wrapLinesForElement = (element: BaseType, maxWidth: number, maxLines: number) => {
  const selected = select(element);

  const allWords = selected.text().split(/\s+/);
  selected.text(null); // clear current text

  const y = selected.attr('y');
  const dy = parseFloat(selected.attr('dy'));

  let currentLine: string[] = [];
  let currentLineNumber = 0;
  let currentLineElement = createTSpan(selected, { y, dy, lineNumber: currentLineNumber });

  for (const i in allWords) {
    const word = allWords[i];

    currentLine.push(word);
    currentLineElement.text(currentLine.join(' '));

    if (isValidWidth(currentLineElement, maxWidth)) {
      continue;
    }

    if (parseInt(i) === 0) {
      breakWordForElement(currentLineElement, maxWidth, [], word);
      break;
    }

    currentLine.pop();
    currentLineElement.text(currentLine.join(' '));

    if (currentLineNumber + 1 > maxLines - 1) {
      const lastwords = [currentLine.pop(), word];
      breakWordForElement(currentLineElement, maxWidth, currentLine, lastwords.join(' '));
      break;
    }

    currentLineNumber++;
    currentLine = [word];
    currentLineElement = createTSpan(selected, { y, dy, lineNumber: currentLineNumber }, word);
  }

  return !!currentLineElement.text().length;
};

/**
 * Will attempt to append as much of the last words as possible to the current line. If no words are possible then clears the text for the current element.
 *
 * @method breakWordForElement
 */
const breakWordForElement = (
  selection: Selection<any, unknown, null, undefined>,
  maxWidth: number,
  words: string[],
  lastWords: string
) => {
  const currentLine = [...words];

  if (lastWords.length <= 3) {
    selection.text(currentLine + '...');
    return;
  }

  for (let i = 3; i < lastWords.length; i++) {
    currentLine.push(lastWords.substring(0, i + 1) + (i < lastWords.length - 1 ? '...' : ''));

    selection.text(currentLine.join(' '));

    currentLine.pop();

    if (!isValidWidth(selection, maxWidth)) {
      if (i === 3) {
        selection.text(null);
        return;
      }

      selection.text(currentLine + ' ' + lastWords.substring(0, i) + (i < lastWords.length - 1 ? '...' : ''));
      return;
    }
  }
};
