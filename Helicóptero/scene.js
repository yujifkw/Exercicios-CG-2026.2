// ==================================================
// CLASS - SCENE
// ==================================================

class Scene {

    constructor(gl, program) {

        this.renderer =
            new Renderer(gl, program);

        // Figura que será exibida
        this.helicopter = new Helicopter();

        this.theta = 0.0;
    }

    update() {
        this.theta += 0.01;
        
        let rotX = m4.xRotation(this.theta);
        let rotY = m4.yRotation(this.theta * 0.7); // Multiplying by 0.7 to give a slightly different speed for a more dynamic 3D feel
        
        this.helicopter.update(m4.multiply(rotY, rotX));
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

