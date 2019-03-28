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
function RotateAboutAxisEvents(scene, control_id_list) {

  //-----------------------------------------------------------------------
  this.mouse_drag_started = function (event) {

    //console.log("started mouse drag event x,y = " + event.clientX + " " + event.clientY + "  " + event.which);
    start_of_mouse_drag = event;
    event.preventDefault();

    if (animate_is_on) {
      scene.animate_active = false;
    }
  };

  //-----------------------------------------------------------------------
  this.mouse_drag_ended = function (event) {

    //console.log("ended mouse drag event x,y = " + event.clientX + " " + event.clientY + "  " + event.which);
    start_of_mouse_drag = null;

    event.preventDefault();

    if (animate_is_on) {
      scene.animate_active = true;
      self.animate();
    }
  };

  //-----------------------------------------------------------------------
  this.mouse_dragged = function (event) {
    var delta_x, delta_y;

    //console.log("drag event x,y = " + event.clientX + " " + event.clientY + "  " + event.which);
    if (start_of_mouse_drag) {
      delta_x = event.clientX - start_of_mouse_drag.clientX;
      delta_y = -(event.clientY - start_of_mouse_drag.clientY);
      //console.log("moved: " + delta_x + " " + delta_y);

      scene.angle_x -= delta_y;
      scene.angle_y += delta_x;
      scene.render();

      start_of_mouse_drag = event;
      event.preventDefault();
    }
  };

  //------------------------------------------------------------------------------
  this.html_control_event = function (event) {
    var control;

    control = $(event.target);
    if (control) {
      switch (control.attr('id')) {
        case "W4_animate":
          if (control.is(":checked"))  {
            animate_is_on = true;
            scene.animate_active = true;
            self.animate();
          } else {
            animate_is_on = false;
            scene.animate_active = false;
          }
          break;
        case "W4_reset":
          scene.axis_x_angle = 0.0;
          scene.axis_y_angle = 0.0;
          scene.axis_z_angle = 0.0;
          scene.tx = 0.0;
          scene.ty = 0.0;
          scene.tz = 0.0;
          scene.angle = 0.0;

          var zero = 0;
          var one = 1;
          $("#W4_xtranslate").val(zero);
          $("#W4_ytranslate").val(zero);
          $("#W4_ztranslate").val(zero);
          $("#W4_angle").val(zero);

          $("#W4_xtranslate").next().html(zero.toFixed(1));
          $("#W4_ytranslate").next().html(zero.toFixed(1));
          $("#W4_ztranslate").next().html(zero.toFixed(1));
          $("#W4_angle").next().html(zero.toFixed(1));

          $("#W4_vecx_angle").val(zero);
          $("#W4_vecy_angle").val(zero);
          $("#W4_vecz_angle").val(zero);

          $("#W4_vecx_angle").next().html(zero.toFixed(1));
          $("#W4_vecy_angle").next().html(zero.toFixed(1));
          $("#W4_vecz_angle").next().html(zero.toFixed(1));

          scene.render();
          break;
        case "W4_xtranslate":
          var tx = Number(control.val());
          scene.tx = tx;
          scene.render();

          // Update the value of the slider
          control.next().html(tx.toFixed(2));
          break;
        case "W4_ytranslate":
          var ty = Number(control.val());
          scene.ty = ty;
          scene.render();

          // Update the value of the slider
          control.next().html(tx.toFixed(2));
          break;
        case "W4_ztranslate":
          var tz = Number(control.val());
          scene.tz = tz;
          scene.render();

          // Update the value of the slider
          control.next().html(tz.toFixed(2));
          break;
        case "W4_angle":
          var angle = Number(control.val());
          scene.angle = angle;
          scene.render();

          // Update the value of the slider
          control.next().html(angle.toFixed(1));
          break;
        case "W4_vecx_angle":
          var xAngle = Number(control.val());
          scene.axis_x_angle = xAngle;
          scene.render();

          // Update the value of the slider
          control.next().html(xAngle.toFixed(1));
          break;
        case "W4_vecy_angle":
          var yAngle = Number(control.val());
          scene.axis_y_angle = yAngle;
          scene.render();

          // Update the value of the slider
          control.next().html(yAngle.toFixed(1));
          break;
        case "W4_vecz_angle":
          var zAngle = Number(control.val());
          scene.axis_z_angle = zAngle;
          scene.render();

          // Update the value of the slider
          control.next().html(zAngle.toFixed(1));
          break;
      }
    }
  };

  //------------------------------------------------------------------------------
  this.removeAllEventHandlers = function () {
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
  var self = this;
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
        control.click( self.html_control_event );
      } else if (control_type === 'submit') {
        control.click( self.html_control_event );
      } else {
        //control.on( 'input', self.html_control_event );
        var a = document.getElementById(control_id_list[j]);
        document.addEventListener('input', self.html_control_event)
      }
    }
  }
}



