{
    const canvas_RBT = document.getElementById("glCanvas2");
    const gl_RBT = canvas_RBT.getContext("webgl2");

    if (!gl_RBT) {
        throw new Error("WebGL 2 não é suportado.");
    }


    // --------------------------------------------------
    // 1. VERTICES
    // --------------------------------------------------
    function robotVertices() {
        const vertices = [];

        function addRect(xMin, xMax, yMin, yMax, r, g, b) {
            vertices.push(xMin, yMax, r, g, b); // Topo esquerdo
            vertices.push(xMax, yMax, r, g, b); // Topo direito
            vertices.push(xMin, yMin, r, g, b); // Base esquerda
            vertices.push(xMax, yMin, r, g, b); // Base direita
        }

        const rB = 0.9, gB = 0.85, bB = 0.7; // Bege
        const rT = 0.2, gT = 0.40, bT = 0.35; // Verde-azulado
        const rY = 0.9, gY = 0.90, bY = 0.5; // Amarelo

        // Orelhas
        addRect(-0.75, -0.6, -0.15, 0.15, rB, gB, bB); // Orelha Esquerda
        addRect(0.6, 0.75, -0.15, 0.15, rB, gB, bB); // Orelha Direita

        // Cabeça
        addRect(-0.6, 0.6, -0.5, 0.5, rB, gB, bB);

        // 4. Tela do Monitor
        addRect(-0.5, 0.5, -0.4, 0.4, rT, gT, bT);

        // Olhos
        addRect(-0.3, -0.15, 0.05, 0.15, rY, gY, bY); // Olho Esquerdo
        addRect(0.15, 0.3, 0.05, 0.15, rY, gY, bY); // Olho Direito

        // Boca
        addRect(-0.2, 0.2, -0.25, -0.15, rY, gY, bY); // Base do sorriso
        addRect(-0.2, -0.1, -0.15, -0.05, rY, gY, bY); // Canto esquerdo
        addRect(0.1, 0.2, -0.15, -0.05, rY, gY, bY); // Canto direito

        return new Float32Array(vertices);
    }

    const vertices_RBT = robotVertices();


    // --------------------------------------------------
    // 2. BUFFERS
    // --------------------------------------------------

    const verticesBuffer_RBT = gl_RBT.createBuffer();

    gl_RBT.bindBuffer(gl_RBT.ARRAY_BUFFER, verticesBuffer_RBT);

    gl_RBT.bufferData(
        gl_RBT.ARRAY_BUFFER,
        vertices_RBT,
        gl_RBT.STATIC_DRAW
    );


    // --------------------------------------------------
    // 3. VERTEX SHADER
    // --------------------------------------------------
    const vertexShaderSource_RBT = `#version 300 es

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
    const fragmentShaderSource_RBT = `#version 300 es

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

    const vertexShader_RBT = createShader(
        gl_RBT,
        gl_RBT.VERTEX_SHADER,
        vertexShaderSource_RBT
    );

    const fragmentShader_RBT = createShader(
        gl_RBT,
        gl_RBT.FRAGMENT_SHADER,
        fragmentShaderSource_RBT
    );


    // --------------------------------------------------
    // 6. CRIAR PROGRAMA
    // --------------------------------------------------

    const program_RBT = gl_RBT.createProgram();

    gl_RBT.attachShader(program_RBT, vertexShader_RBT);
    gl_RBT.attachShader(program_RBT, fragmentShader_RBT);
    gl_RBT.linkProgram(program_RBT);

    if (!gl_RBT.getProgramParameter(program_RBT, gl_RBT.LINK_STATUS)) {
        throw new Error(
            gl_RBT.getProgramInfoLog(program_RBT)
        );
    }


    // --------------------------------------------------
    // 7. LOCAL DOS ATRIBUTOS
    // --------------------------------------------------

    // 5 valores (X, Y, R, G, B)
    const stride = 5 * Float32Array.BYTES_PER_ELEMENT;

    // Configurar a Posição (aPosition)
    const positionLocation_RBT = gl_RBT.getAttribLocation(program_RBT, "aPosition");
    gl_RBT.enableVertexAttribArray(positionLocation_RBT);
    gl_RBT.vertexAttribPointer(
        positionLocation_RBT, 
        2, // (X, Y)
        gl_RBT.FLOAT, 
        false, 
        stride, 
        0 // Começa no índice 0
    );

    // Configurar a Cor (aColor)
    const colorLocation_RBT = gl_RBT.getAttribLocation(program_RBT, "aColor");
    gl_RBT.enableVertexAttribArray(colorLocation_RBT);
    gl_RBT.vertexAttribPointer(
        colorLocation_RBT, 
        3, // (R, G, B)
        gl_RBT.FLOAT, 
        false, 
        stride, 
        2 * Float32Array.BYTES_PER_ELEMENT // Pula as coordenadas para achar a cor
    );


    // --------------------------------------------------
    // 9. LIMPAR TELA
    // --------------------------------------------------

    gl_RBT.clearColor(0.1, 0.1, 0.2, 1.0);
    gl_RBT.clear(gl_RBT.COLOR_BUFFER_BIT);

    
    // --------------------------------------------------
    // 10. DESENHAR
    // --------------------------------------------------

    gl_RBT.useProgram(program_RBT);

    const totalParts = 9;
    const verticesPerPart = 4;

    for (let i = 0; i < totalParts; i++) {
        const offset = i * verticesPerPart;
        gl_RBT.drawArrays(gl_RBT.TRIANGLE_STRIP, offset, verticesPerPart);
    }
}