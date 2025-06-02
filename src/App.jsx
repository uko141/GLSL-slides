import React, { useState, useEffect, useRef, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { glsl } from 'codemirror-lang-glsl';
import { indentUnit } from '@codemirror/language';

// --- Translations ---
const translations = {
  JP: {
    glslSlides: "GLSL スライド",
    exportData: "データエクスポート",
    importData: "データインポート",
    startSlideshow: "スライドショー開始 (ESCで終了)",
    previousPage: "前へ",
    nextPage: "次へ",
    pageIndicator: "ページ {currentPage}/{totalPages}",
    addNewPage: "新しいページを追加",
    deletePageButton: "現在のページを削除", // New
    confirmDeletePageMessage: "現在のページを削除してもよろしいですか？この操作は元に戻せません。", // New
    cannotDeleteLastPageMessage: "最後のページは削除できません。", // New
    addTextElement: "テキスト要素を追加",
    addGlslElement: "GLSL図形要素を追加",
    pageTexturesTitle: "ページテクスチャ (最大3枚)",
    maxTexturesError: "最大3枚のテクスチャまでアップロードできます。あと {availableSlots} 枚追加可能です。",
    noTexturesUploaded: "アップロードされたテクスチャはありません。",
    deleteButton: "削除",
    pageBackgroundFS: "ページ {pageNumber}: 背景 (FS)",
    pagePostEffectFS: "ページ {pageNumber}: ポストエフェクト (FS)",
    selectedShapeMaterialFS: "選択中図形: \"{elementId}\" (マテリアルFS)",
    glslShapeMaterial: "GLSL図形マテリアル",
    editTextInstruction: "/* GLSL図形を選択して編集 */",
    errorPrefix: "エラー: ",
    canvasInitializing: "スライド領域初期化中...",
    canvasLoading: "スライド読込中...",
    imageLoadError: "画像読み込みエラー: {fileName}",
    canvasNotFound: "Canvas element not found",
    invalidCanvasDimensions: "無効なキャンバスサイズ: {width}x{height}",
    webglNotSupported: "WebGLはサポートされていません",
    framebufferCreateFailed: "フレームバッファ作成失敗: {width}x{height}",
    glContextNotReady: "GLコンテキストまたはスライドデータがシェーダーコンパイルの準備ができていません",
    shaderCompileError: "{shaderName}: {errorMessage}",
    webglRuntimeError: "WebGLランタイムエラー: {errorCode}",
    textColorTitle: "文字色",
    fontSizeDesignTitle: "フォントサイズ (デザイン)",
    fontFamilyTitle: "フォント",
    baseLabel: "ベース:",
    baseColorRGBTitle: "ベースカラー (RGB)",
    alphaLabel: "アルファ:",
    baseColorAlphaTitle: "ベースカラーアルファ",
    noTextureOption: "なし",
    codeMirrorNotLoaded: "CodeMirrorがロードされていません。",
    addElementErrorCanvasNotReady: "要素追加不可: スライド基準領域未準備 (W:{baseWidth},H:{baseHeight})",
    exportSuccess: "画像データを含むデータがエクスポートされました。",
    importErrorNoFile: "ファイルが選択されませんでした。",
    importErrorNotArray: "インポートデータは配列である必要があります。",
    importSuccess: "画像データを含むデータがインポートされました。",
    importErrorGeneric: "インポートエラー: {message}",
    importFileReadError: "ファイルの読み込みに失敗しました。",
    switchToEnglish: "English",
    switchToJapanese: "日本語",
    unknownError: "不明なエラーが発生しました。",
    newTextDefault: "新規テキスト",
    exportFilenameLabel: "エクスポートファイル名:",
    defaultExportFilename: "glsl_slides_data.json",
    copiedElementNotification: "要素をコピーしました。",
    pastedElementNotification: "要素をペーストしました。",
    undoNotification: "操作を取り消しました。", // New
    nothingToUndoNotification: "取り消す操作がありません。", // New
  },
  EN: {
    glslSlides: "GLSL Slides",
    exportData: "Export Data",
    importData: "Import Data",
    startSlideshow: "Start Slideshow (ESC to Exit)",
    previousPage: "Previous",
    nextPage: "Next",
    pageIndicator: "Page {currentPage}/{totalPages}",
    addNewPage: "Add New Page",
    deletePageButton: "Delete Current Page", // New
    confirmDeletePageMessage: "Are you sure you want to delete the current page? This action cannot be undone.", // New
    cannotDeleteLastPageMessage: "Cannot delete the last page.", // New
    addTextElement: "Add Text Element",
    addGlslElement: "Add GLSL Shape Element",
    pageTexturesTitle: "Page Textures (Max 3)",
    maxTexturesError: "You can upload a maximum of 3 textures. {availableSlots} more slot(s) available.",
    noTexturesUploaded: "No textures uploaded.",
    deleteButton: "Delete",
    pageBackgroundFS: "Page {pageNumber}: Background (FS)",
    pagePostEffectFS: "Page {pageNumber}: Post-Process (FS)",
    selectedShapeMaterialFS: "Selected Shape: \"{elementId}\" (Material FS)",
    glslShapeMaterial: "GLSL Shape Material",
    editTextInstruction: "/* Select a GLSL shape to edit its material */",
    errorPrefix: "Error: ",
    canvasInitializing: "Initializing slide area...",
    canvasLoading: "Loading slide...",
    imageLoadError: "Image load error: {fileName}",
    canvasNotFound: "Canvas element not found",
    invalidCanvasDimensions: "Invalid canvas dimensions: {width}x{height}",
    webglNotSupported: "WebGL not supported",
    framebufferCreateFailed: "Framebuffer creation failed: {width}x{height}",
    glContextNotReady: "GL context or slideData not ready for shader compilation",
    shaderCompileError: "{shaderName}: {errorMessage}",
    webglRuntimeError: "WebGL runtime error: {errorCode}",
    textColorTitle: "Text Color",
    fontSizeDesignTitle: "Font Size (Design)",
    fontFamilyTitle: "Font Family",
    baseLabel: "Base:",
    baseColorRGBTitle: "Base Color (RGB)",
    alphaLabel: "Alpha:",
    baseColorAlphaTitle: "Base Color Alpha",
    noTextureOption: "None",
    codeMirrorNotLoaded: "CodeMirror not loaded.",
    addElementErrorCanvasNotReady: "Cannot add element: Slide base area not ready (W:{baseWidth},H:{baseHeight})",
    exportSuccess: "Data with images exported successfully.",
    importErrorNoFile: "No file selected.",
    importErrorNotArray: "Imported data must be an array.",
    importSuccess: "Data with images imported successfully.",
    importErrorGeneric: "Import error: {message}",
    importFileReadError: "Failed to read file.",
    switchToEnglish: "English",
    switchToJapanese: "日本語",
    unknownError: "An unknown error occurred.",
    newTextDefault: "New Text",
    exportFilenameLabel: "Export Filename:",
    defaultExportFilename: "glsl_slides_data.json",
    copiedElementNotification: "Element copied.",
    pastedElementNotification: "Element pasted.",
    undoNotification: "Operation undone.", // New
    nothingToUndoNotification: "Nothing to undo.", // New
  }
};

// --- Default Shaders (No changes) ---
const DEFAULT_VERTEX_SHADER = 
`attribute vec4 a_position;
varying vec2 v_texCoord;
void main() {
	gl_Position = a_position;
	v_texCoord = a_position.xy * 0.5 + 0.5;
}
`;

const DEFAULT_ELEMENT_VERTEX_SHADER = 
`attribute vec2 a_element_uv_position; 
uniform vec2 u_canvas_resolution;
uniform vec2 u_element_position_px; 
uniform vec2 u_element_size_px;     
varying vec2 v_element_uv;
void main() {
	vec2 vertex_pos_px = u_element_position_px + a_element_uv_position * u_element_size_px;
	vec2 clip_space_pos = (vertex_pos_px / u_canvas_resolution) * 2.0 - 1.0;
    clip_space_pos.y *= -1.0; 
    gl_Position = vec4(clip_space_pos, 0.0, 1.0);
    v_element_uv = a_element_uv_position;
}
`;

const DEFAULT_BACKGROUND_FS = 
`precision mediump float;
uniform vec2 u_resolution; 
uniform float u_time; 
varying vec2 v_texCoord; 
void main() {
	gl_FragColor = vec4(0.9, 0.9, 0.9, 1.0);
}
`;

const DEFAULT_ELEMENT_MATERIAL_FS = 
`precision mediump float;
uniform vec2 u_element_resolution_px; 
uniform float u_time;
uniform vec4 u_base_color;

uniform sampler2D u_userTexture0;
uniform sampler2D u_userTexture1;
uniform sampler2D u_userTexture2;

uniform bool u_userTexture0_bound;
uniform bool u_userTexture1_bound;
uniform bool u_userTexture2_bound;

varying vec2 v_element_uv; 

void main() {
	if (u_userTexture0_bound) {
    	gl_FragColor = texture2D(u_userTexture0, v_element_uv);
    } else {
    	vec3 finalColor = u_base_color.rgb;
    	float finalAlpha = u_base_color.a;
    	vec3 gradient = vec3(v_element_uv.x, v_element_uv.y, 0.5 + 0.5 * cos(u_time * 0.8 + v_element_uv.x * 3.14159));
    	finalColor *= gradient; 
    	gl_FragColor = vec4(finalColor, finalAlpha);
    }
}
`;

const DEFAULT_POST_PROCESS_FS = 
`precision mediump float;
uniform sampler2D u_sceneTexture;
uniform vec2 u_resolution;
uniform float u_time;
varying vec2 v_texCoord;
void main() {
	vec2 uv = v_texCoord;
    vec4 color = texture2D(u_sceneTexture, uv);
    gl_FragColor = color;
}
`;

const DEFAULT_TEXT_ELEMENT_FS = 
`precision mediump float;
uniform sampler2D u_elementTexture;
varying vec2 v_element_uv;
void main() {
    vec4 texColor = texture2D(u_elementTexture, v_element_uv);
    gl_FragColor = texColor;
}
`;

// --- WebGL Helper Functions (No changes) ---
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile error: ${info}\nSource:\n${source}`);
  }
  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program link error: ${info}`);
  }
  return program;
}

function getProgramInfo(gl, program, attributeNames, uniformNames) {
    const attributes = {};
    attributeNames.forEach(name => {
        attributes[name] = gl.getAttribLocation(program, name);
    });
    const uniforms = {};
    uniformNames.forEach(name => {
        uniforms[name] = gl.getUniformLocation(program, name);
    });
    return { program, attributes, uniforms };
}

function createAndSetupTexture(gl, filter = gl.LINEAR, wrap = gl.CLAMP_TO_EDGE) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    return texture;
}

function createFramebufferWithTexture(gl, width, height, texture) {
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
        console.error('[SlideRenderer createFramebufferWithTexture] Framebuffer not complete:', status);
        gl.deleteFramebuffer(fb);
        gl.deleteTexture(texture);
        return null;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return { framebuffer: fb, texture: texture };
}

// --- Text Drawing Helper (Updated to include fontFamily) ---
function drawWrappedText(ctx, text, x, y, maxWidth, maxHeight, fontFamily = 'Arial, sans-serif', fontSize, color, textAlign, lineHeightMultiplier = 1.2, dpr = 1) {
    if (!text || text.trim() === "") return;
    const scaledFontSize = fontSize * dpr; 
    const padding = x * dpr; 
    const logicalMaxWidth = maxWidth * dpr - (padding * 2); 
    const logicalMaxHeight = maxHeight * dpr - (padding * 2); 

    ctx.font = `${scaledFontSize}px ${fontFamily}`; // Apply fontFamily
    ctx.fillStyle = color;
    ctx.textBaseline = 'top'; 
    ctx.imageSmoothingEnabled = true;

    const lines = [];
    const paragraphs = text.split('\n');
    for (const paragraph of paragraphs) {
        const words = paragraph.split(' ');
        let currentLine = '';
        for (let n = 0; n < words.length; n++) {
            let testLine = currentLine + words[n];
            if (n < words.length - 1) testLine += ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > logicalMaxWidth && n > 0) {
                lines.push(currentLine.trimEnd());
                currentLine = words[n] + ' ';
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine.trimEnd());
    }

    const lineHeight = scaledFontSize * lineHeightMultiplier;
    let startY = padding; 

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (startY + lineHeight > maxHeight * dpr - padding && i < lines.length) break; 
        
        let drawX;
        const lineWidth = ctx.measureText(line).width;
        if (textAlign === 'center') drawX = padding + (logicalMaxWidth - lineWidth) / 2;
        else if (textAlign === 'right') drawX = padding + logicalMaxWidth - lineWidth;
        else drawX = padding; 

        ctx.fillText(line, drawX, startY);
        startY += lineHeight;
    }
}

const SlideRenderer = ({ slideData, canvasWidth, canvasHeight, onShaderError, selectedElementId, isSlideshowMode, designSlideWidth, designSlideHeight, t }) => { 
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const programsRef = useRef({ backgroundProgram: null, postProcessProgram: null, elementPrograms: {}, textElementProgram: null });
  const buffersRef = useRef({}); 
  const framebufferInfoRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const textTexturesRef = useRef({}); 
  const offscreenCanvasRef = useRef(null); 
  const dprRef = useRef(1);
  const loadedUserTexturesRef = useRef({}); 

  useEffect(() => {
    dprRef.current = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    if (!offscreenCanvasRef.current) offscreenCanvasRef.current = document.createElement('canvas');
  }, []);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl || gl.isContextLost() || !slideData || !slideData.uploadedTextures) return;
    const currentTextureIds = new Set(slideData.uploadedTextures.map(texture => texture.id));
    
    slideData.uploadedTextures.forEach(texData => {
      if (texData.dataUrl && !loadedUserTexturesRef.current[texData.id]) {
        const image = new Image();
        image.onload = () => {
          if (gl.isContextLost()) { return; }
          const glTexture = createAndSetupTexture(gl);
          gl.bindTexture(gl.TEXTURE_2D, glTexture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
          gl.bindTexture(gl.TEXTURE_2D, null);
          loadedUserTexturesRef.current[texData.id] = glTexture;
        };
        image.onerror = () => { onShaderError({ key: 'imageLoadError', params: { fileName: texData.name } }); }
        image.src = texData.dataUrl;
      }
    });

    Object.keys(loadedUserTexturesRef.current).forEach(loadedTextureId => {
      if (!currentTextureIds.has(loadedTextureId)) {
        gl.deleteTexture(loadedUserTexturesRef.current[loadedTextureId]);
        delete loadedUserTexturesRef.current[loadedTextureId];
      }
    });
  }, [slideData?.uploadedTextures, glRef, onShaderError, t]); 

  useEffect(() => {
    return () => {
      const gl = glRef.current;
      if (gl && !gl.isContextLost()) {
        Object.values(loadedUserTexturesRef.current).forEach(glTexture => gl.deleteTexture(glTexture));
        loadedUserTexturesRef.current = {};
      }
    };
  }, [glRef]);

  const setupGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) { onShaderError({ key: 'canvasNotFound' }); return false; }
    const currentDpr = dprRef.current;
    const actualWidth = Math.floor(canvasWidth * currentDpr);
    const actualHeight = Math.floor(canvasHeight * currentDpr);

    if (actualWidth <= 0 || actualHeight <= 0) { onShaderError({ key: 'invalidCanvasDimensions', params: { width: actualWidth, height: actualHeight } }); return false; }
    canvas.width = actualWidth; canvas.height = actualHeight;
    
    let gl = glRef.current;
    if (!gl || gl.isContextLost()) {
      gl = canvas.getContext('webgl', { preserveDrawingBuffer: false, antialias: true, premultipliedAlpha: false });
      if (!gl) { onShaderError({ key: 'webglNotSupported' }); return false; }
      glRef.current = gl;
    }
    if (!buffersRef.current.quadBuffer) {
      const quadVertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);
      buffersRef.current.quadBuffer = buffer;
    }
    if (!buffersRef.current.elementQuadUVBuffer) {
      const elementUVVertices = new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]);
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, elementUVVertices, gl.STATIC_DRAW);
      buffersRef.current.elementQuadUVBuffer = buffer;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    if (!framebufferInfoRef.current || framebufferInfoRef.current.width !== actualWidth || framebufferInfoRef.current.height !== actualHeight) {
      if (framebufferInfoRef.current) {
        gl.deleteFramebuffer(framebufferInfoRef.current.framebuffer);
        gl.deleteTexture(framebufferInfoRef.current.texture);
      }
      const sceneTexture = createAndSetupTexture(gl);
      const fbInfo = createFramebufferWithTexture(gl, actualWidth, actualHeight, sceneTexture);
      if (!fbInfo) { onShaderError({ key: 'framebufferCreateFailed', params: { width: actualWidth, height: actualHeight } }); return false; }
      framebufferInfoRef.current = {...fbInfo, width: actualWidth, height: actualHeight};
    }
    return true;
  }, [canvasWidth, canvasHeight, onShaderError, t]); 

  const compileShaders = useCallback(() => {
    const gl = glRef.current;
    if (!gl || gl.isContextLost() || !slideData) { onShaderError({ key: 'glContextNotReady' }); return false; }
    const cleanupProgram = (pInfo) => { if (pInfo?.program) gl.deleteProgram(pInfo.program); };
    cleanupProgram(programsRef.current.backgroundProgram);
    cleanupProgram(programsRef.current.postProcessProgram);
    cleanupProgram(programsRef.current.textElementProgram);
    Object.values(programsRef.current.elementPrograms).forEach(cleanupProgram);
    const newPrograms = { backgroundProgram: null, postProcessProgram: null, elementPrograms: {}, textElementProgram: null };
    let allCompiled = true;
    const compileAndStore = (vsSrc, fsSrc, attribs, uniforms, name) => {
      try {
        const vs = createShader(gl, gl.VERTEX_SHADER, vsSrc);
        const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSrc);
        const prog = createProgram(gl, vs, fs);
        gl.deleteShader(vs); gl.deleteShader(fs);
        return getProgramInfo(gl, prog, attribs, uniforms);
      } catch (e) {
        onShaderError({ key: 'shaderCompileError', params: { shaderName: name, errorMessage: e.message } });
        allCompiled = false;
        return null;
      }
    };
    newPrograms.backgroundProgram = compileAndStore(DEFAULT_VERTEX_SHADER, slideData.backgroundShader.fs, ['a_position'], ['u_resolution', 'u_time'], "Background");
    newPrograms.postProcessProgram = compileAndStore(DEFAULT_VERTEX_SHADER, slideData.postProcessShader.fs, ['a_position'], ['u_sceneTexture', 'u_resolution', 'u_time'], "PostProcess");
    newPrograms.textElementProgram = compileAndStore(DEFAULT_ELEMENT_VERTEX_SHADER, DEFAULT_TEXT_ELEMENT_FS, ['a_element_uv_position'], ['u_canvas_resolution', 'u_element_position_px', 'u_element_size_px', 'u_elementTexture'], "Text Element");
    slideData.elements.forEach(el => {
      if (el.type === 'glsl_shape' && el.materialShader?.fs) {
        const elUniforms = ['u_canvas_resolution', 'u_element_position_px', 'u_element_size_px', 'u_element_resolution_px', 'u_time', 'u_base_color',
                              'u_userTexture0', 'u_userTexture1', 'u_userTexture2', 
                              'u_userTexture0_bound', 'u_userTexture1_bound', 'u_userTexture2_bound'];
        const elProg = compileAndStore(DEFAULT_ELEMENT_VERTEX_SHADER, el.materialShader.fs, ['a_element_uv_position'], elUniforms, `Element ${el.id}`);
        if (elProg) newPrograms.elementPrograms[el.id] = elProg;
      }
    });
    programsRef.current = newPrograms; 
    if (allCompiled) onShaderError(null); // Clear error if all compiled
    return allCompiled;
  }, [slideData, onShaderError, t]);

  // --- updateTextTexture (Updated to use fontFamily from element) ---
  const updateTextTexture = useCallback((gl, element, displayScale) => { 
    if (!offscreenCanvasRef.current || element.width <= 0 || element.height <= 0) return null;
    const dpr = dprRef.current;
    const scaledDesignWidth = element.width * displayScale;
    const scaledDesignHeight = element.height * displayScale;
    const scaledDesignFontSize = element.fontSize * displayScale;

    const textureWidth = Math.max(1, Math.floor(scaledDesignWidth * dpr));
    const textureHeight = Math.max(1, Math.floor(scaledDesignHeight * dpr));

    const canvas = offscreenCanvasRef.current;
    if (canvas.width !== textureWidth || canvas.height !== textureHeight) { 
        canvas.width = textureWidth; 
        canvas.height = textureHeight; 
    }
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    const { fontFamily = 'Arial, sans-serif', color = '#FFFFFF', textAlign = 'left', text } = element; // Use element.fontFamily
    
    drawWrappedText(ctx, text, 5, 5, scaledDesignWidth, scaledDesignHeight, fontFamily, scaledDesignFontSize, color, textAlign, 1.2, dpr);
    
    let texInfo = textTexturesRef.current[element.id + (isSlideshowMode ? '_slideshow' : '')]; 
    const hash = JSON.stringify({text, width:scaledDesignWidth, height:scaledDesignHeight, fontSize: scaledDesignFontSize, fontFamily, color, textAlign, dpr});

    if (!texInfo || texInfo.width !== textureWidth || texInfo.height !== textureHeight || texInfo.dataHash !== hash) {
      if (texInfo) gl.deleteTexture(texInfo.texture); 
      const newTex = createAndSetupTexture(gl);
      textTexturesRef.current[element.id + (isSlideshowMode ? '_slideshow' : '')] = { texture: newTex, width: textureWidth, height: textureHeight, dataHash: hash };
      texInfo = textTexturesRef.current[element.id + (isSlideshowMode ? '_slideshow' : '')];
    }
    gl.bindTexture(gl.TEXTURE_2D, texInfo.texture);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); 
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texInfo.texture;
  }, [isSlideshowMode]); 

  const renderScene = useCallback((currentTime) => {
    const gl = glRef.current;
    if (!gl || gl.isContextLost() || !slideData || !framebufferInfoRef.current || !buffersRef.current.quadBuffer || !buffersRef.current.elementQuadUVBuffer) {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null; return;
    }
    
    const actualCanvasWidth_dpr = framebufferInfoRef.current.width;
    const actualCanvasHeight_dpr = framebufferInfoRef.current.height;

    if (actualCanvasWidth_dpr <= 0 || actualCanvasHeight_dpr <= 0) { animationFrameIdRef.current = requestAnimationFrame(renderScene); return; }
    const timeSeconds = currentTime * 0.001; 

    let contentScale = 1;
    let contentOffsetX_logical = 0;
    let contentOffsetY_logical = 0;

    if (designSlideWidth > 0 && designSlideHeight > 0) {
        const scaleToFitX = canvasWidth / designSlideWidth;   
        const scaleToFitY = canvasHeight / designSlideHeight; 
        contentScale = Math.min(scaleToFitX, scaleToFitY);

        const scaledContentWidth_logical = designSlideWidth * contentScale;
        const scaledContentHeight_logical = designSlideHeight * contentScale;

        contentOffsetX_logical = (canvasWidth - scaledContentWidth_logical) / 2; 
        contentOffsetY_logical = (canvasHeight - scaledContentHeight_logical) / 2; 
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferInfoRef.current.framebuffer);
    gl.viewport(0, 0, actualCanvasWidth_dpr, actualCanvasHeight_dpr);
    gl.clearColor(0.0, 0.0, 0.0, 0.0); 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 

    const bgProgInfo = programsRef.current.backgroundProgram;
    if (bgProgInfo?.program) {
      gl.useProgram(bgProgInfo.program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffersRef.current.quadBuffer);
      gl.enableVertexAttribArray(bgProgInfo.attributes.a_position);
      gl.vertexAttribPointer(bgProgInfo.attributes.a_position, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(bgProgInfo.uniforms.u_resolution, actualCanvasWidth_dpr, actualCanvasHeight_dpr);
      gl.uniform1f(bgProgInfo.uniforms.u_time, timeSeconds);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    gl.enable(gl.BLEND); 
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); 

    slideData.elements.forEach(element => {
      const designX = element.x;
      const designY = element.y;
      const designWidth = element.width;
      const designHeight = element.height;

      const finalElemX_logical = contentOffsetX_logical + (designX * contentScale);
      const finalElemY_logical = contentOffsetY_logical + (designY * contentScale);
      const finalElemWidth_logical = designWidth * contentScale;
      const finalElemHeight_logical = designHeight * contentScale;
      
      const elemX_dpr = finalElemX_logical * dprRef.current;
      const elemY_dpr = finalElemY_logical * dprRef.current;
      const elemWidth_dpr = finalElemWidth_logical * dprRef.current;
      const elemHeight_dpr = finalElemHeight_logical * dprRef.current;

      if (element.type === 'glsl_shape') {
        const elProgInfo = programsRef.current.elementPrograms[element.id];
        if (elProgInfo?.program) {
          gl.useProgram(elProgInfo.program);
          gl.bindBuffer(gl.ARRAY_BUFFER, buffersRef.current.elementQuadUVBuffer);
          gl.enableVertexAttribArray(elProgInfo.attributes.a_element_uv_position);
          gl.vertexAttribPointer(elProgInfo.attributes.a_element_uv_position, 2, gl.FLOAT, false, 0, 0);
          
          gl.uniform2f(elProgInfo.uniforms.u_canvas_resolution, actualCanvasWidth_dpr, actualCanvasHeight_dpr);
          gl.uniform2f(elProgInfo.uniforms.u_element_position_px, elemX_dpr, elemY_dpr);
          gl.uniform2f(elProgInfo.uniforms.u_element_size_px, elemWidth_dpr, elemHeight_dpr);
          gl.uniform2f(elProgInfo.uniforms.u_element_resolution_px, elemWidth_dpr, elemHeight_dpr); 
          
          gl.uniform1f(elProgInfo.uniforms.u_time, timeSeconds);
          const baseColor = Array.isArray(element.baseColor) && element.baseColor.length === 4 ? element.baseColor : hexToRgba(element.baseColor || '#FFFFFF', 1.0); 
          gl.uniform4fv(elProgInfo.uniforms.u_base_color, baseColor);
          for (let i = 0; i < 3; i++) {
            const uniformName = `u_userTexture${i}`;
            const boundUniformName = `${uniformName}_bound`;
            const textureId = element.textureBindings?.[uniformName];
            const glTexture = textureId ? loadedUserTexturesRef.current[textureId] : null;
            if (glTexture && elProgInfo.uniforms[uniformName]) {
              gl.activeTexture(gl.TEXTURE0 + i); 
              gl.bindTexture(gl.TEXTURE_2D, glTexture);
              gl.uniform1i(elProgInfo.uniforms[uniformName], i);
              if (elProgInfo.uniforms[boundUniformName]) gl.uniform1i(elProgInfo.uniforms[boundUniformName], 1); 
            } else {
              gl.activeTexture(gl.TEXTURE0 + i);
              gl.bindTexture(gl.TEXTURE_2D, null); 
              if (elProgInfo.uniforms[uniformName]) gl.uniform1i(elProgInfo.uniforms[uniformName], i); 
              if (elProgInfo.uniforms[boundUniformName]) gl.uniform1i(elProgInfo.uniforms[boundUniformName], 0); 
            }
          }
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
      } else if (element.type === 'text') { 
        if (!isSlideshowMode && element.id === selectedElementId) { 
            return; 
        }
        
        const textProgInfo = programsRef.current.textElementProgram;
        if (textProgInfo?.program && element.text?.trim() !== "") {
          const textTexture = updateTextTexture(gl, element, contentScale); 
          if (textTexture) {
            gl.useProgram(textProgInfo.program);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffersRef.current.elementQuadUVBuffer);
            gl.enableVertexAttribArray(textProgInfo.attributes.a_element_uv_position);
            gl.vertexAttribPointer(textProgInfo.attributes.a_element_uv_position, 2, gl.FLOAT, false, 0, 0);

            gl.uniform2f(textProgInfo.uniforms.u_canvas_resolution, actualCanvasWidth_dpr, actualCanvasHeight_dpr);
            gl.uniform2f(textProgInfo.uniforms.u_element_position_px, elemX_dpr, elemY_dpr);
            gl.uniform2f(textProgInfo.uniforms.u_element_size_px, elemWidth_dpr, elemHeight_dpr);
            
            gl.activeTexture(gl.TEXTURE0); 
            gl.bindTexture(gl.TEXTURE_2D, textTexture);
            gl.uniform1i(textProgInfo.uniforms.u_elementTexture, 0);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
          }
        }
      }
    });
    gl.disable(gl.BLEND);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null); 
    gl.viewport(0, 0, actualCanvasWidth_dpr, actualCanvasHeight_dpr); 
    const ppProgInfo = programsRef.current.postProcessProgram;
    if (ppProgInfo?.program) {
      gl.useProgram(ppProgInfo.program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, framebufferInfoRef.current.texture);
      gl.uniform1i(ppProgInfo.uniforms.u_sceneTexture, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffersRef.current.quadBuffer); 
      gl.enableVertexAttribArray(ppProgInfo.attributes.a_position);
      gl.vertexAttribPointer(ppProgInfo.attributes.a_position, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(ppProgInfo.uniforms.u_resolution, actualCanvasWidth_dpr, actualCanvasHeight_dpr);
      gl.uniform1f(ppProgInfo.uniforms.u_time, timeSeconds);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    } else { 
      gl.clearColor(0.1,0.1,0.1,1); gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, null); gl.bindTexture(gl.TEXTURE_2D, null);
    const error = gl.getError();
    if (error !== gl.NO_ERROR) {
      onShaderError({ key: 'webglRuntimeError', params: { errorCode: error } });
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null; return;
    }
    animationFrameIdRef.current = requestAnimationFrame(renderScene);
  }, [slideData, canvasWidth, canvasHeight, onShaderError, programsRef, updateTextTexture, loadedUserTexturesRef, selectedElementId, isSlideshowMode, designSlideWidth, designSlideHeight, t, dprRef.current]); 

  useEffect(() => {
    if (canvasWidth > 0 && canvasHeight > 0 && slideData) {
      let glIsSetup = false;
      if (!glRef.current || glRef.current.isContextLost() || (glRef.current.canvas.width !== Math.floor(canvasWidth * dprRef.current)) || (glRef.current.canvas.height !== Math.floor(canvasHeight * dprRef.current))) {
        if (setupGL()) glIsSetup = true;
        else { if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current); animationFrameIdRef.current = null; return; }
      } else glIsSetup = true;
      
      if (glIsSetup) {
        if (compileShaders()) { 
          if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
          animationFrameIdRef.current = requestAnimationFrame(renderScene); 
        } else { if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current); animationFrameIdRef.current = null; }
      }
    } else { if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current); animationFrameIdRef.current = null; }
    return () => { if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current); animationFrameIdRef.current = null; };
  }, [canvasWidth, canvasHeight, slideData, setupGL, compileShaders, renderScene, dprRef]); 

  useEffect(() => {
    const gl = glRef.current; if (!gl || gl.isContextLost()) return; 
    const currentElementIds = new Set(slideData.elements.map(el => el.id));
    Object.keys(textTexturesRef.current).forEach(id => {
      if (!currentElementIds.has(id.replace('_slideshow',''))) { 
        gl.deleteTexture(textTexturesRef.current[id].texture); 
        delete textTexturesRef.current[id]; 
      }
    });
    return () => { 
        if (gl && !gl.isContextLost()) {
            Object.values(textTexturesRef.current).forEach(ti => gl.deleteTexture(ti.texture));
            textTexturesRef.current = {};
        }
    };
  }, [slideData.elements, glRef]);

  return <canvas ref={canvasRef} style={{ display: 'block', position: 'absolute', top: 0, left: 0, zIndex: 0, width: `${canvasWidth}px`, height: `${canvasHeight}px` }} />;
};

const DraggableResizableElement = ({ children, data, onUpdate, onSelect, isSelected, slideBounds, minWidth = 50, minHeight = 30, elementType = "text", displayScale = 1 }) => {
    const elementRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
    const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 });
    const [parentBoundsInternal, setParentBoundsInternal] = useState({ left: 0, top: 0, width: typeof window !== 'undefined' ? window.innerWidth : 0, height: typeof window !== 'undefined' ? window.innerHeight : 0 });

    useEffect(() => {
      if (slideBounds === "parent" && elementRef.current?.parentElement) {
          setParentBoundsInternal(elementRef.current.parentElement.getBoundingClientRect());
      } else if (typeof window !== 'undefined') {
          setParentBoundsInternal({ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight });
      }
    }, [slideBounds, data.width, data.height, displayScale]); 

    const handleMouseDownDrag = (e) => {
        if (e.button !== 0) return; 
        if (e.target.closest('textarea, input, .CodeMirror, select, button')) { 
            if (elementType === "text" && isSelected && e.target.tagName === "TEXTAREA") {} else return;
        }
        e.stopPropagation(); onSelect(data.id); setIsDragging(true);
        setDragStartPos({ x: e.clientX / displayScale - data.x, y: e.clientY / displayScale - data.y });
    };

    const handleMouseDownResize = (e) => {
        if (e.button !== 0) return; e.stopPropagation(); onSelect(data.id); setIsResizing(true);
        setDragStartPos({ x: e.clientX, y: e.clientY });
        setResizeStartSize({ width: data.width, height: data.height });
    };

    const handleMouseMove = useCallback((e) => {
        if (isDragging) {
            let newDesignX = e.clientX / displayScale - dragStartPos.x;
            let newDesignY = e.clientY / displayScale - dragStartPos.y;

            if (slideBounds === "parent" && parentBoundsInternal.width > 0) { 
                const scaledElWidth = data.width * displayScale;
                const scaledElHeight = data.height * displayScale;
                let newScaledX = newDesignX * displayScale;
                let newScaledY = newDesignY * displayScale;

                newScaledX = Math.max(0, Math.min(newScaledX, parentBoundsInternal.width - scaledElWidth));
                newScaledY = Math.max(0, Math.min(newScaledY, parentBoundsInternal.height - scaledElHeight));
                
                newDesignX = newScaledX / displayScale;
                newDesignY = newScaledY / displayScale;
            }
            onUpdate(data.id, { x: newDesignX, y: newDesignY });

        } else if (isResizing) {
            const deltaMouseX = e.clientX - dragStartPos.x;
            const deltaMouseY = e.clientY - dragStartPos.y;

            const deltaDesignX = deltaMouseX / displayScale;
            const deltaDesignY = deltaMouseY / displayScale;

            let newDesignWidth = Math.max(minWidth, resizeStartSize.width + deltaDesignX);
            let newDesignHeight = Math.max(minHeight, resizeStartSize.height + deltaDesignY);

            if (slideBounds === "parent" && parentBoundsInternal.width > 0) {
                const elDesignX = data.x; 
                const elDesignY = data.y; 

                if ((elDesignX + newDesignWidth) * displayScale > parentBoundsInternal.width) {
                    newDesignWidth = (parentBoundsInternal.width / displayScale) - elDesignX;
                }
                if ((elDesignY + newDesignHeight) * displayScale > parentBoundsInternal.height) {
                    newDesignHeight = (parentBoundsInternal.height / displayScale) - elDesignY;
                }
                newDesignWidth = Math.max(minWidth, newDesignWidth);
                newDesignHeight = Math.max(minHeight, newDesignHeight);
            }
            onUpdate(data.id, { width: newDesignWidth, height: newDesignHeight });
        }
    }, [isDragging, isResizing, dragStartPos, resizeStartSize, data, onUpdate, minWidth, minHeight, parentBoundsInternal, slideBounds, displayScale]);
    
    const handleMouseUp = useCallback(() => { setIsDragging(false); setIsResizing(false); }, []);

    useEffect(() => {
        if (isDragging || isResizing) { 
            window.addEventListener('mousemove', handleMouseMove); 
            window.addEventListener('mouseup', handleMouseUp); 
        } else { 
            window.removeEventListener('mousemove', handleMouseMove); 
            window.removeEventListener('mouseup', handleMouseUp); 
        }
        return () => { 
            window.removeEventListener('mousemove', handleMouseMove); 
            window.removeEventListener('mouseup', handleMouseUp); 
        };
    }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

    const scaledX = data.x * displayScale;
    const scaledY = data.y * displayScale;
    const scaledWidth = data.width * displayScale;
    const scaledHeight = data.height * displayScale;

    return (
        <div ref={elementRef} style={{ 
                position: 'absolute', 
                left: `${scaledX}px`, 
                top: `${scaledY}px`, 
                width: `${scaledWidth}px`, 
                height: `${scaledHeight}px`,
                border: isSelected ? (elementType === 'text' ? '2px dashed #00aeff' : '2px dashed #ffae00') : '1px solid transparent',
                boxSizing: 'border-box', 
                cursor: isDragging ? 'grabbing' : (elementType === 'text' && isSelected ? 'default' : 'grab'), 
                zIndex: isSelected ? 11 : 10, 
                userSelect: 'none', 
            }}
            onMouseDown={handleMouseDownDrag} 
            onClick={(e) => { e.stopPropagation(); onSelect(data.id);}} 
        >
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, { displayScale });
                }
                return child;
            })}
            {isSelected && (
            <div style={{ 
                    position: 'absolute', 
                    right: -4, 
                    bottom: -4, 
                    width: '12px', 
                    height: '12px',
                    background: elementType === 'text' ? '#00aeff' : '#ffae00', 
                    border: '2px solid #fff',
                    borderRadius: '2px', 
                    cursor: 'nwse-resize', 
                    zIndex: 12 
                }}
                onMouseDown={handleMouseDownResize} 
            />
            )}
        </div>
    );
};

// --- TextElement (Updated to include font selection) ---
const TextElement = ({ data, onUpdate, onSelect, isSelected, slideBounds, displayScale, t }) => {
  const handleChange = (e) => { onUpdate(data.id, { text: e.target.value }); };
  const handleStyleChange = (property, value) => { 
      if (property === 'fontSize') { 
          onUpdate(data.id, { [property]: parseInt(value) });
      } else {
          onUpdate(data.id, { [property]: value }); 
      }
  };
  const textAreaRef = useRef(null);
  useEffect(() => { if (isSelected && textAreaRef.current) requestAnimationFrame(() => textAreaRef.current?.focus()); }, [isSelected]);
  
  const displayedFontSize = Math.max(8, (data.fontSize || 16) * displayScale); 
  const designFontSize = data.fontSize || 16;
  const currentFontFamily = data.fontFamily || 'Arial, sans-serif';

  const availableFonts = [
    'Arial, sans-serif',
    'Verdana, sans-serif',
    'Tahoma, sans-serif',
    'Trebuchet MS, sans-serif',
    'Times New Roman, serif',
    'Georgia, serif',
    'Garamond, serif',
    'Courier New, monospace',
    'Brush Script MT, cursive',
    'Comic Sans MS, cursive', 
    'Impact, fantasy',
    'Luminari, fantasy',
    'Helvetica Neue, sans-serif',
    'Roboto, sans-serif', 
    'Open Sans, sans-serif', 
    'Noto Sans JP, sans-serif', 
    'MS Gothic, sans-serif', 
    'Hiragino Kaku Gothic ProN, sans-serif', 
  ];

  return (
    <DraggableResizableElement data={data} onUpdate={onUpdate} onSelect={onSelect} isSelected={isSelected} slideBounds={slideBounds} minWidth={50} minHeight={30} elementType="text" displayScale={displayScale} >
      {isSelected && ( 
        <textarea ref={textAreaRef} value={data.text} onChange={handleChange} onMouseDown={(e)=>e.stopPropagation()} onClick={(e)=>e.stopPropagation()}
          style={{ 
            width: '100%', 
            height: '100%', 
            border: 'none', 
            background: 'rgba(255,255,255,0.15)', 
            color: data.color || '#000000', 
            outline: 'none', 
            resize: 'none', 
            textAlign: data.textAlign || 'center', 
            fontSize: `${displayedFontSize}px`, 
            fontFamily: currentFontFamily, 
            padding: `${5 * displayScale}px`, 
            boxSizing: 'border-box', 
            cursor: 'text', 
            overflowWrap: 'break-word', 
            whiteSpace: 'pre-wrap', 
            userSelect: 'text',
            lineHeight: `${1.2 * displayedFontSize}px`, 
         }} />
      )}
      {!isSelected && data.text && ( <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}></div> )}
      
      {isSelected && (
        <div style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', background: 'rgba(40,40,40,0.9)', padding: '5px 8px', borderRadius: '6px', zIndex: 20, display: 'flex', gap: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', alignItems: 'center' }}
            onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} >
          <input type="color" value={data.color || '#FFFFFF'} onChange={(e) => handleStyleChange('color', e.target.value)} title={t('textColorTitle')} style={{height: '28px', width: '28px', border: '1px solid #555', borderRadius: '4px', cursor: 'pointer', background: 'transparent', padding: '2px'}} />
          <input type="number" value={designFontSize} onChange={(e) => handleStyleChange('fontSize', e.target.value)} min="8" max="120" title={t('fontSizeDesignTitle')} style={{width: '60px', height: '28px', border: '1px solid #555', borderRadius: '4px', background: '#333', color: '#fff', paddingLeft: '8px', textAlign: 'center'}}/>
          <select 
            value={currentFontFamily} 
            onChange={(e) => handleStyleChange('fontFamily', e.target.value)} 
            title={t('fontFamilyTitle')}
            style={{height: '28px', border: '1px solid #555', borderRadius: '4px', background: '#333', color: '#fff', padding: '0 5px', maxWidth: '120px', fontSize: '0.8em'}}
          >
            {availableFonts.map(font => (
              <option key={font} value={font}>{font.split(',')[0]}</option>
            ))}
          </select>
        </div>
      )}
    </DraggableResizableElement>
  );
};

const GlslShapeElement = ({ data, onUpdate, onSelect, isSelected, slideBounds, availableTextures, displayScale, t }) => {
    const handleBaseColorChange = (hexColor) => {
        const currentAlpha = (Array.isArray(data.baseColor) && data.baseColor.length === 4) ? data.baseColor[3] : 1.0;
        onUpdate(data.id, { baseColor: hexToRgba(hexColor, currentAlpha) });
    };
    const handleAlphaChange = (alphaValue) => {
        const currentBase = Array.isArray(data.baseColor) ? data.baseColor : hexToRgba(data.baseColor || '#FFFFFF', 1.0);
        onUpdate(data.id, { baseColor: [currentBase[0], currentBase[1], currentBase[2], parseFloat(alphaValue)] });
    };
    const handleTextureBindingChange = (uniformName, textureId) => {
        onUpdate(data.id, {
            textureBindings: {
                ...(data.textureBindings || {}),
                [uniformName]: textureId === "null" ? null : textureId,
            }
        });
    };

    const displayColor = Array.isArray(data.baseColor) ? 
        `#${Math.round(data.baseColor[0]*255).toString(16).padStart(2,'0')}${Math.round(data.baseColor[1]*255).toString(16).padStart(2,'0')}${Math.round(data.baseColor[2]*255).toString(16).padStart(2,'0')}`
        : (data.baseColor || '#FFFFFF'); 
    const displayAlpha = Array.isArray(data.baseColor) && data.baseColor.length === 4 ? data.baseColor[3] : 1.0;
    
    const textureUniformNames = ['u_userTexture0', 'u_userTexture1', 'u_userTexture2'];

    return (
        <DraggableResizableElement data={data} onUpdate={onUpdate} onSelect={onSelect} isSelected={isSelected} slideBounds={slideBounds} minWidth={20} minHeight={20} elementType="glsl_shape" displayScale={displayScale}>
            <div style={{width: '100%', height: '100%', pointerEvents: 'none'}}></div>
             {isSelected && (
                <div style={{ position: 'absolute', top: -75, left: '50%', transform: 'translateX(-50%)', background: 'rgba(40,40,40,0.95)', padding: '8px', borderRadius: '6px', zIndex: 20, display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', alignItems: 'stretch' }}
                    onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} >
                    <div style={{display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center'}}>
                        <span style={{color: '#ccc', fontSize: '0.8em'}}>{t('baseLabel')}</span>
                        <input type="color" value={displayColor} onChange={(e) => handleBaseColorChange(e.target.value)} title={t('baseColorRGBTitle')} style={{height: '28px', width: '28px', border: '1px solid #555', borderRadius: '4px', cursor: 'pointer', background: 'transparent', padding: '2px'}} />
                        <span style={{color: '#ccc', fontSize: '0.8em', marginLeft:'5px'}}>{t('alphaLabel')}</span>
                        <input type="range" min="0" max="1" step="0.01" value={displayAlpha} onChange={(e) => handleAlphaChange(e.target.value)} title={t('baseColorAlphaTitle')} style={{cursor: 'pointer', width: '70px'}}/>
                    </div>
                    {textureUniformNames.map((uniformName) => (
                        <div key={uniformName} style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                            <label htmlFor={`${data.id}-${uniformName}`} style={{color: '#bbb', fontSize: '0.75em', minWidth: '85px'}}>{uniformName}:</label>
                            <select
                                id={`${data.id}-${uniformName}`}
                                value={data.textureBindings?.[uniformName] || "null"}
                                onChange={(e) => handleTextureBindingChange(uniformName, e.target.value)}
                                style={{flexGrow: 1, background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '3px', fontSize: '0.75em', padding: '3px'}}
                            >
                                <option value="null">{t('noTextureOption')}</option>
                                {availableTextures && availableTextures.map(tex => (
                                    <option key={tex.id} value={tex.id}>{tex.name.length > 15 ? tex.name.substring(0,12) + '...' : tex.name}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            )}
        </DraggableResizableElement>
    );
};

const GLEditorPanel = ({ panelKey, title, shaderCode, onShaderCodeChange, currentHeight, onHeightChange, disabled = false, t }) => {
  const [isResizing, setIsResizing] = useState(false);
  const initialDragInfoRef = useRef({ y: 0, height: 0 });
  const MIN_PANEL_HEIGHT = 80; 
  const MAX_PANEL_HEIGHT = 600; 

  const glslExtension = [glsl()];
  const indentExtension = indentUnit.of("    ");
  const RESIZE_HANDLE_HEIGHT = 10; 

  const handleResizeMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation(); 
    setIsResizing(true);
    initialDragInfoRef.current = { y: e.clientY, height: currentHeight };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const deltaY = e.clientY - initialDragInfoRef.current.y;
      let newHeight = initialDragInfoRef.current.height + deltaY;
      newHeight = Math.max(MIN_PANEL_HEIGHT, Math.min(newHeight, MAX_PANEL_HEIGHT));
      onHeightChange(panelKey, newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
  }, [isResizing, panelKey, onHeightChange]); 

  if (typeof CodeMirror === 'undefined') {
    return (
      <div style={{
        marginBottom: '12px', border: '1px solid #4a4a4a', borderRadius: '6px',
        background: '#33363a', opacity: disabled ? 0.6 : 1,
        height: `${currentHeight}px`, position: 'relative', display: 'flex', flexDirection: 'column',
      }}>
        <h4 style={{ margin:'10px', paddingBottom: '10px', borderBottom: '1px solid #4f5357', color: '#c0c0c0', fontSize: '0.95em', fontWeight: '600', flexShrink: 0 }}>{title}</h4>
        <p style={{color: 'red', flexShrink: 0, margin: '0 10px 5px 10px'}}>{t('codeMirrorNotLoaded')}</p>
        <div style={{flexGrow: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '0 10px 5px 10px' }}>
            <textarea
              value={shaderCode}
              onChange={(e) => onShaderCodeChange(e.target.value)}
              style={{ width: '100%', flexGrow: 1, background: '#252525', color: 'white', border: '1px solid #454545', boxSizing: 'border-box', resize:'none' }}
              disabled={disabled}
            />
        </div>
        {!disabled && (
          <div
            onMouseDown={handleResizeMouseDown}
            style={{
              height: `${RESIZE_HANDLE_HEIGHT}px`, cursor: 'ns-resize', background: '#222528',
              borderTop: '1px solid #4f5357', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0, userSelect: 'none',
            }}
          >
            <div style={{ width: '30px', height: '2px', background: '#5c5f62', borderRadius: '1px' }}></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      marginBottom: '12px',
      border: '1px solid #2c2c2c',
      borderRadius: '6px',
      background: disabled ? '#383b3e' : '#33363a',
      opacity: disabled ? 0.6 : 1,
      height: `${currentHeight}px`,
      position: 'relative', 
      display: 'flex',
      flexDirection: 'column',
    }}>
      <h4 style={{ 
          margin: '10px 10px 0 10px', 
          paddingBottom: '10px', 
          borderBottom: '1px solid #4f5357', 
          color: '#d0d0d0', 
          fontSize: '0.95em', 
          fontWeight: '600', 
          flexShrink: 0 
      }}>{title}</h4>
      
      <div style={{ 
          flexGrow: 1, 
          overflowY: 'auto', 
          padding: '5px 10px 0px 10px' 
      }}>
        <CodeMirror
          value={shaderCode}
          height="100%" 
          extensions={[glslExtension, indentExtension]}
          onChange={(val) => onShaderCodeChange(val)}
          theme="dark"
          readOnly={disabled}
          basicSetup={{ foldGutter: false, dropCursor: false, allowMultipleSelections: false, indentOnInput: false, lineNumbers: true, highlightActiveLineGutter: true, highlightActiveLine: true }}
        />
      </div>

      {!disabled && (
        <div
          onMouseDown={handleResizeMouseDown}
          style={{
            height: `${RESIZE_HANDLE_HEIGHT}px`,
            cursor: 'ns-resize',
            background: '#222528',
            borderTop: '1px solid #4f5357',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            userSelect: 'none',
          }}
        >
          <div style={{ width: '30px', height: '2px', background: '#5c5f62', borderRadius: '1px' }}></div>
        </div>
      )}
    </div>
  );
};


const createNewSlide = () => ({
  id: `slide_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, 
  backgroundShader: { fs: DEFAULT_BACKGROUND_FS },
  postProcessShader: { fs: DEFAULT_POST_PROCESS_FS },
  elements: [], 
  uploadedTextures: [], 
});

const hexToRgba = (hex, alpha = 1.0) => { 
    if (!hex) return [1,1,1,alpha]; let c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split(''); if(c.length== 3) c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        c= '0x'+c.join(''); return [(c>>16&255)/255, (c>>8&255)/255, (c&255)/255, alpha];
    }
    if (Array.isArray(hex) && hex.length >= 3) { const newAlpha = (hex.length === 4 && typeof hex[3] === 'number') ? hex[3] : alpha; return [hex[0], hex[1], hex[2], newAlpha]; }
    console.warn('[hexToRgba] Invalid hex color:', hex, 'defaulting to white with alpha', alpha); return [1,1,1,alpha]; 
}

const DESIGN_WIDTH = 1280; 
const DESIGN_HEIGHT = 720; 
const SLIDE_ASPECT_RATIO = DESIGN_WIDTH / DESIGN_HEIGHT;
const MIN_EDITOR_WIDTH = 300; 
const MAX_EDITOR_WIDTH = 800; 
const MAX_HISTORY_LENGTH = 20; // Max undo steps

const App = () => {
  const [language, setLanguage] = useState('JP');
  const [slides, setSlides] = useState([createNewSlide()]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [shaderError, setShaderError] = useState("");
  const [notification, setNotification] = useState(""); 
  const canvasOuterContainerRef = useRef(null);
  const slideWrapperRef = useRef(null); 
  const [slideWrapperSize, setSlideWrapperSize] = useState({width: 0, height: 0});
  const fileInputRef = useRef(null); 
  const importFileRef = useRef(null); 
  const [isSlideshowMode, setIsSlideshowMode] = useState(false); 
  const [editorWidth, setEditorWidth] = useState(400); 
  const [isResizingEditor, setIsResizingEditor] = useState(false);
  const initialDragXRef = useRef(0);
  const [editorPanelHeights, setEditorPanelHeights] = useState({
    bg: 120,
    pp: 120,
    el: 240, 
  });
  const [exportFilename, setExportFilename] = useState(translations.JP.defaultExportFilename);
  const [copiedElement, setCopiedElement] = useState(null); 
  const [history, setHistory] = useState([]); // For Undo

  const t = useCallback((key, params = {}) => {
    let langToUse = language;
    if (!translations[langToUse]) {
        langToUse = 'EN'; 
    }
    let str = translations[langToUse][key] || translations['EN'][key] || key; 
    for (const param in params) {
      str = str.replace(new RegExp(`{${param}}`, 'g'), params[param]);
    }
    return str;
  }, [language]);

  const showNotification = useCallback((messageKey) => {
    const message = t(messageKey);
    setNotification(message);
    setTimeout(() => setNotification(""), 2000);
  }, [t]); 

  const recordHistory = useCallback(() => {
    setHistory(prevHistory => {
      const currentSnapshot = {
        slides: JSON.parse(JSON.stringify(slides)), 
        currentPageIndex,
        selectedElementId,
      };
      const newHistory = [...prevHistory, currentSnapshot];
      if (newHistory.length > MAX_HISTORY_LENGTH) {
        return newHistory.slice(newHistory.length - MAX_HISTORY_LENGTH);
      }
      return newHistory;
    });
  }, [slides, currentPageIndex, selectedElementId]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) {
      showNotification('nothingToUndoNotification');
      return;
    }
    const previousState = history[history.length - 1];
    setSlides(previousState.slides);
    setCurrentPageIndex(previousState.currentPageIndex);
    setSelectedElementId(previousState.selectedElementId);
    setHistory(prevHistory => prevHistory.slice(0, -1));
    showNotification('undoNotification');
  }, [history, showNotification]);

  // goToPage must be defined before the useEffect that uses it.
  const goToPage = useCallback((i) => { 
    if (i >= 0 && i < slides.length) { 
      setCurrentPageIndex(i); 
      setSelectedElementId(null); 
      setShaderError(""); 
    }
  }, [slides.length]);

  useEffect(() => {
    setExportFilename(prevFilename => {
        const currentDefault = t('defaultExportFilename');
        const oldDefaultJP = translations.JP.defaultExportFilename;
        const oldDefaultEN = translations.EN.defaultExportFilename;

        if (prevFilename === oldDefaultJP || prevFilename === oldDefaultEN) {
            return currentDefault;
        }
        return prevFilename; 
    });
  }, [language, t]);

  const toggleLanguage = () => {
    setLanguage(prevLang => prevLang === 'JP' ? 'EN' : 'JP');
  };

  const currentSlide = slides[currentPageIndex];

  useEffect(() => {
    const calculateAndSetSizes = () => {
        let availableWidth, availableHeight;
        let newWrapperWidth, newWrapperHeight;

        if (isSlideshowMode) {
            availableWidth = window.innerWidth;
            availableHeight = window.innerHeight;
        } else {
            if (canvasOuterContainerRef.current) {
                availableWidth = canvasOuterContainerRef.current.offsetWidth;
                availableHeight = canvasOuterContainerRef.current.offsetHeight;
            } else {
                setSlideWrapperSize(p => (p.width !== 0 || p.height !== 0) ? { width: 0, height: 0 } : p);
                return;
            }
        }

        if (availableWidth <= 10 || availableHeight <= 10) {
            setSlideWrapperSize(p => (p.width !== 0 || p.height !== 0) ? { width: 0, height: 0 } : p);
            return;
        }

        newWrapperWidth = availableWidth;
        newWrapperHeight = availableWidth / SLIDE_ASPECT_RATIO;

        if (newWrapperHeight > availableHeight) {
            newWrapperHeight = availableHeight;
            newWrapperWidth = availableHeight * SLIDE_ASPECT_RATIO;
        }

        newWrapperWidth = Math.max(10, Math.floor(newWrapperWidth));
        newWrapperHeight = Math.max(10, Math.floor(newWrapperHeight));
        
        if (slideWrapperSize.width !== newWrapperWidth || slideWrapperSize.height !== newWrapperHeight) {
            setSlideWrapperSize({ width: newWrapperWidth, height: newWrapperHeight });
        }
    };

    calculateAndSetSizes(); 
    window.addEventListener('resize', calculateAndSetSizes);
    
    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined' && canvasOuterContainerRef.current && !isSlideshowMode) {
        resizeObserver = new ResizeObserver(calculateAndSetSizes);
        resizeObserver.observe(canvasOuterContainerRef.current);
    }
    
    return () => { 
        window.removeEventListener('resize', calculateAndSetSizes);
        if (resizeObserver && canvasOuterContainerRef.current && !isSlideshowMode) { 
             resizeObserver.unobserve(canvasOuterContainerRef.current);
        }
        resizeObserver?.disconnect();
    };
  }, [isSlideshowMode, slideWrapperSize.width, slideWrapperSize.height, editorWidth]); 


  useEffect(() => {
    if (!isSlideshowMode) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        goToPage(Math.min(slides.length - 1, currentPageIndex + 1));
      } else if (e.key === 'ArrowLeft') {
        goToPage(Math.max(0, currentPageIndex - 1));
      } else if (e.key === 'Escape') {
        setIsSlideshowMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => { window.removeEventListener('keydown', handleKeyDown); };
  }, [isSlideshowMode, currentPageIndex, slides.length, goToPage]); 

  const handleEditorResizeMouseDown = (e) => {
    e.preventDefault();
    setIsResizingEditor(true);
    initialDragXRef.current = e.clientX - editorWidth;
  };

  useEffect(() => {
    const handleEditorResizeMouseMove = (e) => {
      if (!isResizingEditor) return;
      let newWidth = e.clientX - initialDragXRef.current;
      newWidth = Math.max(MIN_EDITOR_WIDTH, Math.min(newWidth, MAX_EDITOR_WIDTH));
      newWidth = Math.min(newWidth, window.innerWidth - 200); 
      setEditorWidth(newWidth);
    };

    const handleEditorResizeMouseUp = () => {
      setIsResizingEditor(false);
    };

    if (isResizingEditor) {
      window.addEventListener('mousemove', handleEditorResizeMouseMove);
      window.addEventListener('mouseup', handleEditorResizeMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleEditorResizeMouseMove);
      window.removeEventListener('mouseup', handleEditorResizeMouseUp);
    };
  }, [isResizingEditor]);

  const handleEditorPanelHeightChange = (panelKey, newHeight) => {
    setEditorPanelHeights(prevHeights => ({
      ...prevHeights,
      [panelKey]: newHeight,
    }));
  };

  const addPage = useCallback(() => { 
    recordHistory(); 
    const newSlide = createNewSlide();
    const newSlides = [...slides];
    newSlides.splice(currentPageIndex + 1, 0, newSlide);
    setSlides(newSlides); 
    setCurrentPageIndex(currentPageIndex + 1); 
    setSelectedElementId(null); 
    setShaderError(""); 
  }, [slides, currentPageIndex, recordHistory]); 

  const deletePage = useCallback(() => {
    if (slides.length <= 1) {
      setShaderError(t('cannotDeleteLastPageMessage'));
      return;
    }
    if (window.confirm(t('confirmDeletePageMessage'))) {
      recordHistory(); 
      const newSlides = slides.filter((_, index) => index !== currentPageIndex);
      setSlides(newSlides);
      setCurrentPageIndex(prevIndex => Math.max(0, Math.min(prevIndex, newSlides.length - 1)));
      setSelectedElementId(null);
      setShaderError("");
    }
  }, [slides, currentPageIndex, t, recordHistory]); 

  const handleImageUpload = useCallback((event) => {
    if (!currentSlide) return;
    recordHistory(); 
    const files = Array.from(event.target.files);
    const currentTextureCount = currentSlide.uploadedTextures.length;
    const availableSlots = 3 - currentTextureCount;

    if (files.length === 0) return;
    if (files.length > availableSlots) {
        setShaderError(t('maxTexturesError', { availableSlots }));
        if(fileInputRef.current) fileInputRef.current.value = "";
        return;
    }

    files.slice(0, availableSlots).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const newTexture = {
                id: `tex_${Date.now()}_${Math.random().toString(36).substr(2,5)}`,
                name: file.name,
                dataUrl: e.target.result,
            };
            setSlides(prevSlides => prevSlides.map((slide, index) => 
                index === currentPageIndex 
                ? { ...slide, uploadedTextures: [...slide.uploadedTextures, newTexture].slice(0, 3) } 
                : slide
            ));
        };
        reader.readAsDataURL(file);
    });
    if(fileInputRef.current) fileInputRef.current.value = "";
  }, [currentSlide, recordHistory, t, currentPageIndex]); 

  const handleDeleteTexture = useCallback((textureId) => {
    if (!currentSlide) return;
    recordHistory(); 
    setSlides(prevSlides => prevSlides.map((slide, index) => {
        if (index === currentPageIndex) {
            const newElements = slide.elements.map(el => {
                if (el.type === 'glsl_shape' && el.textureBindings) {
                    const newBindings = { ...el.textureBindings };
                    let changed = false;
                    Object.keys(newBindings).forEach(key => {
                        if (newBindings[key] === textureId) {
                            newBindings[key] = null;
                            changed = true;
                        }
                    });
                    return changed ? { ...el, textureBindings: newBindings } : el;
                }
                return el;
            });
            return { 
                ...slide, 
                elements: newElements,
                uploadedTextures: slide.uploadedTextures.filter(t => t.id !== textureId) 
            };
        }
        return slide;
    }));
  }, [currentSlide, recordHistory, currentPageIndex]); 

  const addElement = useCallback((type, elementData = null) => {
    const baseWidth = DESIGN_WIDTH;
    const baseHeight = DESIGN_HEIGHT;

    if (!currentSlide || baseWidth <= 10 || baseHeight <= 10) { 
        setShaderError(t('addElementErrorCanvasNotReady', { baseWidth, baseHeight })); 
        return; 
    }
    recordHistory(); 
    setShaderError(""); 
    const newId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2,5)}`;
    
    let newEl;
    if (elementData) { 
        newEl = {
            ...elementData, 
            id: newId,      
            x: (elementData.x || 0) + 20, 
            y: (elementData.y || 0) + 20,
        };
    } else { 
        const defW_ratio = type === 'text' ? 0.25 : 0.2; 
        const defH_ratio = type === 'text' ? 0.1 : 0.2;  
        const defW_px = Math.max(50, Math.min(type==='text'?320:250, baseWidth * defW_ratio)); 
        const defH_px = Math.max(30, Math.min(type==='text'?70:140, baseHeight * defH_ratio));

        let specifics = {};
        if (type === 'text') {
          specifics = { 
            text: t('newTextDefault'), 
            fontSize: Math.max(12,Math.min(36,Math.floor(baseHeight/20))), 
            color: '#FFFFFF', 
            textAlign: 'center', 
            fontFamily: 'Verdana, sans-serif' 
          };
        } else if (type === 'glsl_shape') {
          specifics = { 
            materialShader: { fs: DEFAULT_ELEMENT_MATERIAL_FS }, 
            baseColor: [1,0,1,1], 
            textureBindings: { u_userTexture0: null, u_userTexture1: null, u_userTexture2: null } 
          };
        }
        
        newEl = { 
            id: newId, 
            type, 
            x: Math.max(5,(baseWidth-defW_px)/2)+(Math.random()*20-10), 
            y: Math.max(5,(baseHeight-defH_px)/2)+(Math.random()*20-10), 
            width: defW_px, 
            height: defH_px, 
            ...specifics 
        };
    }
    setSlides(s => s.map((sl,i) => i===currentPageIndex ? {...sl, elements:[...sl.elements,newEl]} : sl));
    setSelectedElementId(newId);
    if (elementData) showNotification('pastedElementNotification');
  }, [currentSlide, t, recordHistory, currentPageIndex, showNotification]); 

  const updateElement = useCallback((id, updates) => {
    recordHistory(); 
    setSlides(s => s.map((sl,i) => i===currentPageIndex ? {...sl, elements: sl.elements.map(el => el.id===id ? {...el,...updates} : el)} : sl));
  }, [currentPageIndex, recordHistory]); 

  const handleShaderError = useCallback((errorInfo) => {
    if (!errorInfo) {
        setShaderError("");
        return;
    }
    if (typeof errorInfo === 'string') {
      setShaderError(errorInfo);
    } else if (errorInfo && errorInfo.key) {
      setShaderError(t(errorInfo.key, errorInfo.params));
    } else {
      setShaderError(t('unknownError'));
    }
  }, [t]); 

  const handleBgShaderChange = useCallback((fs) => {
    recordHistory();
    setSlides(s=>s.map((sl,i)=>i===currentPageIndex?{...sl,backgroundShader:{...sl.backgroundShader,fs}}:sl));
  }, [currentPageIndex, recordHistory]); 

  const handlePpShaderChange = useCallback((fs) => {
    recordHistory();
    setSlides(s=>s.map((sl,i)=>i===currentPageIndex?{...sl,postProcessShader:{...sl.postProcessShader,fs}}:sl));
  }, [currentPageIndex, recordHistory]); 

  const handleElMatShaderChange = useCallback((fs) => {
    if (!selectedElementId || !currentSlide) return;
    recordHistory();
    setSlides(s=>s.map((sl,i)=>i===currentPageIndex?{...sl,elements:sl.elements.map(el=>el.id===selectedElementId&&el.type==='glsl_shape'?{...el,materialShader:{...(el.materialShader||{}),fs}}:el)}:sl));
  }, [currentPageIndex, recordHistory, selectedElementId, currentSlide]); 

  const selectedElement = currentSlide?.elements.find(el => el.id === selectedElementId);

  const handleCanvasClick = (e) => {
      if (isSlideshowMode) return; 
      if (slideWrapperRef.current && (e.target === canvasOuterContainerRef.current || e.target === slideWrapperRef.current)) setSelectedElementId(null);
      else if (slideWrapperRef.current?.contains(e.target)) {
          let tgt = e.target; let isInteractive = false;
          while(tgt && tgt !== slideWrapperRef.current && tgt !== document.body) {
              const z = window.getComputedStyle(tgt).zIndex;
              if (['10','11','12','20'].includes(z) || ['TEXTAREA','INPUT','BUTTON','SELECT'].includes(tgt.tagName) || tgt.closest('.CodeMirror')) { isInteractive=true; break; }
              tgt = tgt.parentElement;
          }
          if (!isInteractive) setSelectedElementId(null);
      }
  };

  const deleteSelectedElement = useCallback(() => {
    if (!selectedElementId) return;
    recordHistory(); 
    setSlides(s=>s.map((sl,i)=>i===currentPageIndex?{...sl,elements:sl.elements.filter(el=>el.id!==selectedElementId)}:sl));
    setSelectedElementId(null); setShaderError(""); 
  }, [selectedElementId, currentPageIndex, recordHistory]);

  // --- Keyboard Shortcuts (Copy, Paste, Delete, Undo) ---
  useEffect(() => {
    if (isSlideshowMode) return; 
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.closest('.CodeMirror'));

      if (e.ctrlKey || e.metaKey) { 
        if (e.key === 'c' || e.key === 'C') { 
          if (selectedElementId && currentSlide) {
            const elementToCopy = currentSlide.elements.find(el => el.id === selectedElementId);
            if (elementToCopy) {
              const { id, ...copyData } = JSON.parse(JSON.stringify(elementToCopy));
              setCopiedElement(copyData);
              showNotification('copiedElementNotification');
              e.preventDefault(); 
            }
          }
        } else if (e.key === 'v' || e.key === 'V') { 
          if (copiedElement && currentSlide) {
            addElement(copiedElement.type, copiedElement); 
            e.preventDefault(); 
          }
        } else if (e.key === 'z' || e.key === 'Z') { 
            if (!isInputFocused) { 
                e.preventDefault();
                handleUndo();
            }
        }
      } else if ((e.key==='Delete'||e.key==='Backspace') && selectedElementId && !isInputFocused) {
        e.preventDefault(); deleteSelectedElement();
      }
    };
    window.addEventListener('keydown', handleKeyDown); 
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, deleteSelectedElement, isSlideshowMode, currentSlide, copiedElement, addElement, showNotification, handleUndo, recordHistory]); 


  const handleExportData = () => {
    const dataToExport = slides.map(slide => {
        return {
            ...slide,
            uploadedTextures: slide.uploadedTextures.map(texture => ({ 
                id: texture.id, 
                name: texture.name, 
                dataUrl: texture.dataUrl 
            })),
        };
    });
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const finalFilename = exportFilename.endsWith('.json') ? exportFilename : `${exportFilename}.json`;
    a.download = finalFilename; 
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShaderError(t('exportSuccess')); 
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setShaderError(t('importErrorNoFile'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (!Array.isArray(importedData)) {
          throw new Error(t('importErrorNotArray'));
        }
        
        recordHistory(); 
        const validatedSlides = importedData.map(slide => ({
          id: slide.id || `imported_slide_${Date.now()}_${Math.random().toString(36).substr(2,5)}`,
          backgroundShader: slide.backgroundShader || { fs: DEFAULT_BACKGROUND_FS },
          postProcessShader: slide.postProcessShader || { fs: DEFAULT_POST_PROCESS_FS },
          elements: slide.elements || [],
          uploadedTextures: (slide.uploadedTextures || []).map(texture => ({
              id: texture.id || `imported_tex_${Date.now()}_${Math.random().toString(36).substr(2,5)}`, 
              name: texture.name || 'Unnamed Imported Texture',
              dataUrl: texture.dataUrl || null 
          })),
        }));

        setSlides(validatedSlides.length > 0 ? validatedSlides : [createNewSlide()]); 
        setCurrentPageIndex(0);
        setSelectedElementId(null);
        setShaderError(t('importSuccess')); 
        setHistory([]); 
      } catch (error) {
        console.error("Import error:", error);
        setShaderError(t('importErrorGeneric', { message: error.message }));
      }
    };
    reader.onerror = () => {
        setShaderError(t('importFileReadError'));
    }
    reader.readAsText(file);
    if (importFileRef.current) importFileRef.current.value = ""; 
  };


  const btnStyle = { padding:'8px 15px', background:'linear-gradient(145deg, #58a6ff, #3a8eff)', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'0.9em', fontWeight:'500', transition:'all 0.2s ease', boxShadow:'0 2px 4px rgba(0,0,0,0.2)', margin:'0 5px' };
  const hoverStyle = { background:'linear-gradient(145deg, #6bb0ff, #4a9eff)', boxShadow:'0 4px 8px rgba(0,0,0,0.3)'};
  const deleteBtnStyle = { ...btnStyle, background: 'linear-gradient(145deg, #dc3545, #c82333)'};
  const deleteBtnHoverStyle = { background: 'linear-gradient(145deg, #e04b59, #d33a48)', boxShadow: hoverStyle.boxShadow };


  const rendererWidth = slideWrapperSize.width;
  const rendererHeight = slideWrapperSize.height;
  
  const displayScale = DESIGN_WIDTH > 0 && slideWrapperSize.width > 0 
                     ? slideWrapperSize.width / DESIGN_WIDTH 
                     : 1;

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif', background: '#1e1e1e', color: '#ccc', userSelect: isResizingEditor ? 'none' : 'auto' }}>
      {notification && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0, 123, 255, 0.9)', color: 'white', padding: '10px 20px',
          borderRadius: '5px', zIndex: 2000, boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          fontSize: '0.9em'
        }}>
          {notification}
        </div>
      )}

      <div style={{ 
            width: isSlideshowMode ? '0px' : `${editorWidth}px`, 
            minWidth: isSlideshowMode ? '0px' : `${MIN_EDITOR_WIDTH}px`,
            padding: isSlideshowMode ? '0' : '20px', 
            background: '#2a2d31' , 
            color: '#ccc', 
            overflowY: 'auto', 
            overflowX: 'hidden',
            borderRight: isSlideshowMode ? 'none' : '1px solid #3c3f41', 
            display: isSlideshowMode ? 'none' : 'flex', 
            flexDirection: 'column', 
            boxShadow: '3px 0 10px rgba(0,0,0,0.2)',
            position: 'relative', 
            flexShrink: 0, 
        }}>
        
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
            <h2 style={{textAlign: 'left', margin: '0', color: '#58a6ff', fontSize: '1.6em', fontWeight: '600', flexGrow: 1 }}>{t('glslSlides')}</h2>
            <button 
                onClick={toggleLanguage}
                style={{...btnStyle, padding: '6px 10px', fontSize: '0.8em', background: '#4A5568', marginLeft: '10px'}}
                onMouseOver={e=>{e.currentTarget.style.background='#2D3748';e.currentTarget.style.boxShadow=hoverStyle.boxShadow;}}
                onMouseOut={e=>{e.currentTarget.style.background='#4A5568';e.currentTarget.style.boxShadow=btnStyle.boxShadow;}}
            >
                {language === 'JP' ? t('switchToEnglish') : t('switchToJapanese')}
            </button>
        </div>
        <div style={{borderBottom: '1px solid #3c3f41', marginBottom: '15px'}}></div>

        <div style={{marginBottom: '10px'}}>
            <label htmlFor="exportFilenameInput" style={{fontSize: '0.9em', color: '#c0c0c0', display: 'block', marginBottom: '5px'}}>{t('exportFilenameLabel')}</label>
            <input 
                type="text" 
                id="exportFilenameInput"
                value={exportFilename}
                onChange={(e) => setExportFilename(e.target.value)}
                placeholder={t('defaultExportFilename')}
                style={{width: 'calc(100% - 12px)', padding: '8px', borderRadius: '4px', border: '1px solid #4f5357', background: '#33363a', color: '#ccc', boxSizing: 'border-box'}}
            />
        </div>
        
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
            <button 
                onClick={handleExportData}
                style={{...btnStyle, flexGrow: 1, marginRight: '5px', background: 'linear-gradient(145deg, #6c757d, #5a6268)'}}
                onMouseOver={e=>{e.currentTarget.style.background='linear-gradient(145deg, #7a8288, #686e74)';e.currentTarget.style.boxShadow=hoverStyle.boxShadow;}}
                onMouseOut={e=>{e.currentTarget.style.background='linear-gradient(145deg, #6c757d, #5a6268)';e.currentTarget.style.boxShadow=btnStyle.boxShadow;}}
            >
                {t('exportData')}
            </button>
            <input type="file" ref={importFileRef} onChange={handleImportData} accept=".json" style={{ display: 'none' }} />
            <button 
                onClick={() => importFileRef.current && importFileRef.current.click()}
                style={{...btnStyle, flexGrow: 1, marginLeft: '5px', background: 'linear-gradient(145deg, #17a2b8, #138496)'}}
                onMouseOver={e=>{e.currentTarget.style.background='linear-gradient(145deg, #19b1c9, #159aaf)';e.currentTarget.style.boxShadow=hoverStyle.boxShadow;}}
                onMouseOut={e=>{e.currentTarget.style.background='linear-gradient(145deg, #17a2b8, #138496)';e.currentTarget.style.boxShadow=btnStyle.boxShadow;}}
            >
                {t('importData')}
            </button>
        </div>

        <button 
            onClick={() => setIsSlideshowMode(true)} 
            style={{...btnStyle, width:'100%', marginBottom:'20px', padding:'10px 0', fontSize:'1em', background: 'linear-gradient(145deg, #28a745, #218838)'}}
            onMouseOver={e=>{e.currentTarget.style.background='linear-gradient(145deg, #2db950, #249740)';e.currentTarget.style.boxShadow=hoverStyle.boxShadow;}} 
            onMouseOut={e=>{e.currentTarget.style.background='linear-gradient(145deg, #28a745, #218838)';e.currentTarget.style.boxShadow=btnStyle.boxShadow;}}
        >
            {t('startSlideshow')}
        </button>

        <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #3c3f41', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <button onClick={()=>goToPage(currentPageIndex-1)} disabled={currentPageIndex===0} style={{...btnStyle, opacity:currentPageIndex===0?0.5:1}} onMouseOver={e=>{if(currentPageIndex!==0){e.currentTarget.style.background=hoverStyle.background;e.currentTarget.style.boxShadow=hoverStyle.boxShadow;}}} onMouseOut={e=>{e.currentTarget.style.background=btnStyle.background;e.currentTarget.style.boxShadow=btnStyle.boxShadow;}}>{t('previousPage')}</button>
            <span>{t('pageIndicator', { currentPage: currentPageIndex + 1, totalPages: slides.length })}</span>
            <button onClick={()=>goToPage(currentPageIndex+1)} disabled={currentPageIndex===slides.length-1} style={{...btnStyle, opacity:currentPageIndex===slides.length-1?0.5:1}} onMouseOver={e=>{if(currentPageIndex!==slides.length-1){e.currentTarget.style.background=hoverStyle.background;e.currentTarget.style.boxShadow=hoverStyle.boxShadow;}}} onMouseOut={e=>{e.currentTarget.style.background=btnStyle.background;e.currentTarget.style.boxShadow=btnStyle.boxShadow;}}>{t('nextPage')}</button>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom:'10px'}}>
            <button onClick={addPage} style={{...btnStyle, flexGrow:1, marginRight: '5px', padding:'10px 0'}} onMouseOver={e=>{e.currentTarget.style.background=hoverStyle.background;e.currentTarget.style.boxShadow=hoverStyle.boxShadow;}} onMouseOut={e=>{e.currentTarget.style.background=btnStyle.background;e.currentTarget.style.boxShadow=btnStyle.boxShadow;}}>{t('addNewPage')}</button>
            <button 
                onClick={deletePage} 
                disabled={slides.length <= 1}
                style={{...deleteBtnStyle, flexGrow:1, marginLeft: '5px', padding:'10px 0', opacity: slides.length <=1 ? 0.5 : 1}} 
                onMouseOver={e=>{if(slides.length > 1){e.currentTarget.style.background=deleteBtnHoverStyle.background;e.currentTarget.style.boxShadow=deleteBtnHoverStyle.boxShadow;}}} 
                onMouseOut={e=>{e.currentTarget.style.background=deleteBtnStyle.background;e.currentTarget.style.boxShadow=btnStyle.boxShadow;}}
            >
                {t('deletePageButton')}
            </button>
        </div>
        
        <button onClick={()=>addElement('text')} disabled={!currentSlide} style={{...btnStyle,width:'100%',marginBottom:'10px',padding:'10px 0',fontSize:'1em',opacity:(!currentSlide)?0.5:1}} onMouseOver={e=>{if(currentSlide){e.currentTarget.style.background=hoverStyle.background;e.currentTarget.style.boxShadow=hoverStyle.boxShadow;}}} onMouseOut={e=>{e.currentTarget.style.background=btnStyle.background;e.currentTarget.style.boxShadow=btnStyle.boxShadow;}}>{t('addTextElement')}</button>
        <button onClick={()=>addElement('glsl_shape')} disabled={!currentSlide} style={{...btnStyle,width:'100%',marginBottom:'15px',padding:'10px 0',fontSize:'1em',opacity:(!currentSlide)?0.5:1}} onMouseOver={e=>{if(currentSlide){e.currentTarget.style.background=hoverStyle.background;e.currentTarget.style.boxShadow=hoverStyle.boxShadow;}}} onMouseOut={e=>{e.currentTarget.style.background=btnStyle.background;e.currentTarget.style.boxShadow=btnStyle.boxShadow;}}>{t('addGlslElement')}</button>

        {currentSlide && (
            <div style={{marginBottom: '15px', padding: '10px', background: '#33363a', borderRadius: '6px', border: '1px solid #2c2c2c'}}>
                <h5 style={{marginTop: 0, marginBottom: '8px', color: '#d0d0d0', fontSize: '0.9em'}}>{t('pageTexturesTitle')}</h5>
                <input type="file" ref={fileInputRef} multiple accept="image/*" onChange={handleImageUpload} style={{display: 'block', marginBottom: '10px', fontSize: '0.85em', color: '#ccc'}} disabled={currentSlide.uploadedTextures.length >= 3} />
                {currentSlide.uploadedTextures.length > 0 ? (
                    <ul style={{listStyle: 'none', padding: 0, margin: 0, fontSize: '0.8em'}}>
                        {currentSlide.uploadedTextures.map(tex => (
                            <li key={tex.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2a2d31', padding: '4px 6px', borderRadius: '3px', marginBottom: '4px'}}>
                                <span title={tex.name} style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px'}}>{tex.name}</span>
                                <button onClick={() => handleDeleteTexture(tex.id)} style={{background: '#c0392b', color: 'white', border: 'none', borderRadius: '3px', padding: '2px 6px', fontSize: '0.75em', cursor: 'pointer'}}>{t('deleteButton')}</button>
                            </li>
                        ))}
                    </ul>
                ) : <p style={{fontSize: '0.8em', color: '#888', margin: '5px 0'}}>{t('noTexturesUploaded')}</p>}
            </div>
        )}

        {currentSlide && ( <>
            <GLEditorPanel 
                panelKey="bg"
                title={t('pageBackgroundFS', { pageNumber: currentPageIndex + 1 })} 
                shaderCode={currentSlide.backgroundShader.fs} 
                onShaderCodeChange={handleBgShaderChange} 
                currentHeight={editorPanelHeights.bg}
                onHeightChange={handleEditorPanelHeightChange}
                t={t}
            />
            <GLEditorPanel 
                panelKey="pp"
                title={t('pagePostEffectFS', { pageNumber: currentPageIndex + 1 })} 
                shaderCode={currentSlide.postProcessShader.fs} 
                onShaderCodeChange={handlePpShaderChange} 
                currentHeight={editorPanelHeights.pp}
                onHeightChange={handleEditorPanelHeightChange}
                t={t}
            />
            <GLEditorPanel 
                panelKey="el"
                title={selectedElement?.type==='glsl_shape'? t('selectedShapeMaterialFS', { elementId: selectedElement.id.slice(-5) }) : t('glslShapeMaterial')}
                shaderCode={selectedElement?.type==='glsl_shape'&&selectedElement?.materialShader?.fs?selectedElement.materialShader.fs: t('editTextInstruction')}
                onShaderCodeChange={handleElMatShaderChange} 
                currentHeight={editorPanelHeights.el}
                onHeightChange={handleEditorPanelHeightChange}
                disabled={!selectedElement||selectedElement.type!=='glsl_shape'} 
                t={t}
            />
        </>)}
        {shaderError && <pre style={{color:'#ff7b7b',whiteSpace:'pre-wrap',background:'#3d2323',border:'1px solid #ff7b7b',padding:'12px',borderRadius:'5px',marginTop:'15px',fontSize:'0.9em',maxHeight:'100px',overflowY:'auto',fontFamily:'monospace'}}>{t('errorPrefix')}{shaderError}</pre>}
      </div>
      
      {!isSlideshowMode && (
        <div 
          onMouseDown={handleEditorResizeMouseDown}
          style={{
            width: '8px',
            cursor: 'ew-resize',
            background: '#15171a', 
            position: 'relative',
            zIndex: 50, 
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
            <div style={{width: '2px', height: '30px', background: '#4f5357', borderRadius: '1px'}}></div>
        </div>
      )}
      
      <div 
        ref={canvasOuterContainerRef} 
        style={{
            flexGrow: 1, 
            height: '100vh',
            position:'relative', 
            background: isSlideshowMode ? '#000000' : '#121212', 
            overflow:'hidden',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            cursor:'default',
            zIndex: isSlideshowMode ? 1000 : 'auto', 
        }} 
        onClick={handleCanvasClick} 
      >
        <div 
            ref={slideWrapperRef} 
            style={{
                width:`${rendererWidth}px`,
                height:`${rendererHeight}px`,
                position:'relative',
                background: isSlideshowMode ? 'transparent' : (slideWrapperSize.width > 10 ? '#080808' : 'transparent'),
                boxShadow: isSlideshowMode ? 'none' : (slideWrapperSize.width > 10 ? '0 0 15px rgba(0,0,0,0.5)' : 'none'),
            }}
        >
            {(currentSlide && rendererWidth > 10 && rendererHeight > 10) ? ( <>
                <SlideRenderer 
                  key={`${currentSlide.id}-${rendererWidth}-${rendererHeight}-${JSON.stringify(currentSlide.uploadedTextures)}-${isSlideshowMode}-${language}-${selectedElementId}`} 
                  slideData={currentSlide} 
                  canvasWidth={rendererWidth} 
                  canvasHeight={rendererHeight} 
                  onShaderError={handleShaderError}
                  selectedElementId={selectedElementId} 
                  isSlideshowMode={isSlideshowMode}
                  designSlideWidth={DESIGN_WIDTH} 
                  designSlideHeight={DESIGN_HEIGHT} 
                  t={t}
                />
                {(!isSlideshowMode && currentSlide.elements) && currentSlide.elements.map(el => {
                    if (el.type === 'text') return <TextElement key={el.id} data={el} onUpdate={updateElement} onSelect={setSelectedElementId} isSelected={selectedElementId===el.id} slideBounds="parent" displayScale={displayScale} t={t} />;
                    if (el.type === 'glsl_shape') return <GlslShapeElement key={el.id} data={el} onUpdate={updateElement} onSelect={setSelectedElementId} isSelected={selectedElementId===el.id} slideBounds="parent" availableTextures={currentSlide.uploadedTextures} displayScale={displayScale} t={t} />;
                    return null;
                })}
            </>) : ( <div style={{color:'#777',fontSize:'1.2em',textAlign:'center',width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:'#050505',padding:'20px',boxSizing:'border-box'}}>
                {rendererWidth<=10||rendererHeight<=10 ? t('canvasInitializing') : t('canvasLoading')}
            </div> )}
        </div>
      </div>
    </div>
  );
};
export default App;
