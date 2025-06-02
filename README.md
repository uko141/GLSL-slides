# **GLSL Slides**

This project is a web application for creating interactive slides using GLSL (OpenGL Shading Language).

**Live Demo: [https://uko141.github.io/GLSL-slides/](https://uko141.github.io/GLSL-slides/)**

## **Overview**

Users can edit GLSL shaders in the browser and create/manage slides with a real-time preview. It's possible to add text and shape elements, and apply custom shaders to each element or the entire page.

## **Main Features**

* **Slide Management**:  
  * Add and delete new slide pages.  
  * Navigate between pages.  
* **Element Addition and Editing**:  
  * Add and edit text elements (font, color, size).  
  * Add and edit GLSL shape elements (base color, alpha, texture binding).  
  * Drag & drop to move and resize elements.  
* **GLSL Shader Editing**:  
  * Edit fragment shaders for page backgrounds.  
  * Edit fragment shaders for post-process effects on the entire page.  
  * Edit fragment shaders for GLSL shape element materials.  
  * Syntax highlighting and indentation features via CodeMirror editor.  
* **Texture Management**:  
  * Upload up to 3 user textures per page.  
  * Bind uploaded textures to GLSL shape elements.  
* **Slideshow Feature**:  
  * Play created slides in full screen.  
* **Data Export and Import**:  
  * Export created slide data (including image data) in JSON format.  
  * Import exported JSON files to resume editing.  
* **Multilingual Support**:  
  * Switch between Japanese and English interfaces.  
* **Undo Functionality**:  
  * Undo recent operations.

## **How to Use**

1. **Creating Slides**:  
   * Create a slide page using the "Add New Page" button.  
   * Edit the GLSL fragment shaders for the page background and post-process effects in the left-hand editor panel.  
2. **Adding Elements**:  
   * Add elements to the current slide using the "Add Text Element" or "Add GLSL Shape Element" buttons.  
3. **Editing Elements**:  
   * Added elements can be moved by dragging and resized using the handle at the bottom right on the slide.  
   * Selecting a text element allows you to edit its content, font, color, and size.  
   * Selecting a GLSL shape element allows you to edit its material shader, base color, and texture bindings.  
4. **Using Textures**:  
   * Upload images from the "Page Textures" section.  
   * Select a GLSL shape element and bind the uploaded texture to a uniform variable in the shader (e.g., u\_userTexture0) via the property editing UI.  
5. **Slideshow**:  
   * Display the created slides in presentation mode using the "Start Slideshow" button. Press the ESC key to exit.  
6. **Saving and Loading Data**:  
   * Save the entire current slide project as a JSON file using "Export Data".  
   * Load a saved JSON file to resume editing using "Import Data".

## **Acknowledgements**

* This project was created with the assistance of Google's **Gemini**.  
* This project uses the following wonderful open-source libraries:  
  * **React**: [https://reactjs.org/](https://reactjs.org/) (MIT License)  
  * **@uiw/react-codemirror**: [https://uiwjs.github.io/react-codemirror/](https://uiwjs.github.io/react-codemirror/) (MIT License)  
  * **codemirror-lang-glsl**: (GLSL language support package for CodeMirror \- typically follows the license of CodeMirror itself or related packages, often MIT License)  
  * **@codemirror/language**: (Language-related package for CodeMirror \- same as above)

For details on the license terms of each library, please check their respective repositories or official websites.

## **License**

This project is licensed under the **MIT License**.