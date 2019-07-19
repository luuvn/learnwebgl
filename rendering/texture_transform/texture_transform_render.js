/**
 * TextureTransformImageRender.js, By Wayne Brown, Spring 2016
 *
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
var console, Learn_webgl_matrix, Learn_webgl_matrix3;

//-------------------------------------------------------------------------
// Build, create, copy and render 3D objects specific to a particular
// model definition and particular WebGL shaders.
//-------------------------------------------------------------------------
window.TextureTransformImageRender = function (learn, vshaders_dictionary,
                                fshaders_dictionary, models, controls) {

  // Private variables
  var self = this;
  var canvas_id = learn.canvas_id;
  var out = learn.out;

  var gl = null;
  var program = null;
  var cube;

  var matrix = new window.Learn_webgl_matrix();
  var transform = matrix.create();
  var projection = matrix.createOrthographic(-2.0, 2.0, -2.0, 2.0, -4.0, 4.0);
  var rotate_x_matrix = matrix.create();
  var rotate_y_matrix = matrix.create();

  // Public variables that will possibly be used or changed by event handlers.
  self.canvas = null;
  self.angle_x = 0.0;
  self.angle_y = 0.0;
  self.animate_active = false;

  // Texture mapping transformations
  var mat3 = new window.Learn_webgl_matrix3();
  self.texture_dx = 0.0;
  self.texture_dy = 0.0;
  self.texture_sx = 1.0;
  self.texture_sy = 1.0;
  self.texture_angle = 0.0;
  var texture_transform = mat3.create();
  var texture_translate = mat3.create();
  var texture_scale = mat3.create();
  var texture_rotate = mat3.create();

  //-----------------------------------------------------------------------
  self.render = function () {

    // Clear the entire canvas window background with the clear color
    // out.display_info("Clearing the screen");
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Build individual transforms
    matrix.setIdentity(transform);
    matrix.rotate(rotate_x_matrix, self.angle_x, 1, 0, 0);
    matrix.rotate(rotate_y_matrix, self.angle_y, 0, 1, 0);

    // Combine the transforms into a single transformation
    matrix.multiplySeries(transform, projection, rotate_x_matrix, rotate_y_matrix);

    // Create the texture transform
    mat3.translate(texture_translate, self.texture_dx, self.texture_dy);
    mat3.rotate(texture_rotate, self.texture_angle);
    mat3.scale(texture_scale, self.texture_sx, self.texture_sy);
    mat3.multiplySeries(texture_transform, texture_translate, texture_rotate, texture_scale);

    // Draw each model
    cube.render(transform, texture_transform);
  };

  //-----------------------------------------------------------------------
  self.delete = function () {

    // Clean up shader programs
    gl.deleteShader(program.vShader);
    gl.deleteShader(program.fShader);
    gl.deleteProgram(program);
    program = null;

    // Delete each model's VOB
    cube.delete(gl);

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
    return;
  }

  // Set up the rendering program and set the state of webgl
  program = learn.createProgram(gl, vshaders_dictionary.shader37, fshaders_dictionary.shader30);

  gl.useProgram(program);

  gl.enable(gl.DEPTH_TEST);

  // Create Vertex Object Buffers for the models
  cube = new Learn_webgl_model_render_37(gl, program, models.cube, out);

  // Set up callbacks for user and timer events
  var events;
  events = new TextureTransformImageEvents(self, controls);
  events.animate();

  var id = '#' + canvas_id;
  $( id ).mousedown( events.mouse_drag_started );
  $( id ).mouseup( events.mouse_drag_ended );
  $( id ).mousemove( events.mouse_dragged );
};

