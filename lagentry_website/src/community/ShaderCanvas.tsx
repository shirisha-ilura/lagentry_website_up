import { useEffect, useRef, useState } from 'react';
import { shaders, vertexShader } from './util/shaders';

interface ShaderCanvasProps {
  size?: number; // fallback square size
  width?: number;
  height?: number;
  onClick?: () => void;
  hasActiveReminders?: boolean;
  hasUpcomingReminders?: boolean;
  shaderId?: number;
}

export const ShaderCanvas = ({
  size = 600,
  width,
  height,
  onClick,
  hasActiveReminders = false,
  hasUpcomingReminders = false,
  shaderId = 1,
}: ShaderCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const mousePositionRef = useRef<[number, number]>([0.5, 0.5]);
  const programInfoRef = useRef<any>(null);
  const [isHovered, setIsHovered] = useState(false);

  const selectedShader = shaders.find((s) => s.id === shaderId) || shaders[0];

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mousePositionRef.current = [x, y];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { 
      alpha: true, 
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      antialias: true
    });
    if (!gl) return;
    
    // Ensure canvas background is transparent
    canvas.style.backgroundColor = 'transparent';
    canvas.style.background = 'transparent';

    const vsSource = vertexShader;
    const fsSource = selectedShader.fragmentShader;
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    if (!shaderProgram) return;

    programInfoRef.current = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
      },
      uniformLocations: {
        iResolution: gl.getUniformLocation(shaderProgram, 'iResolution'),
        iTime: gl.getUniformLocation(shaderProgram, 'iTime'),
        iMouse: gl.getUniformLocation(shaderProgram, 'iMouse'),
        hasActiveReminders: gl.getUniformLocation(shaderProgram, 'hasActiveReminders'),
        hasUpcomingReminders: gl.getUniformLocation(shaderProgram, 'hasUpcomingReminders'),
        disableCenterDimming: gl.getUniformLocation(shaderProgram, 'disableCenterDimming'),
      },
    };

    const buffers = initBuffers(gl);
    let startTime = Date.now();
    const targetW = width ?? size;
    const targetH = height ?? size;
    canvas.width = targetW;
    canvas.height = targetH;
    gl.viewport(0, 0, canvas.width, canvas.height);

    const render = () => {
      const currentTime = (Date.now() - startTime) / 1000;
      const mousePos = mousePositionRef.current;
      drawScene(
        gl,
        programInfoRef.current,
        buffers,
        currentTime,
        canvas.width,
        canvas.height,
        hasActiveReminders,
        hasUpcomingReminders,
        mousePos
      );
      animationRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animationRef.current);
      if (gl && shaderProgram) gl.deleteProgram(shaderProgram);
    };
  }, [size, width, height, hasActiveReminders, hasUpcomingReminders, shaderId, selectedShader.fragmentShader]);

  function initShaderProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string) {
    const vertexShaderObj = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShaderObj = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShaderObj || !fragmentShaderObj) return null;
    const shaderProgram = gl.createProgram();
    if (!shaderProgram) return null;
    gl.attachShader(shaderProgram, vertexShaderObj);
    gl.attachShader(shaderProgram, fragmentShaderObj);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) return null;
    return shaderProgram;
  }

  function loadShader(gl: WebGLRenderingContext, type: number, source: string) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function initBuffers(gl: WebGLRenderingContext) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [-1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    const textureCoordinates = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    const indices = [0, 1, 2, 0, 2, 3];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    return { position: positionBuffer, textureCoord: textureCoordBuffer, indices: indexBuffer };
  }

  function drawScene(
    gl: WebGLRenderingContext,
    programInfo: any,
    buffers: any,
    currentTime: number,
    width: number,
    height: number,
    hasActiveReminders: boolean,
    hasUpcomingReminders: boolean,
    mousePos: [number, number]
  ) {
    // Clear with fully transparent background
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clearDepth(1.0);
    
    // Disable depth test for 2D blending
    gl.disable(gl.DEPTH_TEST);
    
    // Enable alpha blending for proper transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.blendEquation(gl.FUNC_ADD);
    
    // Clear the canvas with transparent color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(programInfo.program);
    gl.uniform2f(programInfo.uniformLocations.iResolution, width, height);
    gl.uniform1f(programInfo.uniformLocations.iTime, currentTime);
    gl.uniform2f(programInfo.uniformLocations.iMouse, mousePos[0], mousePos[1]);
    gl.uniform1i(programInfo.uniformLocations.hasActiveReminders, hasActiveReminders ? 1 : 0);
    gl.uniform1i(programInfo.uniformLocations.hasUpcomingReminders, hasUpcomingReminders ? 1 : 0);
    gl.uniform1i(programInfo.uniformLocations.disableCenterDimming, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }

  const handleMouseLeave = () => {
    setIsHovered(false);
    mousePositionRef.current = [0.5, 0.5];
  };

  return (
    <canvas
      ref={canvasRef}
      className="transition-transform duration-300"
      style={{ 
        width: width ?? size, 
        height: height ?? size, 
        transform: isHovered ? 'scale(1.01)' : 'scale(1)', 
        cursor: 'default',
        border: 'none',
        outline: 'none',
        display: 'block',
        background: 'transparent !important',
        backgroundColor: 'transparent !important',
        boxShadow: 'none',
        margin: 0,
        padding: 0,
        verticalAlign: 'bottom'
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    />
  );
};

export default ShaderCanvas;


