// matrixeq.js - By: Dr. Wayne Brown, Fall 2015
// Description: functions to manipulate matrices on a web page

// Require all variables to be defined before they are used.
"use strict";

//=========================================================================
// Manipulate the webGl elements in the webGl directive:
//  - loads the editor windows from text files
//  - creates "codemirror" objects for each edit window
//  - creates variables to remember all of the key components of the webgl directive
//=========================================================================

function Matrixeq_directive(element, action) {

  //-----------------------------------------------------------------------
  function _getMatrix(theSpan) {
    var columns, r, c, column_text, text, rows, row, number_rows;
    var element, matrix, value, value_text, input_box;

    // The matrix is organized by columns
    columns = theSpan.children;

    number_rows = columns[0].children.length;

    // Create an empty matrix that has the correct number of rows
    matrix = [];
    for (r = 0; r < number_rows; r += 1) {
      row = [];
      matrix.push(row);
    }

    for (c = 0; c < columns.length; c += 1) {
      rows = columns[c].children;

      for (r = 0; r < rows.length; r += 1) {
        element = rows[r];
        text = element.innerHTML;

        if (text.substring(0, 6) === '<input') {
          input_box = element.children;
          value_text = input_box[0].value;
        } else {
          text = text.replace('<br>', '');
          value_text = text;
        }

        // Reduce numbers to their least digit format
        value = Number(value_text);
        if (isNaN(value)) {
          value = value_text;
        } else {
          value_text = value.toString();
        }

        // If there is a HTML <sup>, replace with exponential operator
        value_text = value_text.replace(/<sup>(.*?)<\/sup>/g, "^($1)");

        matrix[r].push(value_text);
      }
    }

    return matrix;
  }

  //-----------------------------------------------------------------------
  function _createTerm(v) {

    v = v.trim();

    if (v.charAt(0) !== '[' || v.charAt(v.length - 1) !== ']') {
      if (v.indexOf('+') >= 0) {
        v = '[' + v + ']';
      }
    }
    return v;
  }

  //-----------------------------------------------------------------------
  function _matrixMultiply(m1, m2) {
    var r1, c1, r2, c2, r, c, value, value_text, j, v1, v2, n1, n2, row, num_numbers;

    r1 = m1.length;
    c1 = m1[0].length;
    r2 = m2.length;
    c2 = m2[0].length;

    var result = [];
    for (r = 0; r < r1; r += 1) {
      row = [];
      for (c = 0; c < c2; c += 1) {
        value = 0;
        value_text = "";
        num_numbers = 0;
        for (j = 0; j < c1; j += 1) {
          v1 = m1[r][j];
          v2 = m2[j][c];
          value_text += _createTerm(v1) + '*' + _createTerm(v2);
          if (j < c1 - 1) {
            value_text += " + ";
          }
        }
        if (num_numbers === c1) {
          row.push(value);
        } else {
          row.push(value_text);
        }
      }
      result.push(row);
    }

    return result;
  }

  //-----------------------------------------------------------------------
  function _buildHTMLmatrix(m, id1, id2) {
    var str, nRows, nCols, r, c, id, randomInt;

    // Build the HTML for the matrix
    randomInt = parseInt(Math.random() * 10000);
    id = "M" + randomInt.toString();

    str = '<span id="' + id + '" class="matrixtable"> <!-- ' + id1 + '*' + id2 + ' -->';

    nRows = m.length;
    nCols = m[0].length;

    // Create the HTML code for the matrix
    for (c = 0; c < nCols; c += 1) {
      str += '<span class="vector">'; // start column

      for (r = 0; r < nRows; r += 1) {
        str += '<span onmouseover="Matrixeq_show(this, true);" onmouseleave="Matrixeq_show(this, false);")>' + m[r][c] + '<br /></span>';
      }

      str += '</span>'; // ends "vector"
    }
    str += '</span>'; // ends "matrixtable"

    // Replace all ^(-1) text values with a superscript HTML tag
    str = str.replaceAll('^(-1)', '<sup>-1</sup>');

    return str;
  }

  //-----------------------------------------------------------------------
  function _multiply() {
    var equation, m1, m2, M1, M2, result, result_element;
    var j, children, num_children, new_equation, randomInt, next_element,
      matches;

    equation = element.parentNode;
    m1 = element.previousSibling;
    m2 = element.nextSibling;

    M1 = _getMatrix(m1);
    M2 = _getMatrix(m2);

    result = _matrixMultiply(M1, M2);

    result_element = _buildHTMLmatrix(result, $(m1).attr('id'), $(m2).attr('id'));

    // Combine the original equation, replacing the two matrices with the result
    new_equation = "<!-- matrixeq start -->\n"
    new_equation += "<div class='matrixeq_container'>\n";

    children = $(equation).children();
    num_children = children.size();
    j = 0;
    while (j < num_children) {
      if (j < num_children - 2
        && children[j] == m1 && children[j + 2] == m2) {
          new_equation += result_element;
          j += 2;
      } else {
        next_element = children[j].outerHTML;
        matches = next_element.match(/id="(.*?)"/);
        if (matches) {
          next_element = next_element.replace(matches[1], matches[1] + j.toString());
        }
        new_equation += next_element;
        if ($(next_element).attr("class") === 'label') {
          // Don't copy the buttons into this matrix equation
          break;
        }
      }
      j += 1;
    }

    // Add 2 buttons to the end
    new_equation += "<span class='vector'>";
    new_equation += "<button onclick='Matrixeq_directive(this, \"reduce\");'>-</button>&nbsp";
    new_equation += "<button onclick='Matrixeq_directive(this, \"delete\");'>X</button>";
    new_equation += "</span>";

    new_equation += "</div>\n";

    $(new_equation).insertAfter(equation);
  }

  //-----------------------------------------------------------------------
  // Calculate the entire left and right side of the equation.
  function _assignment() {
    var equation, M2, result, result_element, op, op_type;
    var j, children, num_children, new_equation, matrix_element;

    equation = element.parentNode;
    children = $(equation).children();
    num_children = children.size();

    // Make sure we have at least two matrices and one operator
    if (num_children < 3) {
      return;
    }

    // Create a new equation with all calculations performed.
    new_equation = "<!-- matrixeq start -->\n"
    new_equation += "<div class='matrixeq_container'>\n";

    result = _getMatrix(children[0]);
    j = 1;
    while (j < num_children - 2) {
      op = children[j];
      if ($(op).attr('class') === 'operator') {

        op_type = op.innerText.trim();
        if (op_type === '*') {
          if ($(children[j + 1]).attr('class') === 'matrixtable') {
            M2 = _getMatrix(children[j + 1]);
            result = _matrixMultiply(result, M2);
            // reduce the result to its simplest form
            result_element = _buildHTMLmatrix(result, '-', '-');
            matrix_element = $.parseHTML(result_element);
            _reduceMatrixTerms(matrix_element[0]);
            result = _getMatrix(matrix_element[0]);
            j = j + 1;
          }
        } else if (op_type === '=' || op_type === '!=') {
          result_element = _buildHTMLmatrix(result, '-', '-');
          new_equation += result_element;
          new_equation += children[j].outerHTML // = sign
          result = _getMatrix(children[j + 1]);   // matrix after the = sign
        }
      }
      j = j + 1;

      if ($(children[j]).attr("class") === 'label') {
        // Don't copy the buttons into this matrix equation
        break;
      }
    }

    // Add the last result to the equation
    result_element = _buildHTMLmatrix(result, '-', '-');
    new_equation += result_element;

    // Add delete button to the end
    new_equation += "<span class='vector'>";
    new_equation += "<button onclick='Matrixeq_directive(this, \"delete\");'>X</button>";
    new_equation += "</span>";

    new_equation += "</div>\n";

    $(new_equation).insertAfter(equation);
  }

  //-----------------------------------------------------------------------
  function _reduceTerm(t) {
    var eq, start, end, j, nested, parts, new_term, terms, new_t,
      all_numbers, sum, v1, place_holders, n_holders, symbols, values,
      product;

    // If the string contains [] then put place holders where the embedded
    // terms are so that no sub-terms will have +'s in them.
    place_holders = [];
    n_holders = 0;
    eq = t;
    start = eq.indexOf('[');
    while (start > 0) {
      end = -1;
      j = start + 1;
      nested = 0;
      while (j < eq.length) {
        if (eq.charAt(j) === '[') {
          nested += 1;
        } else if (eq.charAt(j) === ']') {
          if (nested === 0) {
            end = j;
            break;
          }
          nested -= 1;
        }
        j += 1;
      }
      if (end === -1) {
        // We could not find the matching ] so exit and leave the string unchanged
        return t;
      }
      new_term = _reduceTerm(eq.substring(start + 1, end));
      if (new_term.indexOf('+') >= 0) {
        new_term = '[' + new_term + ']';
        place_holders.push(new_term);
        new_term = 'x' + n_holders.toString() + 'x';
        n_holders += 1;
      }
      eq = eq.substring(0, start) + new_term + eq.substring(end + 1);
      console.log('after term replacement: ', eq);
      start = eq.indexOf('[');
    }

    // The above logic removed all embedded '+' signs. Split into terms.
    parts = eq.split('+');
    if (parts.length > 1) {
      // This is a series of values added together.
      // Separate the elements into symbol and numeric values.
      symbols = [];
      values = [];
      for (j = 0; j < parts.length; j += 1) {
        parts[j] = _reduceTerm(parts[j].trim());
        v1 = Number(parts[j]);
        if (isNaN(v1)) {
          symbols.push(parts[j]);
        } else {
          values.push(v1);
        }
      }

      // Add all the values.
      sum = 0;
      for (j = 0; j < values.length; j += 1) {
        sum += values[j];
      }

      if (symbols.length === 0) {
        eq = sum.toString();
      } else {
        eq = '';
        for (j = 0; j < symbols.length; j += 1) {
          if (eq.length > 0) {
            eq += ' + ';
          }
          eq += symbols[j];
        }
        if (sum !== 0) {
          if (eq.length > 0) {
            eq += ' + ';
          }
          eq += sum.toString();
        }
      }
    } else {
      // This is a single term. Evaluate it and return its value.
      parts = eq.split('*');
      if (parts.length > 1) {
        // This is a series of values multiplied together.
        // Separate the elements into symbol and numeric values
        symbols = [];
        values = [];
        for (j = 0; j < parts.length; j += 1) {
          parts[j] = parts[j].trim();
          v1 = Number(parts[j]);
          if (isNaN(v1)) {
            symbols.push(parts[j]);
          } else {
            values.push(v1);
          }
        }

        // Multiply all the values.
        product = 1;
        for (j = 0; j < values.length; j += 1) {
          product *= values[j];
        }

        if (product === 0) {
          eq = '';
        } else {
          if (symbols.length === 0) {
            eq = product.toString();
          } else {
            eq = '';
            if (product !== 1) {
              eq += product.toString();
            }
            for (j = 0; j < symbols.length; j += 1) {
              if (eq.length > 0) {
                eq += '*';
              }
              eq += symbols[j];
            }
          }
        }
      } else {
        // This is a single value. Evaluate and return its value.
        eq = eq.trim();
      }
    }

    // Replace all of the place holders with their original terms
    for (j = 0; j < n_holders; j += 1) {
      eq = eq.replace('x' + j.toString() + 'x', place_holders[j]);
    }

    console.log("reduced '", t, "' to '", eq, "'");

    return eq;
  }

  //-----------------------------------------------------------------------
  // m is an HTML element that contains a matrix
  function _reduceMatrixTerms(m) {
    var columns, c, row, r, new_text;

    columns = $(m).children();
    for (c = 0; c < columns.size(); c += 1) {
      row = $(columns[c]).children();
      for (r = 0; r < row.size(); r += 1) {
        new_text = _reduceTerm($(row[r]).text());
        //console.log('reduce: ', $(row[r]).text(), ' to ', new_text);
        if (r < row.size() - 1) {
          new_text += "<br>";
        }
        $(row[r]).html(new_text);
      }
    }
  }

  //-----------------------------------------------------------------------
  function _reduceTerms() {
    var span, equation, children, num_children, j;

    span = element.parentNode;
    equation = span.parentNode;

    children = $(equation).children();
    num_children = children.size();
    for (j = 0; j < num_children; j += 1) {
      if ($(children[j]).attr("class") === "matrixtable") {
        _reduceMatrixTerms(children[j]);
      }
    }
  }

  //-----------------------------------------------------------------------
  function _deleteEquation() {
    var span, equation;

    span = element.parentNode;
    equation = span.parentNode;
    $(equation).remove();
  }

  //-----------------------------------------------------------------------
  // console.log(element);

  if (action === undefined) {
    var operator = element.innerText.trim();

    if (operator === '*') {
      _multiply();
    } else if (operator === '=' || operator === '!=') {
      _assignment();
    }
  } else {
    if (action === "reduce") {
      _reduceTerms();
      $(element).remove(); // the reduce button
    } else if (action === "delete") {
      _deleteEquation();
    }
  }
} // end Matrixeq_directive

//=========================================================================
function Matrixeq_show(element, highlight) {

  // Determine which row the element is on
  var j, r, c, column, column_children, all_columns, equation, content, matches;
  var id1, id2, all_columns1, all_columns2, rows;

  r = -1;
  column = element.parentNode;
  column_children = column.children;
  for (j = 0; j < column_children.length; j += 1) {
    if (column_children[j] == element) {
      r = j;
      break;
    }
  }

  c = -1;
  equation = column.parentNode;
  all_columns = equation.children;
  for (j = 0; j < all_columns.length; j += 1) {
    if (all_columns[j] == column) {
      c = j;
      break;
    }
  }

  // Get the two original matrices that were multiplies for this matrix
  content = $(equation).html();
  matches = content.match(/<!-- (.*?)\*(.*?) -->/);
  id1 = matches[1];  // highlight row
  id2 = matches[2];  // highlight column

  all_columns1 = $('#' + id1).children();
  all_columns2 = $('#' + id2).children();

  if (highlight) {
    for (j = 0; j < all_columns1.size(); j += 1) {
      rows = $(all_columns1[j]).children();
      $(rows[r]).css("background-color", "LightBlue");
    }
    $(all_columns2[c]).css("background-color", "LightBlue");
  } else {
    for (j = 0; j < all_columns1.size(); j += 1) {
      rows = $(all_columns1[j]).children();
      $(rows[r]).css("background-color", "#fcf8e3");
    }
    $(all_columns2[c]).css("background-color", "#fcf8e3");
  }

}

