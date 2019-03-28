// webglcode.js - By: Dr. Wayne Brown, Fall 2015
// Description: functions to manipulate the webgl directive code

// Require all variables to be defined before they are used.
"use strict";

var $;

//=========================================================================
// Manipulate the webGl elements in the webGl directive:
//  - loads the editor windows from text files
//  - creates "codemirror" objects for each edit window
//  - creates variables to remember all of the key components of the webgl directive
//=========================================================================

var Webgl_directive = function (id) {

  var self = this;
  self.webgl_id = id;

  // textarea DOM objects that are the placeholders for the CodeMirror editor panes
  self.textareas = [];

  // CodeMirror objects for code editing
  self.file_names = [];
  self.code_mirrors = [];

  //-----------------------------------------------------------------------
  this.set_canvas_height = function(height) {
    if (height === 0) {
      var all_canvas3D = $('.canvas3D');
      var j= 0;
      for (j = 0; j< all_canvas3D.length; j += 1) {
        all_canvas3D[j].height = all_canvas3D[j].width;
      }
    } else {
      var all_canvas3D = $('.canvas3D');
      var j= 0;
      for (j = 0; j< all_canvas3D.length; j += 1) {
        all_canvas3D[j].height = height;
      }
    }
  };

  //-----------------------------------------------------------------------
  // Set the height of the webgl_editors div so that it is the same height
  // as the HTML page to its right.
  this.set_height_of_webgl_editors = function(id, height) {
    var tabs_height = $('.webgl_nav_tabs').height();
    if (height === 0) {

      // Make the editor windows the same height as the canvas area
      var right_pane = '#' + id + '_webgl_canvas';
      height = $(right_pane).height();
      //console.log("for webgl_code ", id, " height is ", height);

      var left_pane = '#' + id + '_webgl_editors';
      $(left_pane).height(height);
      $('#' + id + "_webgl_row2").height(height);

      // The height of the editor window must subtract the height of the tabs
      // There are possibly multiple CodeMirror panels. This sets the height of
      // all of them
      $(left_pane + ' .CodeMirror').height(height - tabs_height - 10);

    } else {
      // Set the panels to a specific height (not currently used)
      $('div.webgl_tab_content').height(height);
      $('.CodeMirror').height(height);
    }

  };

  //-----------------------------------------------------------------------
  self.bring_first_editor_to_front = function (id) {
    var list_id, tab_list_children, links;
    list_id = '#' + id + '_tab';
    tab_list_children = $(list_id).children();
    if (tab_list_children.length > 0) {
      links = $(tab_list_children[0]).children();
      if (links.length > 0) {
        $(links[0]).trigger("click");
      }
    }
  };

  //-----------------------------------------------------------------------
  // Load a data file. After it is loaded, the data is passed to the
  // appropriate codemirror HTML element.
  self.createCodeMirrorEditor = function (id, file_name, file_extension, read_only) {
    var search_id = "#" + id + "_textarea";
    var my_text_area = $(search_id)
    if (my_text_area) {
      var data = $(search_id).val();

      var editor_options = {
        lineNumbers: true,
        lineWrapping: false
      };
      //editor_options['CodeMirror-scroll'] = 'height: 750px; overflow: scroll;';
      editor_options['CodeMirror-scroll'] = 'overflow: scroll;';

      if (file_extension === 'js') {
        editor_options['mode'] = "javascript";
      } else if (file_extension === 'html' || file_extension === 'htm') {
        editor_options['mode'] = 'htmlmixed';
      } else if (file_extension === 'css') {
        editor_options['mode'] = 'css';
      } else if (file_extension === 'obj') {
        editor_options['mode'] = 'javascript';
      } else {
        editor_options['mode'] = "javascript";
      }

      if (arguments.length >= 3 && read_only) {
        editor_options['readOnly'] = true;
      }

      var myCodeMirror = CodeMirror.fromTextArea(my_text_area[0], editor_options);
      myCodeMirror.setValue(data);

      self.file_names.push(file_name);
      self.code_mirrors.push(myCodeMirror);
    }
  };

  //-----------------------------------------------------------------------
  function numLines(string) {
    var lines = string.split('\n');

    var j;
    var maxColumns = 0;
    for (j = 0; j < lines.length; j++) {
      if (lines[j].length > maxColumns) {
        maxColumns = lines[j].length;
      }
    }
    return [lines.length, maxColumns];
  }

  //-----------------------------------------------------------------------
  this.show_webgl = function (id, whichSection) {
    var myCheckboxId = '#' + id;
    var words = id.split('_');
    var myCodeId = '#' + words[0] + '_webgl_editors';
    var myCanvasId = '#' + words[0] + '_webgl_canvas';
    var myOutputId = '#' + words[0] + '_webgl_output';
    var myCodeCheckBox = '#' + words[0] + '_show_code';
    var myCanvasCheckBox = '#' + words[0] + '_show_canvas';

    if ($(myCheckboxId).prop('checked')) {
      // Checkbox was just checked - so show
      switch (whichSection) {
        case 1: // show code
          $(myCodeId).show();
          if ($(myCanvasId).is(':visible')) {
            $(myCodeId).css('width','50%');
            $(myCanvasId).css("width","50%");
          } else {
            $(myCodeId).css("width","100%");
          }
          break;
        case 2: // show canvas
          $(myCanvasId).show();
          if ($(myCodeId).is(':visible')) {
            $(myCodeId).css("width","50%");
            $(myCanvasId).css("width","50%");
          } else {
            $(myCanvasId).css("width","100%");
          }
          break;
        case 3: // show text output
          $(myOutputId).show();
          break;
      }
    } else {
      // Checkbox was unchecked - so hide
      switch (whichSection) {
        case 1: // hide code
          $(myCodeId).hide();
          $(myCanvasId).css("width","100%");
          $(myCanvasCheckBox).prop('checked', 'checked');
          $(myCanvasId).show();
          break;
        case 2: // hide canvas
          $(myCanvasId).hide();
          $(myCodeId).css("width","100%");
          $(myCodeCheckBox).prop('checked','checked');
          $(myCodeId).show();
          break;
        case 3:
          $(myOutputId).hide();
          break;
      }
    }
  }

  //-----------------------------------------------------------------------
  this.cleanupPreviousExecution = function () {
    if (typeof myCode === 'undefined') return;

    if (myCode.gl) {
      if (myCode.program) {
        // Delete the WebGL shader programs
        myCode.gl.deleteShader(myCode.program.vShader);
        myCode.gl.deleteShader(myCode.program.fShader);
        myCode.gl.deleteProgram(myCode.program);
        myCode.program = null;

        // Delete the model VOB's

      }
    }
  };

  //-----------------------------------------------------------------------
  this.execute = function () {
    // Execute the code in the javaScriptEdit window
    try {
      this.cleanupPreviousExecution();
      this.clearDisplayInfo();

      eval(this.jScriptCodeMirror.getValue());

    } catch (error) {
      console.log(error.stack);
      var parts = error.stack.split(':');
      var errorType = parts[0];
      var errorMessage = parts[1].substr(0, parts[1].indexOf('('));
      var subparts = errorMessage.split(' at ');
      errorMessage = subparts[0];
      var errorLocation = subparts[1];
      myPage.displayError("Error: " + errorType + ': "' + errorMessage + '" in ' + errorLocation);
    }
  };

  //-----------------------------------------------------------------------
  this.saveAll = function () {

    function escapeData(str) {
      return str
        .replace(/\n/g, '%0A')
        .replace(/ /g, '%20')
        .replace(/,/g, '%2C')
        .replace(/'/g, '%27')
        .replace(/"/g, '%22');
    }

    // Create an iframe to hold the content we want to save
    var id = Math.round(Math.random() * 1000000);
    id = 'id' + id.toString()
    //$('<div id="' + id + '" style="display:none">').appendTo('body');


    $.get("http://localhost/LearnWebGL/_static/LearnWebGL_Matrix.js",
      function (data) {
        console.log("adding data to div");
        console.log("data: '" + data + "'")
        data = escapeData(data);
        var link = '<a id=' + id + ' download="wayne2" href="data:application/octet-stream,' + data + '"><span>TEST2</span></a>'
        $(link).appendTo('body');

        // Create an action for the link
        $("#" + id).click(
          function () {
            console.log('link was clicked');
          }
        );

        // Make the action for the link's click execute
        $("#" + id + " span").trigger('click');

        // Remove the link. It's only purpose was to store the data for download
        $(link).remove();
      }
    );
  };

  //-----------------------------------------------------------------------
  /**
   * Download one file to the clients download folder.
   * @param url The URL to the file to download
   */
  self.downloadOneFile = function ( url ) {

    // Create a unique id for the link that will hold the data
    var id = Math.round(Math.random() * 1000000);
    id = 'id' + id.toString();

    // Create a link to the file. The download will make it save the
    // file to the client's disk.
    var link = '<a id="' + id + '" href="' + url + '" download><span>temp</span></a>';

    // Add the link element to the DOM body
    $(link).appendTo('body');

    // Make the link execute
    $("#" + id + " span").trigger('click');

    // Remove the link. It's only purpose was to set up the download
    $("#" + id).delay(5000).remove();
  };

  //-----------------------------------------------------------------------
  this.saveEditorData = function (data, fileName) {
    var my_blob = new Blob([data], {type: "text/plain" } );
    saveAs( my_blob, fileName );
  };

  //-----------------------------------------------------------------------
  //this.saveEditorData = function (data, fileName) {
  //
  //  function escapeData(str) {
  //    return str
  //      .replace(/\n/g, '%0A')
  //      .replace(/ /g, '%20')
  //      .replace(/,/g, '%2C')
  //      .replace(/'/g, '%27')
  //      .replace(/"/g, '%22');
  //  }
  //
  //  //var data = $('#' + textAreaID).text;
  //  data = escapeData(data);
  //
  //  var linkID = Math.round(Math.random() * 1000000);
  //  linkID = 'id' + linkID.toString()
  //  var link = '<a id=' + linkID + ' download="' + fileName + '" style="display:hidden;"' +
  //    ' href="data:application/octet-stream,' + data + '"><span>dummy</span></a>';
  //
  //  $(link).appendTo('body');
  //
  //  // Make the action for the link's click execute
  //  $("#" + linkID + " span").trigger('click');
  //
  //  // Remove the link. It's only purpose was to store the data for download
  //  $(link).delay(5000).remove();
  //};

  //-----------------------------------------------------------------------
  /**
   * Given a URL that is a relative reference, convert it to an absolute reference.
   * @param url
   * @returns String that contains an absolute URL to the resource.
   * @private
   */
  function _qualifyURL(url) {
     var el= document.createElement('div');
     el.innerHTML= '<a href="' + url + '">x</a>';
     return el.firstChild.href;
  }

  //-----------------------------------------------------------------------
  self.downloadAllFiles = function ( file_list, learn ) {
    // Any files in the editlist (codemirror editor) get saved instead
    // of the server files.
    var j, a_file, parts, full_name, editor_index;
    for (j = 0; j < file_list.length; j += 1) {
      a_file = file_list[j];

      // Convert a relative file reference to an absolute reference.
      if (a_file.slice(0,1) === '.') {
        a_file = _qualifyURL(a_file);
      }

      parts = learn.parseFilename(a_file);
      full_name = parts[1] + '.' + parts[2];

      editor_index = $.inArray(full_name, self.file_names);
      if (editor_index >= 0 ) {
        // download the text from the codemirror editor
        console.log("Saving editor file: ", a_file, editor_index);
        var data = self.code_mirrors[editor_index].getValue();
        self.saveEditorData(data, self.file_names[editor_index]);
      } else {
        // Download the file from the server.
        //console.log("downloading file: ", a_file);
        self.downloadOneFile( a_file );
      }
    }
  };

}; // end Webgl_directive
