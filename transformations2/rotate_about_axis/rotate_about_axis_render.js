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

//-------------------------------------------------------------------------
// Build, create, copy and render 3D objects specific to a particular
// model definition and particular WebGL shaders.
//-------------------------------------------------------------------------
var SceneRotateAboutAxis = function (learn, vshaders_dictionary,
                                fshaders_dictionary, models) {

  // Private variables
  var self = this;
  var canvas_id = learn.canvas_id;
  var out = learn.out;

  var gl = null;
  var program = null;
  var model_VOBs = {};

  var matrix = new Learn_webgl_matrix();
  var transform = matrix.create();
  var scale_matrix = matrix.create();
  matrix.scale(scale_matrix, 0.5, 0.5, 0.5);
  var rotate_x_matrix = matrix.create();
  var rotate_y_matrix = matrix.create();
  var rotate_axis_matrix = matrix.create();
  var translate_matrix = matrix.create();
  var projection = matrix.createOrthographic(-4.0, 4.0, -4.0, 4.0, -12.0, 12.0);

  var V = new Learn_webgl_vector3();
  var vector = V.create();
  var vector_y_rotate = matrix.create();
  var vector_z_rotate = matrix.create();
  var vector_x_rotate = matrix.create();
  var initial_axis_of_rotation = V.create(1, 0, 0);
  var axis_of_rotation = V.create(0, 0, 0);
  var scale_axis = matrix.create();
  matrix.scale(scale_axis, 2, 2, 2);

  var model_names = ["textz", "texty", "textx", "cubey", "cubex", "cubez", "cube_center"];
  var render_model = new Array(model_names.length);

  // Public variables that will possibly be used or changed by event handlers.
  self.canvas = null;
  self.angle_x = 0.0;
  self.angle_y = 0.0;
  self.tx = 0.0;
  self.ty = 0.0;
  self.tz = 0.0;
  self.angle = 0.0;
  self.axis_x_angle = 0.0;
  self.axis_y_angle = 0.0;
  self.axis_z_angle = 0.0;
  self.animate_active = false;

  //-----------------------------------------------------------------------
  this.render = function () {
    var j, name;

    // Clear the entire canvas window background with the clear color
    // out.display_info("Clearing the screen");
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Build individual transforms
    matrix.setIdentity(transform);
    matrix.translate(translate_matrix, self.tx, self.ty, self.tz);
    matrix.rotate(rotate_x_matrix, self.angle_x, 1, 0, 0);
    matrix.rotate(rotate_y_matrix, self.angle_y, 0, 1, 0);

    // Draw the axis of rotation
    matrix.rotate(vector_z_rotate, self.axis_z_angle, 0, 0, 1);
    matrix.rotate(vector_y_rotate, self.axis_y_angle, 0, 1, 0);
    matrix.rotate(vector_x_rotate, self.axis_x_angle, 1, 0, 0);
    matrix.setIdentity(transform);

    matrix.multiplySeries(transform, vector_z_rotate, vector_y_rotate);

    matrix.multiplyV3(axis_of_rotation, transform, initial_axis_of_rotation);

    matrix.multiplySeries(transform, projection, rotate_x_matrix, rotate_y_matrix,
        vector_x_rotate, vector_z_rotate, vector_y_rotate, scale_axis);

    render_model["vector"].render(transform);

    $("#axis_text").html("<strong>axis_of_rotation</strong>: <" + axis_of_rotation[0].toFixed(2)
      + ", " + axis_of_rotation[1].toFixed(2) + ", " + axis_of_rotation[2].toFixed(2) + ">;");

    // Combine the transforms into a single transformation
    matrix.rotate(rotate_axis_matrix, self.angle,
      axis_of_rotation[0], axis_of_rotation[1], axis_of_rotation[2]);

    matrix.multiplySeries(transform, projection, rotate_x_matrix, rotate_y_matrix,
      rotate_axis_matrix, translate_matrix);

    // Draw each model
    for (j = 0; j < model_names.length; j += 1) {
      name = model_names[j];
      render_model[name].render(transform);
    }

    // Draw the coordinate axes
    matrix.multiplySeries(transform, projection, rotate_x_matrix, rotate_y_matrix, scale_axis);
    render_model["xaxis"].render(transform);
    render_model["yaxis"].render(transform);
    render_model["zaxis"].render(transform);
  };

  //-----------------------------------------------------------------------
  this.delete = function () {
    var j;

    // Clean up shader programs
    gl.deleteShader(program.vShader);
    gl.deleteShader(program.fShader);
    gl.deleteProgram(program);

    // Delete each model's VOB
    model_names = Object.keys(model_VOBs);
    for (j = 0; j < model_names.length; j += 1) {
      render_model[model_names[j]].delete(gl);
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

  // Create Vertex Object Buffers for the models
  var j, name;
  for (j = 0; j < model_names.length; j += 1) {
    name = model_names[j];
    render_model[name] = new Learn_webgl_model_render_05(gl, program, models[name], out);
  }

  render_model["vector"] = new Learn_webgl_model_render_05(gl, program, models["vector"], out);

  render_model["xaxis"] = new Learn_webgl_model_render_05(gl, program, models["xaxis"], out);
  render_model["yaxis"] = new Learn_webgl_model_render_05(gl, program, models["yaxis"], out);
  render_model["zaxis"] = new Learn_webgl_model_render_05(gl, program, models["zaxis"], out);


  // Set up callbacks for user and timer events
  var events;
  events = new RotateAboutAxisEvents(self, controls);

  var id = '#' + canvas_id;
  $( id ).mousedown( events.mouse_drag_started );
  $( id ).mouseup( events.mouse_drag_ended );
  $( id ).mousemove( events.mouse_dragged );
};

