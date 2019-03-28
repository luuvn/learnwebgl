/**
 * learn_webgl_render_01.js, By Wayne Brown, Fall 2015
 *
 * Given
 *   - a model definition as defined in learn_webgl_model_01.js, and
 *   - specific shader programs: vShader01.vert, fShader01.frag
 * Perform the following tasks:
 *   1) Build appropriate Vertex Object Buffers (VOB's)
 *   2) Create GPU VOB's for the data and copy the data into the buffers.
 *   3) Render the VOB's
 */

/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 C. Wayne Brown
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use strict";

// Global definitions used in this code:
//var Float32Array, Uint16Array, parseInt, parseFloat, console;

//-------------------------------------------------------------------------
// Build, create, copy and render 3D objects specific to a particular
// model definition and particular WebGL shaders.
//-------------------------------------------------------------------------
var ModelRender01 = function (gl, program, model, out, controls) {

  // Variables to remember so the model can be rendered.
  var number_triangles = 0;
  var vertex_buffer_id = null;
  var color_buffer_id = null;
  var a_Vertex = null;
  var a_Color = null;

  // Temporary arrays to build the vertex object buffers in the GPU.
  var vertices3 = null; // Float32Array; (x,y,z) for each triangle vertex
  var colors4 = null; // Float32Array; 4 values per vertex

  //-----------------------------------------------------------------------
  function _buildVobBuffers() {
    var j, k, m, nv, nc, numberVertices, triangle, triangle_color, vertex;

    number_triangles = model.triangle_list.length;
    numberVertices = number_triangles * 3;
    vertices3 = new Float32Array(numberVertices * 3);
    colors4 = new Float32Array(numberVertices * 4);

    nv = 0;
    nc = 0;
    for (j = 0; j < model.triangle_list.length; j += 1) {
      triangle = model.triangle_list[j];
      triangle_color = triangle.material.Kd;
      for (k = 0; k < 3; k += 1) {
        vertex = triangle.vertices[k];
        for (m = 0; m < 3; m += 1, nv += 1) {
          vertices3[nv] = vertex[m];
        }
        for (m = 0; m < 4; m += 1, nc += 1) {
          colors4[nc] = triangle_color[m];
        }
      }
    }
  }

  //-----------------------------------------------------------------------
  function _createGpuVob(gl, data) {
    // Create a buffer object
    var buffer_id;

    buffer_id = gl.createBuffer();
    if (!buffer_id) {
      out.displayError('Failed to create the buffer object for ' + model.name);
      return null;
    }

    // Make the buffer object the active buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer_id);

    // Upload the data for this buffer object to the GPU.
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    return buffer_id;
  }

  //-----------------------------------------------------------------------
  function _getLocationOfShaderVariables() {
    // Get the location of the shader variables
    a_Vertex = gl.getAttribLocation(program, 'a_Vertex');
    a_Color = gl.getAttribLocation(program, 'a_Color');
  };

  //-----------------------------------------------------------------------
  // These one-time tasks set up the rendering of the models.
  _buildVobBuffers();
  vertex_buffer_id = _createGpuVob(gl, vertices3);
  color_buffer_id = _createGpuVob(gl, colors4);
  _getLocationOfShaderVariables();

  // Release the memory used by these temporary arrays. (The data is
  // now stored in the GPU and is no longer needed in RAM.)
  vertices3 = null;
  colors4 = null;

  //-----------------------------------------------------------------------
  this.delete = function (gl) {
    gl.deleteBuffer(vertex_buffer_id);
    gl.deleteBuffer(color_buffer_id);
  };

  //-----------------------------------------------------------------------
  this.render = function (gl, transform_location, transform) {

    // Activate the model's vertex object buffer (VOB)
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer_id);

    // Bind the vertices VOB to the 'a_Vertex' shader variable
    //var stride = self.vertices3[0].BYTES_PER_ELEMENT*3;
    gl.vertexAttribPointer(a_Vertex, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Vertex);

    // Activate the model's color object buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer_id);

    // Bind the colors VOB to the 'a_Color' shader variable
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color);

    // Set the transform for all the faces
    gl.uniformMatrix4fv(transform_location, false, transform);

    // Draw all of the triangles
    gl.drawArrays(gl.TRIANGLES, 0, number_triangles * 3);
  };

};

//-------------------------------------------------------------------------
// Build, create, copy and render 3D objects specific to a particular
// model definition and particular WebGL shaders.
//-------------------------------------------------------------------------
var Scene_render_01 = function (learn, vshaders_dictionary,
                                fshaders_dictionary, models) {

  var locations = [ [ 0.5,  0.5,  0.5],
                    [ 0.5, -0.5,  0.5],
                    [-0.5,  0.5,  0.5],
                    [-0.5, -0.5,  0.5],
                    [ 0.5,  0.5, -0.5],
                    [ 0.5, -0.5, -0.5],
                    [-0.5,  0.5, -0.5],
                    [-0.5, -0.5, -0.5]
                  ];
  //-----------------------------------------------------------------------
  this.render = function () {
    var j, model_names;

    // Clear the entire canvas window background with the clear color
    // out.display_info("Clearing the screen");
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Build individual transforms
    var s = self.scale * 0.5;
    matrix.scale(scale_matrix, s, s, s);
    matrix.rotate(rotate_x_matrix, self.angle_x, 1, 0, 0);
    matrix.rotate(rotate_y_matrix, self.angle_y, 0, 1, 0);
    var k=0;
    for (k=0; k<8; k+= 1) {
      var loc = locations[k];
      matrix.translate(translate_matrix, loc[0], loc[1], loc[2]);

      // Combine the transforms into a single transformation
      matrix.setIdentity(transform);
      matrix.multiplySeries(transform, transform, rotate_x_matrix, rotate_y_matrix,
          scale_matrix, translate_matrix);
      //matrix.print("transform", transform);

      // Draw each model
      model_names = Object.keys(model_VOBs);
      for (j = 0; j < model_names.length; j += 1) {
        model_VOBs[model_names[j]].render(gl, transform_location, transform);
      }
    }
  };

  //-----------------------------------------------------------------------
  this.delete = function () {
    var j, model_names;

    // Clean up shader programs
    gl.deleteShader(program.vShader);
    gl.deleteShader(program.fShader);
    gl.deleteProgram(program);

    // Delete each model's VOB
    model_names = Object.keys(model_VOBs);
    for (j = 0; j < model_names.length; j += 1) {
      model_VOBs[model_names[j]].delete(gl);
    }

    // Remove all event handlers
    var id = '#' + canvas_id;
    $( id ).unbind( "mousedown", events.mouse_drag_started );
    $( id ).unbind( "mouseup", events.mouse_drag_ended );
    $( id ).unbind( "mousemove", events.mouse_dragged );
    events.removeAllEventHandlers();

    // Disable any animation
    self.animate_active = false;
  };

  //-----------------------------------------------------------------------
  // Object constructor. One-time initialization of the scene.

  // Private variables
  var self = this;
  var canvas_id = learn.canvas_id;
  var out = learn.out;

  var gl = null;
  var program = null;
  var model_VOBs = {};

  var matrix = new Learn_webgl_matrix();
  var transform = matrix.create();
  var transform_location = 0;
  var rotate_x_matrix = matrix.create();
  var rotate_y_matrix = matrix.create();
  var scale_matrix = matrix.create();
  var translate_matrix = matrix.create();

  // Public variables that will possibly be used or changed by event handlers.
  self.canvas = null;
  self.angle_x = 0.0;
  self.angle_y = 0.0;
  self.scale = 1.0;
  self.animate_active = true;

  // Get the rendering context for the canvas
  self.canvas = learn.getCanvas(canvas_id);
  if (self.canvas) {
    gl = learn.getWebglContext(self.canvas);
  }
  if (!gl) {
    return null;
  }

  // Set up the rendering program and set the state of webgl
  program = learn.createProgram(gl, vshaders_dictionary["shader05"], fshaders_dictionary["shader05"]);

  gl.useProgram(program);

  gl.enable(gl.DEPTH_TEST);

  gl.clearColor(0.9, 0.9, 0.9, 1.0);

  transform_location = gl.getUniformLocation(program, "u_Transform");

  // Create Vertex Object Buffers for the models
  var j, key_list;
  key_list = Object.keys(models);
  for (j = 0; j < key_list.length; j += 1) {
    model_VOBs[key_list[j]] = new ModelRender01(gl, program, models[key_list[j]], out);
  }

  // Set up callbacks for user and timer events
  var events;
  events = new ScaleAwayFromOriginEvents(self, controls);
  events.animate();

  var id = '#' + canvas_id;
  $( id ).mousedown( events.mouse_drag_started );
  $( id ).mouseup( events.mouse_drag_ended );
  $( id ).mousemove( events.mouse_dragged );
};

