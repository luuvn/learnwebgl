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
var SceneRotateAboutY = function (learn, vshaders_dictionary,
                                fshaders_dictionary, models, controls) {

    //---------------------------------------------------------------------
    // Public variables -- used or changed by event the handlers ----------
    var self = this;
    self.canvas = null;
    self.angle_x = 0.0;
    self.angle_y = 0.0;
    self.tx = 0.0;
    self.ty = 0.0;
    self.tz = 0.0;
    self.yangle = 0.0;
    self.animate_active = false;

    //-----------------------------------------------------------------------
    // Object constructor. One-time initialization of the scene.

    // Private variables
    var canvas_id = learn.canvas_id;
    var out = learn.out;

    var gl = null;
    var program = null;
    var render_model = {};

    var matrix = new Learn_webgl_matrix();
    var transform = matrix.create();
    var scale_matrix = matrix.create();
    matrix.scale(scale_matrix, 0.5, 0.5, 0.5);
    var view_Rx = matrix.create();
    var view_Ry = matrix.create();
    var model_Rz = matrix.create();
    var model_T = matrix.create();
    var ortho = matrix.createOrthographic(-2, +2, -2, +2, -4, +4);

    var model_names = ["textz", "texty", "textx", "cubey", "cubex", "cubez", "cube_center"];
    var axis_names = ["xaxis", "yaxis", "zaxis"];

    // Get the rendering context for the canvas
    self.canvas = learn.getCanvas(canvas_id);
    if (self.canvas) {
      gl = learn.getWebglContext(self.canvas);
    }
    if (!gl) {
      return;
    }

    // Set up the rendering program and set the state of webgl
    program = learn.createProgram(gl, vshaders_dictionary.shader05,
        fshaders_dictionary.shader05);

    gl.useProgram(program);

    gl.enable(gl.DEPTH_TEST);

    gl.clearColor(0.9, 0.9, 0.9, 1.0);

    // Create Buffer Objects for the models
    var j, name;
    for (j = 0; j < model_names.length; j += 1) {
      name = model_names[j];
      render_model[name] = new Learn_webgl_model_render_05(gl, program, models[name], out);
    }

    render_model["xaxis"] = new Learn_webgl_model_render_05(gl, program, models["xaxis"], out);
    render_model["yaxis"] = new Learn_webgl_model_render_05(gl, program, models["yaxis"], out);
    render_model["zaxis"] = new Learn_webgl_model_render_05(gl, program, models["zaxis"], out);

    // Set up callbacks for user and timer events
    var events;
    events = new RotateAboutYEvents(self, controls);

    var id = '#' + canvas_id;
    $(id).mousedown(events.mouse_drag_started);
    $(id).mouseup(events.mouse_drag_ended);
    $(id).mousemove(events.mouse_dragged);

    //-----------------------------------------------------------------------
    this.render = function () {
      var k, name;

      // Clear the entire canvas window background with the clear color
      // out.display_info("Clearing the screen");
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // Build individual transforms
      matrix.setIdentity(transform);
      matrix.rotate(view_Rx, self.angle_x, 1, 0, 0);
      matrix.rotate(view_Ry, self.angle_y, 0, 1, 0);

      matrix.translate(model_T, self.tx, self.ty, self.tz);
      matrix.rotate(model_Rz, self.yangle, 0, 1, 0);

      // Combine the transforms into a single transformation
      matrix.multiplySeries(transform, ortho, view_Rx, view_Ry, model_Rz, model_T, scale_matrix);
      //matrix.print("transform", transform);

      // Draw each model
      for (k = 0; k < model_names.length; k += 1) {
        name = model_names[k];
        render_model[name].render(transform);
      }

      matrix.multiplySeries(transform, ortho, view_Rx, view_Ry);
      render_model.xaxis.render(transform);
      render_model.yaxis.render(transform);
      render_model.zaxis.render(transform);
    };

    //-----------------------------------------------------------------------
    this.delete = function () {
      var k, model_names;

      // Clean up shader programs
      gl.deleteShader(program.vShader);
      gl.deleteShader(program.fShader);
      gl.deleteProgram(program);

      // Delete each model's Buffer Objects
      for (k = 0; k < model_names.length; k += 1) {
        name = model_names[k];
        render_model[name].delete();
      }

      render_model.xaxis.delete();
      render_model.yaxis.delete();
      render_model.zaxis.delete();

      // Remove all event handlers
      $(id).unbind("mousedown", events.mouse_drag_started);
      $(id).unbind("mouseup", events.mouse_drag_ended);
      $(id).unbind("mousemove", events.mouse_dragged);
      events.removeAllEventHandlers();

      // Disable any animation
      self.animate_active = false;
    };

  };

