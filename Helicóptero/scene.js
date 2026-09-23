// ==================================================
// CLASS - SCENE
// ==================================================

class Scene {

    constructor(gl, program) {

        this.renderer =
            new Renderer(gl, program);

        // Figura que será exibida
        this.helicopter = new Helicopter();

        this.posX = 0;
        this.posY = 0;

        this.keys = {};

        document.addEventListener("keydown", (event) => {
            this.keys[event.key] = true;
        });

        document.addEventListener("keyup", (event) => {
            this.keys[event.key] = false;
        });
    }

    update() {
        const step = 0.02;
        let tiltX = 0;
        let tiltY = 0;
        
        // Move o helicóptero e adiciona uma pequena inclinação coerente com o movimento
        if (this.keys["ArrowUp"]) {
            this.posY += step;
            tiltX = 0.2;
        }
        if (this.keys["ArrowDown"]) {
            this.posY -= step;
            tiltX = -0.2;
        }
        if (this.keys["ArrowLeft"]) {
            this.posX -= step;
            tiltY = -0.2;
        }
        if (this.keys["ArrowRight"]) {
            this.posX += step;
            tiltY = 0.2;
        }

        let translation = m4.translation(this.posX, this.posY, 0);
        let rotationX = m4.xRotation(tiltX);
        let rotationY = m4.yRotation(tiltY);
        
        // Combina Translação e Rotações (inclinação)
        let transform = m4.multiply(translation, m4.multiply(rotationY, rotationX));

        this.helicopter.update(transform);
    }

    draw() {

        gl.clear(
            gl.COLOR_BUFFER_BIT |
            gl.DEPTH_BUFFER_BIT
        );

        gl.useProgram(program);

        this.helicopter.draw(
            this.renderer
        );
    }

    execute() {

        this.update();
        this.draw();

        requestAnimationFrame(
            () => this.execute()
        );
    }

    init() {

        requestAnimationFrame(
            () => this.execute()
        );
    }
}

