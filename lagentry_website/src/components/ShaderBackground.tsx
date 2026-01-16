import { useEffect, useRef } from "react";

export const ShaderBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl");
    
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }
    
    // Find parent container
    containerRef.current = canvas.parentElement;
    
    // Resize canvas to fill container
    const resizeCanvas = () => {
      const container = containerRef.current || canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    
    // Vertex shader - same as animation folder
    const vertexShaderSource = `
      attribute vec4 aVertexPosition;
      attribute vec2 aTextureCoord;
      varying vec2 vTextureCoord;
      void main() {
        gl_Position = aVertexPosition;
        vTextureCoord = aTextureCoord;
      }
    `;
    
    // Fragment shader - Spectral color flowing waves (same as AnimationShaderBackground)
    const fragmentShaderSource = `
      precision highp float;
      uniform vec2 iResolution;
      uniform float iTime;
      varying vec2 vTextureCoord;
      
      vec3 spectral_colour(float l) {
        // Light and dark shades of purple only - keep original wave calculation
        float normalized = mod(l, 300.0) / 300.0;
        
        // Create flowing light and dark purple shades
        // Use the original wave calculation but map to purple colors
        float wave = sin(normalized * 3.14159 * 2.0 + iTime * 0.5);
        
        // Map wave to light/dark purple intensity
        // When wave is high -> light purple, when low -> dark purple/black
        float intensity = (wave + 1.0) * 0.5; // Normalize to 0-1
        
        // Create purple colors: high red and blue, low green
        // Light purple: brighter, Dark purple: darker (closer to black)
        float r = 0.3 * intensity + 0.1; // Red: 0.1 (dark) to 0.4 (light purple)
        float g = 0.05 * intensity;      // Green: 0.0 to 0.05 (very low for purple)
        float b = 0.5 * intensity + 0.2; // Blue: 0.2 (dark) to 0.7 (light purple)
        
        // Clamp to ensure purple tones
        r = clamp(r, 0.1, 0.4);
        g = clamp(g, 0.0, 0.05);
        b = clamp(b, 0.2, 0.7);
        
        return vec3(r, g, b);
      }
      
      void main() {
        vec2 fragCoord = vTextureCoord * iResolution;
        vec2 p = (2.0*fragCoord - iResolution.xy) / min(iResolution.x, iResolution.y);
        p *= 2.0;
        for(int i=0;i<8;i++) {
          vec2 newp = vec2(
            p.y + cos(p.x + iTime) - sin(p.y * cos(iTime * 0.2)),
            p.x - sin(p.y - iTime) - cos(p.x * sin(iTime * 0.3))
          );
          p = newp;
        }
        gl_FragColor = vec4(spectral_colour(p.y * 50.0 + 500.0 + sin(iTime * 0.6)), 1.0);
      }
    `;
    
    // Compile shader
    const compileShader = (source: string, type: number) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      
      return shader;
    };
    
    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
    
    if (!vertexShader || !fragmentShader) return;
    
    // Create shader program
    const shaderProgram = gl.createProgram();
    if (!shaderProgram) return;
    
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error("Program linking error:", gl.getProgramInfoLog(shaderProgram));
      return;
    }
    
    // Create buffers - same pattern as ShaderCanvas
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
      -1.0, -1.0,
       1.0, -1.0,
       1.0,  1.0,
      -1.0,  1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    
    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    const textureCoordinates = [
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
    
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    const indices = [
      0, 1, 2,
      0, 2, 3,
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    
    // Get attribute and uniform locations
    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
        textureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
      },
      uniformLocations: {
        iResolution: gl.getUniformLocation(shaderProgram, "iResolution"),
        iTime: gl.getUniformLocation(shaderProgram, "iTime"),
      },
    };
    
    // Animation loop
    let animationId: number;
    let startTime = Date.now();
    
    const render = () => {
      const currentTime = (Date.now() - startTime) / 1000;
      
      gl.clearColor(0.0, 0.0, 0.0, 1.0); // Black background
      gl.clear(gl.COLOR_BUFFER_BIT);
      
      gl.useProgram(shaderProgram);
      
      // Set uniforms
      gl.uniform2f(programInfo.uniformLocations.iResolution, canvas.width, canvas.height);
      gl.uniform1f(programInfo.uniformLocations.iTime, currentTime);
      
      // Set vertex position attribute
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        2,
        gl.FLOAT,
        false,
        0,
        0
      );
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
      
      // Set texture coordinate attribute
      gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
      gl.vertexAttribPointer(
        programInfo.attribLocations.textureCoord,
        2,
        gl.FLOAT,
        false,
        0,
        0
      );
      gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
      
      // Draw
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      
      animationId = requestAnimationFrame(render);
    };
    
    render();
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
      gl.deleteProgram(shaderProgram);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1, // Behind Lagentry text (z-index 3) but above background
        pointerEvents: "none",
      }}
    />
  );
};

