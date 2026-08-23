{
    const canvas_FLW = document.getElementById("glCanvas1");
    const gl_FLW = canvas_FLW.getContext("webgl2");

    if (!gl_FLW) {
        throw new Error("WebGL 2 não é suportado.");
    }


    // --------------------------------------------------
    // 1. VERTICES
    // --------------------------------------------------
    function flowerVertices() {
        const vertices = [];

        // Caule
        vertices.push(-0.02,  0.0, 0.2, 0.8, 0.2);
        vertices.push( 0.02,  0.0, 0.2, 0.8, 0.2);
        vertices.push(-0.02, -0.8, 0.1, 0.5, 0.1);
        vertices.push( 0.02, -0.8, 0.1, 0.5, 0.1); 

        // Ponto central da flor (amarelo)
        vertices.push(0.0, 0.0, 1.0, 0.8, 0.0);

        const numSides = 100;
        const numPetals = 5;

        for (let i = 0; i <= numSides; i++) {
            const angle = i * 2 * Math.PI / numSides;
            
            // Raio variável para o formato de pétalas
            const radius = 0.15 + 0.1 * Math.sin(numPetals * angle);
            
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            
            // Cor das Pétalas (rosa)
            vertices.push(x, y, 1.0, 0.1, 0.5);
        }

        return new Float32Array(vertices);
    }

    const vertices_FLW = flowerVertices();


    // --------------------------------------------------
    // 2. BUFFERS
    // --------------------------------------------------

    const verticesBuffer_FLW = gl_FLW.createBuffer();

    gl_FLW.bindBuffer(gl_FLW.ARRAY_BUFFER, verticesBuffer_FLW);

    gl_FLW.bufferData(
        gl_FLW.ARRAY_BUFFER,
        vertices_FLW,
        gl_FLW.STATIC_DRAW
    );


    // --------------------------------------------------
    // 3. VERTEX SHADER
    // --------------------------------------------------
    const vertexShaderSource_FLW = `#version 300 es

    in vec2 aPosition;
    in vec3 aColor;
    out vec3 vColor;

    void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
        vColor = aColor;
    }
    `;


    // --------------------------------------------------
    // 4. FRAGMENT SHADER
    // --------------------------------------------------
    const fragmentShaderSource_FLW = `#version 300 es

    precision mediump float;
    in vec3 vColor;
    out vec4 outColor;

    void main() {
        outColor = vec4(vColor, 1.0);
    }
    `;


    // --------------------------------------------------
    // 5. COMPILAR SHADERS
    // --------------------------------------------------

    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const error = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error(error);
        }

        return shader;
    }

    const vertexShader_FLW = createShader(
        gl_FLW,
        gl_FLW.VERTEX_SHADER,
        vertexShaderSource_FLW
    );

    const fragmentShader_FLW = createShader(
        gl_FLW,
        gl_FLW.FRAGMENT_SHADER,
        fragmentShaderSource_FLW
    );


    // --------------------------------------------------
    // 6. CRIAR PROGRAMA
    // --------------------------------------------------

    const program_FLW = gl_FLW.createProgram();

    gl_FLW.attachShader(program_FLW, vertexShader_FLW);
    gl_FLW.attachShader(program_FLW, fragmentShader_FLW);
    gl_FLW.linkProgram(program_FLW);

    if (!gl_FLW.getProgramParameter(program_FLW, gl_FLW.LINK_STATUS)) {
        throw new Error(
            gl_FLW.getProgramInfoLog(program_FLW)
        );
    }


    // --------------------------------------------------
    // 7. LOCAL DOS ATRIBUTOS
    // --------------------------------------------------

    // 5 valores (X, Y, R, G, B)
    const stride = 5 * Float32Array.BYTES_PER_ELEMENT;

    // Configurar a Posição (aPosition)
    const positionLocation_FLW = gl_FLW.getAttribLocation(program_FLW, "aPosition");
    gl_FLW.enableVertexAttribArray(positionLocation_FLW);
    gl_FLW.vertexAttribPointer(
        positionLocation_FLW, 
        2, // (X, Y)
        gl_FLW.FLOAT, 
        false, 
        stride, 
        0 // Começa no índice 0
    );

    // Configurar a Cor (aColor)
    const colorLocation_FLW = gl_FLW.getAttribLocation(program_FLW, "aColor");
    gl_FLW.enableVertexAttribArray(colorLocation_FLW);
    gl_FLW.vertexAttribPointer(
        colorLocation_FLW, 
        3, // (R, G, B)
        gl_FLW.FLOAT, 
        false, 
        stride, 
        2 * Float32Array.BYTES_PER_ELEMENT // Pula as coordenadas para achar a cor
    );


    // --------------------------------------------------
    // 9. LIMPAR TELA
    // --------------------------------------------------

    gl_FLW.clearColor(0.1, 0.1, 0.2, 1.0);
    gl_FLW.clear(gl_FLW.COLOR_BUFFER_BIT);


    // --------------------------------------------------
    // 10. DESENHAR
    // --------------------------------------------------

    gl_FLW.useProgram(program_FLW);

    // 1. Desenha o caule primeiro
    gl_FLW.drawArrays(gl_FLW.TRIANGLE_STRIP, 0, 4);

    // 2. Desenha a flor por cima
    const totalVerticesFlor = (vertices_FLW.length / 5) - 4;

    gl_FLW.drawArrays(gl_FLW.TRIANGLE_FAN, 4, totalVerticesFlor);
}