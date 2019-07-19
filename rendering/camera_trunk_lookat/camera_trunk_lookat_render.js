/**
 * learn_webgl_lookat_render.js, By Wayne Brown, Spring 2016
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
var Learn_webgl_matrix, Learn_webgl_vector3, Learn_webgl_point3, LookAtCamera;

//-------------------------------------------------------------------------
// Build, create, copy and render 3D objects specific to a particular
// model definition and particular WebGL shaders.
//-------------------------------------------------------------------------
window.SceneTruckLookatRender = function (learn, vshaders_dictionary,
                                fshaders_dictionary, models, controls) {

  // Private variables
  var self = this;
  var canvas_id = learn.canvas_id;
  var out = learn.out;

  var gl = null;
  var program;
  var ray_program;
  var render_models = {};
  var up_ray;
  var ray_scale = 2;

  var matrix = new Learn_webgl_matrix();
  var V = new Learn_webgl_vector3();
  var P = new Learn_webgl_point3();

  var transform = matrix.create();
  var base = matrix.create();

  var translate = matrix.create();
  matrix.translate(translate, -1, -2, -2.0);

  // Camera transform and parameters
  var camera_transform = matrix.create();
  var camera_distance = 30;
  var ex = 0;
  var ey = 0;
  var ez = 10;
  self.angle_x = 0.0;
  self.angle_y = 0.0;

  // Transforms for rendering a small sphere at the "center point"
  var center_point_translate = matrix.create();
  var center_point_scale = matrix.create();
  matrix.scale(center_point_scale, 0.1, 0.1, 0.1);

  // Make the axes models larger so they are not totally enclosed by the
  // XYZ blocks model.
  var axes_scale = matrix.create();
  matrix.scale(axes_scale, 2, 2, 2);

  // The demo_camera is the camera we are using in the left window to
  // view everything -- including the scene_camera.
  var camera = matrix.create();

  var projection = matrix.createPerspective(30.0, 1.0, 0.5, 100.0);

  var cube_model_names = ["textz", "texty", "textx", "cubey", "cubex", "cubez", "cube_center"];
  var camera_model_names = ["Camera_lens", "Camera", "Camera_body", "u_axis", "v_axis", "n_axis"];
  var axes_model_names = ["xaxis", "yaxis", "zaxis"];

  // Public variables that will possibly be used or changed by event handlers.
  self.canvas = null;

  // The scene camera is the camera we are using to get a specific view of
  // the scene. It is used to render the right canvas window.
  self.virtual_camera = new LookAtCamera();
  P.set(self.virtual_camera.eye, 0, 0, 5);
  P.set(self.virtual_camera.center, 0, 0, 0);

  //-----------------------------------------------------------------------
  self.render = function () {
    var j, dist;

    gl.viewport(0, 0, self.canvas.width, self.canvas.height);

    // Clear the entire canvas window background with the clear color
    // out.display_info("Clearing the screen");
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Calculate and set the camera for the entire rendering
    ex = Math.sin(self.angle_x) * camera_distance;
    ez = Math.cos(self.angle_x) * camera_distance;
    ey = Math.sin(self.angle_y) * camera_distance;
    dist = Math.sqrt(ex * ex + ey * ey + ez * ez);
    ex = (ex / dist) * camera_distance;
    ey = (ey / dist) * camera_distance;
    ez = (ez / dist) * camera_distance;
    matrix.lookAt(camera, ex, ey, ez, 0, 0, 0, 0, 1, 0);

    // Create the base transform which is built upon for all other transforms
    matrix.multiplySeries(base, projection, camera);

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Render axes
    matrix.multiplySeries(transform, base, axes_scale);

    // Draw each global axes
    for (j = 0; j < axes_model_names.length; j += 1) {
      render_models[axes_model_names[j]].render(transform);
    }

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Render model
    matrix.copy(transform, base);

    // Draw each model
    for (j = 0; j < cube_model_names.length; j += 1) {
      render_models[cube_model_names[j]].render(transform);
    }

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Render the up vector for the camera
    up_ray.set(self.virtual_camera.eye[0], self.virtual_camera.eye[1], self.virtual_camera.eye[2],
               self.virtual_camera.eye[0] + self.virtual_camera.up_vector[0] * ray_scale,
               self.virtual_camera.eye[1] + self.virtual_camera.up_vector[1] * ray_scale,
               self.virtual_camera.eye[2] + self.virtual_camera.up_vector[2] * ray_scale);
    up_ray.render(transform);

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Render the "center point" of the virtual camera as a small sphere
    matrix.translate(center_point_translate, self.virtual_camera.center[0],
                                             self.virtual_camera.center[1],
                                             self.virtual_camera.center[2]);
    matrix.multiplySeries(transform, base, center_point_translate, center_point_scale);
    render_models.Sphere.render(transform);

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Render virtual camera
    // Calculate the virtual camera transform
    matrix.copy(camera_transform, self.virtual_camera.transform);
    matrix.transpose(camera_transform);
    // Remove the transposed translate values on row 4
    camera_transform[3] = 0;
    camera_transform[7] = 0;
    camera_transform[11] = 0;
    // Set the translate values in the 4th column
    camera_transform[12] = self.virtual_camera.eye[0];
    camera_transform[13] = self.virtual_camera.eye[1];
    camera_transform[14] = self.virtual_camera.eye[2];
    matrix.print("camera_transform", camera_transform);

    matrix.multiplySeries(transform, base, camera_transform);

    // Draw the camera
    for (j = 0; j < camera_model_names.length; j += 1) {
      render_models[camera_model_names[j]].render(transform);
    }

    // Render the other window that shows what the camera sees.
    self.render2();
  };

  //-----------------------------------------------------------------------
  self.render2 = function () {
    var j, model_names;

    //gl2.viewport(self.canvas2.width,self.canvas2.height/2,self.canvas2.width/2,self.canvas2.height/2);

    // Clear the entire canvas window background with the clear color
    gl2.clear(gl2.COLOR_BUFFER_BIT | gl2.DEPTH_BUFFER_BIT);

    // Combine the transforms into a single transformation
    matrix.multiplySeries(transform, projection, self.virtual_camera.transform, axes_scale);

    // Draw each global axes
    for (j = 0; j < axes_model_names.length; j += 1) {
      render_models2[axes_model_names[j]].render(transform);
    }

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Render model
    matrix.multiplySeries(transform, projection, self.virtual_camera.transform);

    // Draw each model
    for (j = 0; j < cube_model_names.length; j += 1) {
      render_models2[cube_model_names[j]].render(transform);
    }
  };

  //-----------------------------------------------------------------------
  self.delete = function () {
    var j, model_names;

    // Clean up shader programs
    gl.deleteShader(program.vShader);
    gl.deleteShader(program.fShader);
    gl.deleteProgram(program);

    // Delete each model's VOB
    model_names = Object.keys(render_models);
    for (j = 0; j < model_names.length; j += 1) {
      render_models[model_names[j]].delete(gl);
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
    return;
  }

  // Set up the rendering program and set the state of webgl
  program = learn.createProgram(gl, vshaders_dictionary.shader05, fshaders_dictionary.shader05);
  ray_program = learn.createProgram(gl, vshaders_dictionary.shader01a, fshaders_dictionary.shader01);

  gl.useProgram(program);

  gl.enable(gl.DEPTH_TEST);

  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  // Create Vertex Object Buffers for the models
  var j, name;
  for (j = 0; j < models.number_models; j += 1) {
    name = models[j].name;
    render_models[name] = new Learn_webgl_model_render_05(gl, program, models[name], out);
  }

  up_ray = new Create_ray_manually(gl, ray_program, 0, 0, 0, 1, 0, 0, [0,0,0,1]);

  // Set up callbacks for user and timer events
  var events;
  events = new CameraTruckLookatEvents(self, controls);

  var id = '#' + canvas_id;
  $( id ).mousedown( events.mouse_drag_started );
  $( id ).mouseup( events.mouse_drag_ended );
  $( id ).mousemove( events.mouse_dragged );

  //-----------------------------------------------------------------------
  // Initialization of second canvas rendering
  // Private variables
  var canvas_id2 = learn.canvas_id + "_b";

  var gl2 = null;
  var program2;
  var render_models2 = {};

  var transform2 = matrix.create();

  var translate2 = matrix.create();
  matrix.translate(translate2, -1, -1, -2.0);

  // Public variables that will possibly be used or changed by event handlers.
  // Get the rendering context for the canvas
  self.canvas2 = learn.getCanvas(canvas_id2);
  if (self.canvas2) {
    gl2 = learn.getWebglContext(self.canvas2);
  }
  if (!gl2) {
    return;
  }

  // Set up the rendering program and set the state of webgl
  program2 = learn.createProgram(gl2, vshaders_dictionary["shader05"], fshaders_dictionary["shader05"]);

  gl2.useProgram(program2);

  gl2.enable(gl2.DEPTH_TEST);

  gl2.clearColor(0.9, 0.9, 0.9, 1.0);

  // Create Vertex Object Buffers for the models
  for (j = 0; j < models.number_models; j += 1) {
    name = models[j].name;
    render_models2[name] = new Learn_webgl_model_render_05(gl2, program2, models[name], out);
  }

};

