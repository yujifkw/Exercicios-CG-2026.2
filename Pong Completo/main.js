const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}


// --------------------------------------------------
// VERTICES E CORES
// --------------------------------------------------

function verticesBarra(){

    return new Float32Array([
        -0.05,  0.2,
        -0.05, -0.2,    
         0.05,  0.2,
         0.05,  0.2,
        -0.05, -0.2,
         0.05, -0.2
    ]);
}

function verticesBola(){

    let vertices = [];
    let numSegments = 30;
    let radius = 0.05;

    for (let i = 0; i < numSegments; i++) {
        let theta1 = (i / numSegments) * 2 * Math.PI;
        let theta2 = ((i + 1) / numSegments) * 2 * Math.PI;

        vertices.push(0, 0); // Center of the circle
        vertices.push(radius * Math.cos(theta1), radius * Math.sin(theta1));
        vertices.push(radius * Math.cos(theta2), radius * Math.sin(theta2));
    }

    return new Float32Array(vertices);
}

let verticesBarraDireita = verticesBarra();

let corBarraDireita = new Float32Array([1.0, 1.0, 1.0]); 

let verticesBarraEsquerda = verticesBarra();

let corBarraEsquerda = new Float32Array([1.0, 1.0, 1.0]);

let verticesBolaCentro = verticesBola();

let corBolaCentro = new Float32Array([1.0, 1.0, 1.0]);


// --------------------------------------------------
// TRANSFORMAÇÕES
// --------------------------------------------------

let MbarraEsquerda = m3.translation(-0.9, 0.0);
let MbarraDireita = m3.translation(0.9, 0.0);
let MbolaCentro = m3.identity();


// --------------------------------------------------
// BUFFER
// --------------------------------------------------

const verticesBuffer = gl.createBuffer();


// --------------------------------------------------
// VERTEX SHADER
// --------------------------------------------------

const vertexShaderSource = `#version 300 es

in vec2 aPosition;
uniform mat3 u_transform;
out vec3 vColor;

void main() {
    vec3 position = u_transform * vec3(aPosition, 1.0);
    gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;


// --------------------------------------------------
// FRAGMENT SHADER
// --------------------------------------------------

const fragmentShaderSource = `#version 300 es

precision mediump float;
uniform vec3 uColor;
out vec4 outColor;

void main() {
    outColor = vec4(uColor, 1.0);
}
`;


// --------------------------------------------------
// COMPILAR SHADERS E CRIAR PROGRAMA
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
// LOCAL DOS ATRIBUTOS E DO UNIFORM
// --------------------------------------------------

const positionLocation = gl.getAttribLocation(program, "aPosition");
const colorLocation = gl.getUniformLocation(program, "uColor");
const transformLocation = gl.getUniformLocation(program, "u_transform");


// --------------------------------------------------
// ESTADO DO TECLADO e UI
// --------------------------------------------------

const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].indexOf(e.key) > -1) {
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => keys[e.key] = false);

const uiScore = document.getElementById("score-display");

let scoreP1 = 0;
let scoreP2 = 0;

function updateUI() {
    uiScore.textContent = `${scoreP1} x ${scoreP2}`;
}


// --------------------------------------------------
// PARÂMETROS ANIMAÇÃO E ESTADO DO JOGO
// --------------------------------------------------

let tyBE = 0.0;
let tyBD = 0.0;
let paddleSpeed = 0.02;

let txBola = 0.0;
let tyBola = 0.0;
let txBola_offset = 0.01; 
let tyBola_offset = 0.01; 

const ballRadius = 0.05;
const paddleHalfWidth = 0.05;
const paddleHalfHeight = 0.2;
const leftPaddleX = -0.9;
const rightPaddleX = 0.9;

function atualizaAnimacao(){
    
    // 1. Movimentação das Barras
    if (keys['w'] || keys['W']) tyBE += paddleSpeed;
    if (keys['s'] || keys['S']) tyBE -= paddleSpeed;
    if (keys['ArrowUp']) tyBD += paddleSpeed;
    if (keys['ArrowDown']) tyBD -= paddleSpeed;

    tyBE = Math.max(-1.0 + paddleHalfHeight, Math.min(1.0 - paddleHalfHeight, tyBE));
    tyBD = Math.max(-1.0 + paddleHalfHeight, Math.min(1.0 - paddleHalfHeight, tyBD));

    MbarraEsquerda = m3.translation(leftPaddleX, tyBE);
    MbarraDireita = m3.translation(rightPaddleX, tyBD);

    // 2. Movimentação da Bola
    txBola += txBola_offset;
    tyBola += tyBola_offset;

    // 3. Colisão com Teto e Chão
    if (tyBola + ballRadius > 1.0 || tyBola - ballRadius < -1.0) {
        tyBola_offset = -tyBola_offset;
    }

    // 4. Colisão com Barra Esquerda
    if (txBola - ballRadius < leftPaddleX + paddleHalfWidth && 
        txBola + ballRadius > leftPaddleX - paddleHalfWidth &&
        tyBola + ballRadius > tyBE - paddleHalfHeight && 
        tyBola - ballRadius < tyBE + paddleHalfHeight) {
        
        txBola_offset = Math.abs(txBola_offset);
    }

    // 5. Colisão com Barra Direita
    if (txBola + ballRadius > rightPaddleX - paddleHalfWidth && 
        txBola - ballRadius < rightPaddleX + paddleHalfWidth &&
        tyBola + ballRadius > tyBD - paddleHalfHeight && 
        tyBola - ballRadius < tyBD + paddleHalfHeight) {
        
        txBola_offset = -Math.abs(txBola_offset);
    }

    // 6. Condição de Ponto
    if (txBola < -1.0) {
        scoreP2++;
        txBola = 0.0; tyBola = 0.0;
        txBola_offset = Math.abs(txBola_offset); 
        updateUI();
    } else if (txBola > 1.0) {
        scoreP1++;
        txBola = 0.0; tyBola = 0.0;
        txBola_offset = -Math.abs(txBola_offset); 
        updateUI();
    }

    MbolaCentro = m3.translation(txBola, tyBola);
}


// --------------------------------------------------
// LIMPAR TELA E DESENHAR
// --------------------------------------------------

gl.clearColor(0.0, 0.0, 0.1, 1.0);

const numComponents = 2;

function drawScene(){
    
    atualizaAnimacao();

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    drawBarraEsquerda();
    drawBarraDireita();
    drawBolaCentro();
    
    requestAnimationFrame(drawScene);
}

function drawBarraEsquerda(){

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesBarraEsquerda, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform3fv(colorLocation, corBarraEsquerda);
    gl.uniformMatrix3fv(transformLocation, false, MbarraEsquerda);
    gl.drawArrays(gl.TRIANGLES, 0, verticesBarraEsquerda.length / numComponents);
}

function drawBarraDireita(){

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesBarraDireita, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform3fv(colorLocation, corBarraDireita);
    gl.uniformMatrix3fv(transformLocation, false, MbarraDireita);
    gl.drawArrays(gl.TRIANGLES, 0, verticesBarraDireita.length / numComponents);
}

function drawBolaCentro(){

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesBolaCentro, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform3fv(colorLocation, corBolaCentro);
    gl.uniformMatrix3fv(transformLocation, false, MbolaCentro);
    gl.drawArrays(gl.TRIANGLES, 0, verticesBolaCentro.length / numComponents);
}


// --------------------------------------------------
// INÍCIO DO DESENHO
// --------------------------------------------------

drawScene();