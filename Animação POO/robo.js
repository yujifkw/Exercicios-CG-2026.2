(() => {

    const canvas = document.getElementById("glCanvas");
    const gl = canvas.getContext("webgl2");

    if (!gl) {
        throw new Error("WebGL 2 não é suportado.");
    }

    // --------------------------------------------------
    // VERTEX SHADER
    // --------------------------------------------------

    const vertexShaderSource = `#version 300 es

    in vec2 aPosition;

    uniform mat3 u_viewTransform;
    uniform mat3 u_modelTransform;

    void main() {

        vec3 position =
            u_viewTransform *
            u_modelTransform *
            vec3(aPosition, 1.0);

        gl_Position =
            vec4(position.xy, 0.0, 1.0);
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

        outColor =
            vec4(uColor, 1.0);
    }
    `;

    // --------------------------------------------------
    // COMPILAR SHADERS E CRIAR PROGRAMA
    // --------------------------------------------------

    function createShader(gl, type, source) {

        const shader =
            gl.createShader(type);

        gl.shaderSource(
            shader,
            source
        );

        gl.compileShader(shader);

        if (
            !gl.getShaderParameter(
                shader,
                gl.COMPILE_STATUS
            )
        ) {

            const error =
                gl.getShaderInfoLog(shader);

            gl.deleteShader(shader);

            throw new Error(error);
        }

        return shader;
    }

    function createProgram(
        gl,
        vertexShaderSource,
        fragmentShaderSource
    ) {

        const vertexShader =
            createShader(
                gl,
                gl.VERTEX_SHADER,
                vertexShaderSource
            );

        const fragmentShader =
            createShader(
                gl,
                gl.FRAGMENT_SHADER,
                fragmentShaderSource
            );

        const program =
            gl.createProgram();

        gl.attachShader(
            program,
            vertexShader
        );

        gl.attachShader(
            program,
            fragmentShader
        );

        gl.linkProgram(program);

        if (
            !gl.getProgramParameter(
                program,
                gl.LINK_STATUS
            )
        ) {

            throw new Error(
                gl.getProgramInfoLog(program)
            );
        }

        return program;
    }

    const program =
        createProgram(
            gl,
            vertexShaderSource,
            fragmentShaderSource
        );

    // --------------------------------------------------
    // CLASSE RENDERER
    // --------------------------------------------------

    class Renderer {

        constructor(gl, program) {

            this.gl = gl;

            this.program = program;

            this.positionLocation =
                gl.getAttribLocation(
                    program,
                    "aPosition"
                );

            this.colorLocation =
                gl.getUniformLocation(
                    program,
                    "uColor"
                );

            this.viewTransformLocation =
                gl.getUniformLocation(
                    program,
                    "u_viewTransform"
                );

            this.modelTransformLocation =
                gl.getUniformLocation(
                    program,
                    "u_modelTransform"
                );

            this.viewTransform =
                m3.identity();

            this.verticesBuffer =
                gl.createBuffer();
        }

        defineViewTransform(viewTransform) {

            this.viewTransform =
                viewTransform;
        }

        draw(object) {

            const gl = this.gl;

            gl.bindBuffer(
                gl.ARRAY_BUFFER,
                this.verticesBuffer
            );

            gl.bufferData(
                gl.ARRAY_BUFFER,
                object.vertices,
                gl.STATIC_DRAW
            );

            gl.enableVertexAttribArray(
                this.positionLocation
            );

            gl.vertexAttribPointer(
                this.positionLocation,
                2,
                gl.FLOAT,
                false,
                0,
                0
            );

            gl.uniform3fv(
                this.colorLocation,
                object.color
            );

            gl.uniformMatrix3fv(
                this.modelTransformLocation,
                false,
                object.modelTransform
            );

            gl.uniformMatrix3fv(
                this.viewTransformLocation,
                false,
                this.viewTransform
            );

            gl.drawArrays(
                gl.TRIANGLES,
                0,
                object.vertices.length / 2
            );
        }
    }


    // --------------------------------------------------
    // AUXILIARY FUNCTIONS
    // --------------------------------------------------

    function rectangleVertices(x, y, width, height) {

        return [
            x, y,
            x + width, y + height,
            x, y + height,

            x, y,
            x + width, y,
            x + width, y + height
        ];
    }


    // --------------------------------------------------
    // CLASSE SCENE OBJECT
    // --------------------------------------------------

    class SceneObject {

        constructor(vertices, color) {
            this.vertices = vertices;
            this.color = color;
            this.modelTransform = m3.identity();
        }

        updateModelTransform(modelTransform) {
            this.modelTransform = modelTransform;
        }
    }

    class RectObject extends SceneObject {

        constructor(x, y, width, height, color) {
            super(
                new Float32Array(
                    rectangleVertices(
                        x,
                        y,
                        width,
                        height
                    )
                ),
                new Float32Array(color)
            );
        }
    }


    // --------------------------------------------------
    // ROBOT PARTS
    // --------------------------------------------------

    function createHeadParts(scale) {

        const cBeige = [0.9, 0.85, 0.7];
        const cTeal = [0.2, 0.40, 0.35];
        const cYellow = [0.9, 0.90, 0.5];

        return [
            new RectObject(-0.6 * scale, -0.5 * scale, 1.2 * scale, 1.0 * scale, cBeige),
            new RectObject(-0.75 * scale, -0.15 * scale, 0.15 * scale, 0.3 * scale, cBeige),
            new RectObject(0.6 * scale, -0.15 * scale, 0.15 * scale, 0.3 * scale, cBeige),
            new RectObject(-0.5 * scale, -0.4 * scale, 1.0 * scale, 0.8 * scale, cTeal),
            new RectObject(-0.3 * scale, 0.05 * scale, 0.15 * scale, 0.1 * scale, cYellow),
            new RectObject(0.15 * scale, 0.05 * scale, 0.15 * scale, 0.1 * scale, cYellow),
            new RectObject(-0.2 * scale, -0.25 * scale, 0.4 * scale, 0.1 * scale, cYellow),
            new RectObject(-0.2 * scale, -0.15 * scale, 0.1 * scale, 0.1 * scale, cYellow),
            new RectObject(0.1 * scale, -0.15 * scale, 0.1 * scale, 0.1 * scale, cYellow),
        ];
    }


    // --------------------------------------------------
    // CLASSE ROBOT
    // --------------------------------------------------

    class Robot {

        constructor(tx, ty) {

            this.tx = tx;
            this.ty = ty;
            this.time = 0.0;

            const cBeige = [0.9, 0.85, 0.7];
            const cTeal = [0.2, 0.40, 0.35];
            const cGray = [0.4, 0.4, 0.4];

            this.body =
                new RectObject(-0.25, -0.3, 0.5, 0.6, cTeal);

            this.neck =
                new RectObject(-0.05, 0.25, 0.1, 0.1, cGray);

            this.headParts =
                createHeadParts(0.35);

            this.leftArm =
                new RectObject(-0.06, -0.4, 0.12, 0.4, cBeige);

            this.rightArm =
                new RectObject(-0.06, -0.4, 0.12, 0.4, cBeige);

            this.leftLeg =
                new RectObject(-0.07, -0.45, 0.14, 0.45, cBeige);

            this.rightLeg =
                new RectObject(-0.07, -0.45, 0.14, 0.45, cBeige);
        }

        update() {

            this.time += 0.05;

            const bodyY =
                this.ty + Math.sin(this.time) * 0.05;

            const robotTransform =
                m3.translation(this.tx, bodyY);

            this.body.updateModelTransform(
                robotTransform
            );

            this.neck.updateModelTransform(
                robotTransform
            );

            const headRotation =
                Math.sin(this.time * 0.5) * 0.2;

            const headLocal =
                m3.multiply(
                    m3.translation(0.0, 0.45),
                    m3.rotation(headRotation)
                );

            const headTransform =
                m3.multiply(
                    robotTransform,
                    headLocal
                );

            for (const part of this.headParts) {

                part.updateModelTransform(
                    headTransform
                );
            }

            const leftArmRot =
                Math.sin(this.time) * 1.5;

            const leftArmLocal =
                m3.multiply(
                    m3.translation(-0.32, 0.2),
                    m3.rotation(leftArmRot)
                );

            this.leftArm.updateModelTransform(
                m3.multiply(
                    robotTransform,
                    leftArmLocal
                )
            );

            const rightArmRot =
                -Math.sin(this.time) * 1.5;

            const rightArmLocal =
                m3.multiply(
                    m3.translation(0.32, 0.2),
                    m3.rotation(rightArmRot)
                );

            this.rightArm.updateModelTransform(
                m3.multiply(
                    robotTransform,
                    rightArmLocal
                )
            );

            const leftLegRot =
                -Math.sin(this.time) * 0.8;

            const leftLegLocal =
                m3.multiply(
                    m3.translation(-0.13, -0.3),
                    m3.rotation(leftLegRot)
                );

            this.leftLeg.updateModelTransform(
                m3.multiply(
                    robotTransform,
                    leftLegLocal
                )
            );

            const rightLegRot =
                Math.sin(this.time) * 0.8;

            const rightLegLocal =
                m3.multiply(
                    m3.translation(0.13, -0.3),
                    m3.rotation(rightLegRot)
                );

            this.rightLeg.updateModelTransform(
                m3.multiply(
                    robotTransform,
                    rightLegLocal
                )
            );
        }

        draw(renderer) {

            renderer.draw(this.leftLeg);
            renderer.draw(this.rightLeg);
            renderer.draw(this.leftArm);
            renderer.draw(this.rightArm);
            renderer.draw(this.neck);
            renderer.draw(this.body);

            for (const part of this.headParts) {
                renderer.draw(part);
            }
        }
    }


    // --------------------------------------------------
    // CLASSE SCENE
    // --------------------------------------------------

    class Scene {

        constructor(gl, program) {

            this.renderer = new Renderer(gl, program);

            this.viewTransform =
                m3.setClippingWindow(-1.2, -1.2, 1.2, 1.2);

            this.renderer.defineViewTransform(
                this.viewTransform
            );

            this.robot = new Robot(0.0, 0.0);
        }

        update() {
            this.robot.update();
        }

        draw() {
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(program);
            this.robot.draw(this.renderer);
        }

        execute() {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.execute());
        }

        init() {
            requestAnimationFrame(() => this.execute());
        }
    }


    // --------------------------------------------------
    // CONFIGURAÇÃO INICIAL E BOOT
    // --------------------------------------------------

    gl.clearColor(
        0.1,
        0.1,
        0.2,
        1.0
    );

    gl.viewport(
        0,
        0,
        canvas.width,
        canvas.height
    );

    const scene = new Scene(gl, program);

    scene.init();

})();
