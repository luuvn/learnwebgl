/**
 * simple_model_04.js, By Wayne Brown, Spring 2016
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
/**
 * A triangle composed of 3 vertices and a color.
 * @param vertices Array The triangle's vertices.
 * @param colors Array An array of 3 color values.
 * @constructor
  */
window.Triangle4 = function (vertices, colors, textures) {
  var self = this;
  self.vertices = vertices;
  self.colors = colors;
  self.textures = textures;
};

//-------------------------------------------------------------------------
/**
 * A simple model composed of an array of triangles.
 * @param name String The name of the model.
 * @constructor
 */
window.SimpleModel2 = function (name) {
  var self = this;
  self.name = name;
  self.triangles = [];
};

//-------------------------------------------------------------------------
/**
 * Create a Simple_model of 4 triangles that forms a pyramid.
 * @return SimpleModel2
 */
window.CreatePyramid4 = function () {
  var vertices, triangle1, triangle2, triangle3, triangle4;
  var red, green, blue, purple;
  var ta, tb, tc;

  // Vertex data
  vertices = [  [-0.5, 0.0,   0.5],
                [ 0.5, 0.0,   0.5],
                [ 0.0, 0.0,  -0.5],
                [ 0.0, 0.7,   0.0 ] ];

  // Colors in RGB
  red    = [1.0, 0.0, 0.0];
  green  = [0.0, 1.0, 0.0];
  blue   = [0.0, 0.0, 1.0];
  purple = [1.0, 0.0, 1.0];

  // Texture coordinates
  ta = [0, 0];
  tb = [40, 0];
  tc = [20, 40];

  // Create 4 triangles
  triangle1 = new Triangle4([vertices[2], vertices[1], vertices[3]],
                            [blue, green, purple],
                            [tb, ta, tc]);
  triangle2 = new Triangle4([vertices[3], vertices[1], vertices[0]],
                            [purple, green, red],
                            [tc, tb, ta]);
  triangle3 = new Triangle4([vertices[0], vertices[1], vertices[2]],
                            [red, green, blue],
                            [ta, tc, tb]);
  triangle4 = new Triangle4([vertices[0], vertices[2], vertices[3]],
                            [red, blue, purple],
                            [tb, ta, tc]);

  // Create a model that is composed of 4 triangles
  var model = new SimpleModel2("simple");
  model.triangles = [ triangle1, triangle2, triangle3, triangle4 ];

  return model;
};
