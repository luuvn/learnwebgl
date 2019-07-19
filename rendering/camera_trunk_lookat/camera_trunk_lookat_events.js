/**
 * learn_webgl_events_01.js, By Wayne Brown, Fall 2015
 *
 * These event handlers can modify the characteristics of a scene.
 * These will be specific to a scene's models and the models' attributes.
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
function CameraTruckLookatEvents(scene, control_id_list) {

  var self = this;

  //-----------------------------------------------------------------------
  self.mouse_drag_started = function (event) {

    //console.log("started mouse drag event x,y = " + event.clientX + " " + event.clientY + "  " + event.which);
    start_of_mouse_drag = event;
    event.preventDefault();

    if (animate_is_on) {
      scene.animate_active = false;
    }
  };

  //-----------------------------------------------------------------------
  self.mouse_drag_ended = function (event) {

    //console.log("ended mouse drag event x,y = " + event.clientX + " " + event.clientY + "  " + event.which);
    start_of_mouse_drag = null;

    event.preventDefault();

    if (animate_is_on) {
      scene.animate_active = true;
      self.animate();
    }
  };

  //-----------------------------------------------------------------------
  self.mouse_dragged = function (event) {
    var delta_x, delta_y, new_x, new_y;
    var x_limit, y_limit;

    // Limit the change in angle to -30 to + 30 degree;
    x_limit = 180 * 0.017453292519943295;
    y_limit = 60 * 0.017453292519943295;

    //console.log("drag event x,y = " + event.clientX + " " + event.clientY + "  " + event.which);
    if (start_of_mouse_drag) {
      delta_x = -(event.clientX - start_of_mouse_drag.clientX) * 0.01745;
      delta_y = (event.clientY - start_of_mouse_drag.clientY) * 0.01745;

      new_x = scene.angle_x + delta_x;
      new_y = scene.angle_y + delta_y;

      if (new_x >= -x_limit && new_x <= x_limit) {
        scene.angle_x = new_x;
      }
      if (new_y >= -y_limit && new_y <= y_limit) {
        scene.angle_y = new_y;
      }
      scene.render();

      start_of_mouse_drag = event;
      event.preventDefault();
    }
  };

  //------------------------------------------------------------------------------
  function _updateValuesDisplay() {
    var eye, center, up;

    eye    = scene.virtual_camera.eye;
    center = scene.virtual_camera.center;
    up     = scene.virtual_camera.up_vector;

    // Update the text above the sliders
    $('#W1_eye_text').html('<strong>eye ('
        + eye[0].toFixed(1) + ', '
        + eye[1].toFixed(1) + ', '
        + eye[2].toFixed(1) + ')</strong>');
    $('#W1_center_text').html('<strong>center ('
        + center[0].toFixed(1) + ', '
        + center[1].toFixed(1) + ', '
        + center[2].toFixed(1) + ')</strong>');
    $('#W1_up_text').html('<strong>up &lt;'
        + up[0].toFixed(1) + ', '
        + up[1].toFixed(1) + ', '
        + up[2].toFixed(1) + '&gt;</strong>');

    // Update the values of the sliders
    $("#W1_eyeX").val(eye[0]);
    $("#W1_eyeY").val(eye[1]);
    $("#W1_eyeZ").val(eye[2]);

    $("#W1_cX").val(center[0]);
    $("#W1_cY").val(center[1]);
    $("#W1_cZ").val(center[2]);

    $("#W1_upX").val(up[0]);
    $("#W1_upY").val(up[1]);
    $("#W1_upZ").val(up[2]);
  }

  //------------------------------------------------------------------------------
  self.html_control_event = function (event) {
    var control, distance;

    control = $(event.target);
    if (control) {
      switch (control.attr('id')) {
        case "W1_reset":
          // Change the render values
          var zero = 0;
          var one = 1;
          var five = 5;
          scene.virtual_camera.eye[0] = zero;
          scene.virtual_camera.eye[1] = zero;
          scene.virtual_camera.eye[2] = five;
          scene.virtual_camera.center[0] = zero;
          scene.virtual_camera.center[1] = zero;
          scene.virtual_camera.center[2] = zero;
          scene.virtual_camera.up_vector[0] = zero;
          scene.virtual_camera.up_vector[1] = one;
          scene.virtual_camera.up_vector[2] = zero;
          scene.virtual_camera.updateTransform();

          // Changed displayed text
          _updateValuesDisplay();
          scene.render();
          break;

        case "W1_eyeX":
          scene.virtual_camera.eye[0] = Number(control.val());
          scene.virtual_camera.updateTransform();
          scene.render();
          _updateValuesDisplay();
          break;

        case "W1_eyeY":
          scene.virtual_camera.eye[1] = Number(control.val());
          scene.virtual_camera.updateTransform();
          scene.render();
          _updateValuesDisplay();
          break;

        case "W1_eyeZ":
          scene.virtual_camera.eye[2] = Number(control.val());
          scene.virtual_camera.updateTransform();
          scene.render();
          _updateValuesDisplay();
          break;

        case "W1_cX":
          scene.virtual_camera.center[0] = Number(control.val());
          scene.virtual_camera.updateTransform();
          scene.render();
          _updateValuesDisplay();
          break;

        case "W1_cY":
          scene.virtual_camera.center[1] = Number(control.val());
          scene.virtual_camera.updateTransform();
          scene.render();
          _updateValuesDisplay();
          break;

        case "W1_cZ":
          scene.virtual_camera.center[2] = Number(control.val());
          scene.virtual_camera.updateTransform();
          scene.render();
          _updateValuesDisplay();
          break;

        case "W1_upX":
          scene.virtual_camera.up_vector[0] = Number(control.val());
          scene.virtual_camera.updateTransform();
          scene.render();
          _updateValuesDisplay();
          break;

        case "W1_upY":
          scene.virtual_camera.up_vector[1] = Number(control.val());
          scene.virtual_camera.updateTransform();
          scene.render();
          _updateValuesDisplay();
          break;

        case "W1_upZ":
          scene.virtual_camera.up_vector[2] = Number(control.val());
          scene.virtual_camera.updateTransform();
          scene.render();
          _updateValuesDisplay();
          break;

        case "W1_trunk_right":
          scene.virtual_camera.truck(+0.1);
          scene.render();
          break;

        case "W1_trunk_left":
          scene.virtual_camera.truck(-0.1);
          scene.render();
          break;
      }
    }
  };

  //------------------------------------------------------------------------------
  self.removeAllEventHandlers = function () {
    var j;
    for (j = 0; j < control_id_list.length; j += 1) {
      var control = $('#' + control_id_list);
      if (control) {
        control.unbind("click", self.html_control_event);
      }
    }
  };

  //------------------------------------------------------------------------------
  // Constructor code for the class.

  // Private variables
  var out = scene.out;    // Debugging and output goes here.
  var canvas = scene.canvas;

  // Remember the current state of events
  var start_of_mouse_drag = null;
  var previous_time = Date.now();
  var animate_is_on = scene.animate_active;

  // Control the rate at which animations refresh
  var frame_rate = 30; // 33 milliseconds = 1/30 sec
  //var frame_rate = 0; // gives screen refresh rate (60 fps)

  // Add an onclick callback to each HTML control
  var j;
  for (j = 0; j < control_id_list.length; j += 1) {
    var id = '#' + control_id_list[j];
    var control = $(id);
    if (control) {
      var control_type = control.prop('type');
      if (control_type === 'checkbox') {
        control.click(self.html_control_event);
      } else if (control_type === 'submit') {
        control.click(self.html_control_event);
      } else {
        //control.on( 'input', self.html_control_event );
        var a = document.getElementById(control_id_list[j]);
        document.addEventListener('input', self.html_control_event)
      }
    }
  }
}



