{
    const canvas_CAR = document.getElementById("glCanvas3");
    const gl_CAR = canvas_CAR.getContext("webgl2");

    if (!gl_CAR) {
        throw new Error("WebGL 2 não é suportado.");
    }


    // --------------------------------------------------
    // 1. VERTICES
    // --------------------------------------------------
    function carVertices() {
        const vertices = [];

        function addRect(xMin, xMax, yMin, yMax, r, g, b) {
            vertices.push(xMin, yMax, r, g, b); // Topo esquerdo
            vertices.push(xMax, yMax, r, g, b); // Topo direito
            vertices.push(xMin, yMin, r, g, b); // Base esquerda
            vertices.push(xMax, yMin, r, g, b); // Base direita
        }

        const cR = 0.8, cG = 0.2, cB = 0.2; // Vermelho (CARroceria)
        const wR = 0.5, wG = 0.8, wB = 0.9; // Azul Claro (Janelas)
        const pR = 0.2, pG = 0.2, pB = 0.2; // Cinza Escuro (Pneus)

        // Carcaça
        addRect(-0.6, 0.6, -0.1, 0.2, cR, cG, cB); // Base
        addRect(-0.3, 0.3, 0.2, 0.45, cR, cG, cB); // Topo
        
        // Janelas
        addRect(-0.25, -0.02, 0.20, 0.4, wR, wG, wB); // Janela 1
        addRect(0.02, 0.25, 0.20, 0.4, wR, wG, wB); // Janela 2
        
        // Rodas
        addRect(-0.45, -0.2, -0.25, 0.0, pR, pG, pB); // Roda 1
        addRect(0.2, 0.45, -0.25, 0.0, pR, pG, pB); // Roda 2

        return new Float32Array(vertices);
    }

    const vertices_CAR = carVertices();


    // --------------------------------------------------
    // 2. BUFFERS
    // --------------------------------------------------

    const verticesBuffer_CAR = gl_CAR.createBuffer();

    gl_CAR.bindBuffer(gl_CAR.ARRAY_BUFFER, verticesBuffer_CAR);

    gl_CAR.bufferData(
        gl_CAR.ARRAY_BUFFER,
        vertices_CAR,
        gl_CAR.STATIC_DRAW
    );


    // --------------------------------------------------
    // 3. VERTEX SHADER
    // --------------------------------------------------
    const vertexShaderSource_CAR = `#version 300 es

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
    const fragmentShaderSource_CAR = `#version 300 es

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

    const vertexShader_CAR = createShader(
        gl_CAR,
        gl_CAR.VERTEX_SHADER,
        vertexShaderSource_CAR
    );

    const fragmentShader_CAR = createShader(
        gl_CAR,
        gl_CAR.FRAGMENT_SHADER,
        fragmentShaderSource_CAR
    );


    // --------------------------------------------------
    // 6. CRIAR PROGRAMA
    // --------------------------------------------------

    const program_CAR = gl_CAR.createProgram();

    gl_CAR.attachShader(program_CAR, vertexShader_CAR);
    gl_CAR.attachShader(program_CAR, fragmentShader_CAR);
    gl_CAR.linkProgram(program_CAR);

    if (!gl_CAR.getProgramParameter(program_CAR, gl_CAR.LINK_STATUS)) {
        throw new Error(
            gl_CAR.getProgramInfoLog(program_CAR)
        );
    }


    // --------------------------------------------------
    // 7. LOCAL DOS ATRIBUTOS
    // --------------------------------------------------

    // 5 valores (X, Y, R, G, B)
    const stride = 5 * Float32Array.BYTES_PER_ELEMENT;

    // Configurar a Posição (aPosition)
    const positionLocation_CAR = gl_CAR.getAttribLocation(program_CAR, "aPosition");
    gl_CAR.enableVertexAttribArray(positionLocation_CAR);
    gl_CAR.vertexAttribPointer(
        positionLocation_CAR, 
        2, // (X, Y)
        gl_CAR.FLOAT, 
        false, 
        stride, 
        0 // Começa no índice 0
    );

    // Configurar a Cor (aColor)
    const colorLocation_CAR = gl_CAR.getAttribLocation(program_CAR, "aColor");
    gl_CAR.enableVertexAttribArray(colorLocation_CAR);
    gl_CAR.vertexAttribPointer(
        colorLocation_CAR, 
        3, // (R, G, B)
        gl_CAR.FLOAT, 
        false, 
        stride, 
        2 * Float32Array.BYTES_PER_ELEMENT // Pula as coordenadas para achar a cor
    );


    // --------------------------------------------------
    // 9. LIMPAR TELA
    // --------------------------------------------------

    gl_CAR.clearColor(0.1, 0.1, 0.2, 1.0);
    gl_CAR.clear(gl_CAR.COLOR_BUFFER_BIT);


    // --------------------------------------------------
    // 10. DESENHAR
    // --------------------------------------------------
    gl_CAR.clearColor(0.1, 0.1, 0.2, 1.0);
    gl_CAR.clear(gl_CAR.COLOR_BUFFER_BIT);

    gl_CAR.useProgram(program_CAR);

    const totalParts = 6;
    const verticesPerPart = 4;

    for (let i = 0; i < totalParts; i++) {
        const offset = i * verticesPerPart;
        gl_CAR.drawArrays(gl_CAR.TRIANGLE_STRIP, offset, verticesPerPart);
    }
}
