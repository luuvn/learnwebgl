/**
 * lookat_camera.js, By Wayne Brown, Spring 2016
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
var Learn_webgl_matrix, Learn_webgl_vector3, Learn_webgl_point3;

//-----------------------------------------------------------------------
/**
 * Store and manipulate a camera based on the parameters of the lookAt function.
 * @constructor
 */
window.LookAtCamera = function () {

  // Constructor
  var self = this;

  // Objects needed for internal elements and calculations
  var matrix = new Learn_webgl_matrix();
  var V = new Learn_webgl_vector3();
  var P = new Learn_webgl_point3();

  // Camera definition at the default camera location and orientation
  self.eye       = P.create(0, 0, 0);  // (x,y,z), origin
  self.center    = P.create(0, 0, -1); // (x,y,z), down -Z axis
  self.up_vector = V.create(0, 1, 0);  // <dx,dy,dz>, up Y axis

  // Create a matrix to hold the camera's matrix transform
  self.transform = matrix.create();

  // Scratch objects for calculations
  var u, n, new_center, tilt_rotate;
  u = V.create();  // u coordinate axis of camera
  n = V.create();  // n coordinate axis of camera
  new_center = P.create();
  tilt_rotate = new matrix.create();

  //-----------------------------------------------------------------------
  /**
   * Using the current values for eye, center, and up, calculate a new
   * camera transformation matrix.
   */
  self.updateTransform = function () {
    // Calculate a new camera transform
    matrix.lookAt(self.transform,
                  self.eye[0], self.eye[1], self.eye[2],
                  self.center[0], self.center[1], self.center[2],
                  self.up_vector[0], self.up_vector[1], self.up_vector[2]);
  };

  //-----------------------------------------------------------------------
  /**
   * Perform a tilt operation on a camera
   * @param angle Number The angle of rotation about the u axis.
   */
  self.tilt = function (angle) {
    // Calculate the n camera axis
    V.subtract(n, self.eye, self.center);  // n = eye - center
    V.normalize(n);

    // Calculate the u camera axis
    V.crossProduct(u, self.up_vector, n);
    V.normalize(u);

    // Move the camera coordinate system to the origin. We only calculate
    // the center point because we are not going to change the eye point
    P.subtractVector(new_center, self.center, self.eye);

    // Create a rotation transform about u
    matrix.rotate(tilt_rotate, angle, u[0], u[1], u[2]);

    // Rotate the center point. Since this is a vector that has no location,
    // we only need to multiply by the rotation part of the transform.
    matrix.multiplyV3(new_center, tilt_rotate, new_center);

    // Translate the center point back to the location of the camera.
    P.addVector(self.center, new_center, self.eye);

    // If the angle between the line-of-sight and the "up vector" is less
    // than 10 degrees or greater than 170 degrees, then rotate the
    // "up_vector" about the u axis.
    // cos(10 degrees) = 0.985; cos(170 degrees) = -0.985
    if (Math.abs(V.dotProduct(n, self.up_vector)) >= 0.985) {
      matrix.multiplyV3(self.up_vector, tilt_rotate, self.up_vector);
    }
    // Calculate a new camera transform
    self.updateTransform();
  };

  //-----------------------------------------------------------------------
  /**
   * Perform a truck operation on the camera
   * @param distance Number How far to move the camera
   */
  self.truck = function (distance) {
    // Calculate the n camera axis
    V.subtract(n, self.eye, self.center);  // n = eye - center
    V.normalize(n);

    // Calculate the u camera axis
    V.crossProduct(u, self.up_vector, n);
    V.normalize(u);

    // Scale the u axis to the desired distance to move
    V.scale(u, u, distance);

    // Add the direction vector to both the eye and center positions
    P.addVector(self.eye, self.eye, u);
    P.addVector(self.center, self.center, u);

    self.updateTransform();
  };

  self.updateTransform();
};



