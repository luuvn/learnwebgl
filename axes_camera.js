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
 * Store and manipulate a camera based on its location and its
 * local coordinate system.
 * @constructor
 */
window.AxesCamera = function () {

  // Constructor
  var self = this;

  // Objects needed for internal elements and calculations
  var matrix = new Learn_webgl_matrix();
  var V = new Learn_webgl_vector3();
  var P = new Learn_webgl_point3();

  // Camera definition at the default camera location and orientation.
  self.eye = P.create(0, 0, 0);  // (x,y,z), origin
  self.u   = V.create(1, 0, 0);  // <dx,dy,dz>, +X axis
  self.v   = V.create(0, 1, 0);  // <dx,dy,dz>, +Y axis
  self.n   = V.create(0, 0, 1);  // <dx,dy,dz>, +Z axis

  // Create a matrix to hold the camera's matrix transform
  self.transform = matrix.create();

  // Scratch objects for calculations
  var u_scaled, rotate;
  u_scaled = V.create();  // a scaled u coordinate axis of camera
  rotate = matrix.create();

  //-----------------------------------------------------------------------
  /**
   * Using the current values for eye, u, v, and n, set a new camera
   * transformation matrix.
   */
  self.updateTransform = function () {
    var tx = -V.dotProduct(self.u, self.eye);
    var ty = -V.dotProduct(self.v, self.eye);
    var tz = -V.dotProduct(self.n, self.eye);

    // Use an alias for self.transform to simplify the assignment statements
    var M = self.transform;

    // Set the camera matrix
    M[0] = self.u[0];  M[4] = self.u[1];  M[8]  = self.u[2];  M[12] = tx;
    M[1] = self.v[0];  M[5] = self.v[1];  M[9]  = self.v[2];  M[13] = ty;
    M[2] = self.n[0];  M[6] = self.n[1];  M[10] = self.n[2];  M[14] = tz;
    M[3] = 0;          M[7] = 0;          M[11] = 0;          M[15] = 1;
  };

  //-----------------------------------------------------------------------
  /**
   * Update the camera's transformation matrix for a tilt motion.
   * @param angle
   */
  self.tilt = function (angle) {
    // Rotate the camera's coordinate system about u; updates v and n
    matrix.rotate(rotate, angle, self.u[0], self.u[1], self.u[2]);
    matrix.multiplyV3(self.v, rotate, self.v);
    matrix.multiplyV3(self.n, rotate, self.n);

    // Use an alias for self.transform to simplify the assignment statements
    var M = self.transform;

    // Update the 2nd and 3rd row of the camera transformation because only
    // the v and n axes changed.
    M[1] = self.v[0];  M[5] = self.v[1];  M[9]  = self.v[2];
    M[2] = self.n[0];  M[6] = self.n[1];  M[10] = self.n[2];

    // Update the translate values of ty and tz
    M[13] = -V.dotProduct(self.v, self.eye);
    M[14] = -V.dotProduct(self.n, self.eye);
  };

  //-----------------------------------------------------------------------
  /**
   * Perform a "truck" operation on the camera
   * @param distance
   */
  self.truck = function (distance) {
    // Scale the u axis to the desired distance to move
    V.scale(u_scaled, self.u, distance);

    // Add the direction vector to the eye position.
    P.addVector(self.eye, self.eye, u_scaled);

    // Set the camera transformation. Since the only change is in location,
    // change only the values in the 4th column.
    self.transform[12] = -V.dotProduct(self.u, self.eye);
    self.transform[13] = -V.dotProduct(self.v, self.eye);
    self.transform[14] = -V.dotProduct(self.n, self.eye);
  };

  self.updateTransform();
}



