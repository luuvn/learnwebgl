/**
 * simple_model_render_04.js, By Wayne Brown, spring 2016
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
 * Given a model description, create the buffer objects needed to render
 * the model. This is very closely tied to the shader implementations.
 * @param gl Object The WebGL state and API
 * @param program Object The shader program the will render the model.
 * @param model Simple_model The model data.
 * @param model_color The color of the model faces.
 * @param out Object Can display messages to the webpage.
 * @constructor
 */
var SimpleModelRender_04 = function (gl, program, model, out) {

  var self = this;

  // Variables to remember so the model can be rendered.
  var number_triangles = 0;
  var triangles_vertex_buffer_id = null;
  var triangles_color_buffer_id = null;
  var triangles_texture_buffer_id = null;

  // Shader variable locations
  var u_Transform_location = null;
  var a_Vertex_location = null;
  var a_Color_location = null;
  var a_Texture_location = null;

  //-----------------------------------------------------------------------
  /**
   * Create a Buffer Object in the GPU's memory and upload data into it.
   * @param gl Object The WebGL state and API
   * @param data TypeArray An array of data values.
   * @returns Number a unique ID for the Buffer Object
   * @private
   */
  function _createBufferObject(gl, data) {
    // Create a buffer object
    var buffer_id;

    buffer_id = gl.createBuffer();
    if (!buffer_id) {
      out.displayError('Failed to create the buffer object for ' + model.name);
      return null;
    }

    // Make the buffer object the active buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer_id);

    // Upload the data for this buffer object to the GPU.
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    return buffer_id;
  }

  //-----------------------------------------------------------------------
  /**
   * Using the model data, build a 1D array for the Buffer Object
   * @private
   */
  function _buildBufferObjectData() {
    var j, k, m, nv, numberVertices, triangle, vertex, all_vertices;
    var nc, all_colors, color;
    var nt, all_textures, texture;

    // Create a 1D array that holds all of the  for the triangles
    if (model.triangles.length > 0) {
      number_triangles = model.triangles.length;
      numberVertices = number_triangles * 3;
      all_vertices = new Float32Array(numberVertices * 3);
      all_colors = new Float32Array(numberVertices * 3);
      all_textures = new Float32Array(numberVertices * 2);

      nv = 0;
      nc = 0;
      nt = 0;
      for (j = 0; j < model.triangles.length; j += 1) {
        triangle = model.triangles[j];

        for (k = 0; k < 3; k += 1) {
          vertex = triangle.vertices[k];
          color = triangle.colors[k];
          texture = triangle.textures[k];

          // Store the vertices.
          for (m = 0; m < 3; m += 1, nv += 1) {
            all_vertices[nv] = vertex[m];
          }

          // Store the colors.
          for (m = 0; m < 3; m += 1, nc += 1) {
            all_colors[nc] = color[m];
          }

          // Store the textures.
          for (m = 0; m < 2; m += 1, nt += 1) {
            all_textures[nt] = texture[m];
          }
        }
      }

      triangles_vertex_buffer_id = _createBufferObject(gl, all_vertices);
      triangles_color_buffer_id = _createBufferObject(gl, all_colors);
      triangles_texture_buffer_id = _createBufferObject(gl, all_textures);
    }

    // Release the temporary vertex array so the memory can be reclaimed.
    all_vertices = null;
    all_colors = null;
    all_textures = null;
  }

  //-----------------------------------------------------------------------
  /**
   * Get the location of the shader variables in the shader program.
   * @private
   */
  function _getLocationOfShaderVariables() {
    // Get the location of the shader variables
    u_Transform_location = gl.getUniformLocation(program, 'u_Transform');

    a_Vertex_location    = gl.getAttribLocation(program, 'a_Vertex');
    a_Color_location     = gl.getAttribLocation(program, 'a_Color');
    a_Texture_location   = gl.getAttribLocation(program, 'a_Texture');
  }

  //-----------------------------------------------------------------------
  // These one-time tasks set up the rendering of the models.
  _buildBufferObjectData();
  _getLocationOfShaderVariables();

  //-----------------------------------------------------------------------
  /**
   * Delete the Buffer Objects associated with this model.
   * @param gl Object The WebGL state and API.
   */
  self.delete = function (gl) {
    if (number_triangles > 0) {
      gl.deleteBuffer(triangles_vertex_buffer_id);
    }
  };

  //-----------------------------------------------------------------------
  /**
   * Render the model.
   * @param gl Object The WebGL state and API.
   * @param transform 4x4Matrix The transformation to apply to the model vertices.
   */
  self.render = function (gl, transform) {

    // Set the transform for all the triangle vertices
    gl.uniformMatrix4fv(u_Transform_location, false, transform);

    // Activate the model's vertex Buffer Object
    gl.bindBuffer(gl.ARRAY_BUFFER, triangles_vertex_buffer_id);

    // Bind the vertices Buffer Object to the 'a_Vertex' shader variable
    gl.vertexAttribPointer(a_Vertex_location, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Vertex_location);

    // Activate the model's color Buffer Object
    gl.bindBuffer(gl.ARRAY_BUFFER, triangles_color_buffer_id);

    // Bind the color Buffer Object to the 'a_Color' shader variable
    gl.vertexAttribPointer(a_Color_location, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color_location);

    // Activate the model's texture Buffer Object
    gl.bindBuffer(gl.ARRAY_BUFFER, triangles_texture_buffer_id);

    // Bind the color Buffer Object to the 'a_Color' shader variable
    gl.vertexAttribPointer(a_Texture_location, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Texture_location);

    // Draw all of the triangles
    gl.drawArrays(gl.TRIANGLES, 0, number_triangles * 3);
  };

};
