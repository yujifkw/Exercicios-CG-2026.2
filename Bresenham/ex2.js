(() => {
    const canvas = document.getElementById("canvas-ex2");
    const gl = canvas.getContext("webgl2");

    if (!gl) {
        throw new Error("WebGL 2 não é suportado.");
    }

    const canvasCoordinates = document.getElementById("ui-ex2");


    // --------------------------------------------------
    // 1. VERTICES
    // --------------------------------------------------

    let mode = 'R'; 
    let clicks = [];
    let currentColor = [0.0, 0.0, 1.0];

    // Linha inicial
    let vertices = new Float32Array([0.0, 0.0]);
    let colors = new Float32Array([0.0, 0.0, 1.0]);
    let pointSizes = new Float32Array([5.0]);


    // --------------------------------------------------
    // 2. BUFFERS
    // --------------------------------------------------

    const verticesBuffer = gl.createBuffer();
    const colorsBuffer = gl.createBuffer();
    const pointSizesBuffer = gl.createBuffer();


    // --------------------------------------------------
    // 3. VERTEX SHADER
    // --------------------------------------------------

    const vertexShaderSource = `#version 300 es
        in vec2 aPosition;
        in vec3 aColor;
        in float aPointSize;
        out vec3 vColor;
        void main() {
            gl_Position = vec4(aPosition, 0.0, 1.0);
            gl_PointSize = aPointSize;
            vColor = aColor;
        }
    `;


    // --------------------------------------------------
    // 4. FRAGMENT SHADER
    // --------------------------------------------------

    const fragmentShaderSource = `#version 300 es
        precision mediump float;
        in vec3 vColor;
        out vec4 outColor;
        void main() {
            outColor = vec4(vColor, 1.0);
        }
    `;


    // --------------------------------------------------
    // 5. COMPILAR SHADERS E CRIAR PROGRAMA
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

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program));
    }


    // --------------------------------------------------
    // 6. CONFIGURAR ATRIBUTOS
    // --------------------------------------------------

    const positionLocation = gl.getAttribLocation(program, "aPosition");
    const colorLocation = gl.getAttribLocation(program, "aColor");
    const pointSizeLocation = gl.getAttribLocation(program, "aPointSize");

    function bindBuffers() {
        gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(colorLocation);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, pointSizesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, pointSizes, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(pointSizeLocation);
        gl.vertexAttribPointer(pointSizeLocation, 1, gl.FLOAT, false, 0, 0);
    }


    // --------------------------------------------------
    // 7. ALGORITMO DE BRESENHAM
    // --------------------------------------------------

    function getBresenhamPixels(x1, y1, x2, y2) {
        const pixels = [];
        let dx = Math.abs(x2 - x1);
        let dy = Math.abs(y2 - y1);
        let sx = (x1 < x2) ? 1 : -1;
        let sy = (y1 < y2) ? 1 : -1;
        let err = dx - dy;

        while (true) {
            pixels.push({ x: x1, y: y1 });
            if (x1 === x2 && y1 === y2) break;
            let e2 = 2 * err;
            if (e2 > -dy) { err -= dy; x1 += sx; }
            if (e2 < dx) { err += dx; y1 += sy; }
        }
        return pixels;
    }


    // --------------------------------------------------
    // 8. INTERAÇÃO COM O MOUSE E TECLADO
    // --------------------------------------------------

    let uiPoint = "Nenhum";
    let uiMode = "Reta";
    let uiStatus = "Aguardando cliques...";

    function updateUI() {
        canvasCoordinates.innerHTML = `<strong>Pontos:</strong> ${uiPoint}<br><strong>Modo:</strong> ${uiMode}<br><strong>Status:</strong> ${uiStatus}`;
    }
    updateUI();

    function formatPoints() {
        if (clicks.length === 0) return "Nenhum";
        return clicks.map((p, i) => `P${i+1}(${p.x},${p.y})`).join(" | ");
    }

    function processShape() {
        let pixels = [];
        if (mode === 'R' && clicks.length === 2) {
            pixels = getBresenhamPixels(clicks[0].x, clicks[0].y, clicks[1].x, clicks[1].y);
        } else if (mode === 'T' && clicks.length === 3) {
            pixels = getBresenhamPixels(clicks[0].x, clicks[0].y, clicks[1].x, clicks[1].y)
                .concat(getBresenhamPixels(clicks[1].x, clicks[1].y, clicks[2].x, clicks[2].y))
                .concat(getBresenhamPixels(clicks[2].x, clicks[2].y, clicks[0].x, clicks[0].y));
        }

        const tempVertices = [], tempColors = [], tempSizes = [];
        for (let p of pixels) {
            tempVertices.push((p.x / canvas.width) * 2 - 1, -((p.y / canvas.height) * 2 - 1));
            tempColors.push(...currentColor);
            tempSizes.push(5.0);
        }

        vertices = new Float32Array(tempVertices);
        colors = new Float32Array(tempColors);
        pointSizes = new Float32Array(tempSizes);

        clicks = [];
        bindBuffers();
        drawScene();
    }

    canvas.addEventListener("mousedown", (event) => {
        clicks.push({ x: Math.floor(event.offsetX), y: Math.floor(event.offsetY) });
        uiPoint = formatPoints();
        uiStatus = `Aguardando cliques (${clicks.length})...`;

        if ((mode === 'R' && clicks.length === 2) || (mode === 'T' && clicks.length === 3)) {
            processShape();
            uiStatus = "Desenhado!";
        }
        updateUI();
    });

    document.addEventListener("keydown", (event) => {
        if (!canvas.closest('.tab-content').classList.contains('active')) return;
        
        const colorMap = {
            '0': [1,1,1], '1': [1,0,0], '2': [0,1,0], '3': [0,0,1], '4': [1,1,0],
            '5': [1,0,1], '6': [0,1,1], '7': [1,0.5,0], '8': [0.5,0,1], '9': [0.5,0.5,0.5]
        };

        if (event.key === 'r' || event.key === 'R') { 
            mode = 'R'; clicks = []; 
            uiMode = "Reta"; uiPoint = "Nenhum"; uiStatus = "Modo alterado para Reta."; 
        } else if (event.key === 't' || event.key === 'T') { 
            mode = 'T'; clicks = []; 
            uiMode = "Triângulo"; uiPoint = "Nenhum"; uiStatus = "Modo alterado para Triângulo."; 
        } else if (colorMap[event.key]) { 
            currentColor = colorMap[event.key]; 
            uiStatus = `Cor alterada [${event.key}]`; 
        }
        updateUI();
    });


    // --------------------------------------------------
    // 9. LIMPAR E DESENHAR
    // --------------------------------------------------
    
    gl.clearColor(0.1, 0.1, 0.1, 1.0);

    function drawScene() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);
        if (vertices.length > 0) {
            gl.drawArrays(gl.POINTS, 0, vertices.length / 2);
        }
    }

    bindBuffers();
    drawScene();
})();