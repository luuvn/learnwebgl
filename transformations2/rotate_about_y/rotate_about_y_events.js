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
function RotateAboutYEvents(scene, control_id_list) {

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

      scene.angle_x += delta_y;
      scene.angle_y -= delta_x;
      scene.render();

      start_of_mouse_drag = event;
      event.preventDefault();
    }
  };

  //------------------------------------------------------------------------------
  this.html_control_event = function (event) {

    control = $(event.target);
    if (control) {
      switch (control.attr('id')) {
      case "W3_animate":
        if (control.is(":checked"))  {
          animate_is_on = true;
          scene.animate_active = true;
          self.animate();
        } else {
          animate_is_on = false;
          scene.animate_active = false;
        }
        break;
      case "W3_reset":
        scene.tx = 0.0;
        scene.ty = 0.0;
        scene.tz = 0.0;
        scene.yangle = 0.0;

        var zero = 0;
        $("#W3_xtranslate").val(zero);
        $("#W3_ytranslate").val(zero);
        $("#W3_ztranslate").val(zero);
        $("#W3_yangle").val(zero);

        $("#W3_xtranslate").next().html(zero.toFixed(1));
        $("#W3_ytranslate").next().html(zero.toFixed(1));
        $("#W3_ztranslate").next().html(zero.toFixed(1));
        $("#W3_yangle").next().html(zero.toFixed(1));

        scene.render();
        break;
      case "W3_xtranslate":
        var tx = Number(control.val());
        scene.tx = tx;
        scene.render();

        // Update the value of the slider
        control.next().html(tx.toFixed(2));
        break;
      case "W3_ytranslate":
        var ty = Number(control.val());
        scene.ty = ty;
        scene.render();

        // Update the value of the slider
        control.next().html(tx.toFixed(2));
        break;
      case "W3_ztranslate":
        var tz = Number(control.val());
        scene.tz = tz;
        scene.render();

        // Update the value of the slider
        control.next().html(tx.toFixed(2));
        break;
      case "W3_yangle":
        var angle = Number(control.val());
        scene.yangle = angle;
        scene.render();

        // Update the value of the slider
        control.next().html(angle.toFixed(1));
        break;
      }
    }
  };

  //------------------------------------------------------------------------------
  this.removeAllEventHandlers = function () {
    var k;
    for (k = 0; k < control_id_list.length; k += 1) {
      control = $('#' + control_id_list);
      if (control) {
        control.unbind("click", self.html_control_event);
      }
    }
  };

    // Add an onclick callback to each HTML control
  var j, id, control, control_type, a;
  for (j = 0; j < control_id_list.length; j += 1) {
    id = '#' + control_id_list[j];
    control = $(id);
    if (control) {
      control_type = control.prop('type');
      if (control_type === 'checkbox') {
        control.click(self.html_control_event);
      } else if (control_type === 'submit') {
        control.click(self.html_control_event);
      } else {
        //control.on( 'input', self.html_control_event );
        a = document.getElementById(control_id_list[j]);
        document.addEventListener('input', self.html_control_event);
      }
    }
  }



}



