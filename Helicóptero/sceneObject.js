// ==================================================
// CLASS - SCENE OBJECT
// ==================================================

class SceneObject {

    constructor(
        vertices,
        colors,
        indices,
    ) {

        this.vertices = vertices;
        this.colors = colors;
        this.indices = indices;

        this.modelTransform = m4.identity();
    }

    update(modelTransform) {
        this.modelTransform = modelTransform;
    }

    updateModelTransform(modelTransform) {

        this.modelTransform =
            modelTransform;
    }

    draw(renderer) {

        renderer.draw(this);
    }
}

class HelicopterBody extends SceneObject{
    constructor(){
        super(
            helicopterBodyGeometry.vertices,
            helicopterBodyGeometry.colors,
            helicopterBodyGeometry.indices
        );
    }
}

class HelicopterTopShaft extends SceneObject{
    constructor(){
        super(
            helicopterTopShaftGeometry.vertices,
            helicopterTopShaftGeometry.colors,
            helicopterTopShaftGeometry.indices
        );
    }
}

class HelicopterTail extends SceneObject{
    constructor(){
        super(
            helicopterTailGeometry.vertices,
            helicopterTailGeometry.colors,
            helicopterTailGeometry.indices
        );
    }
}

class HelicopterPropellers extends SceneObject{
    constructor(){
        super(
            helicopterPropellersGeometry.vertices,
            helicopterPropellersGeometry.colors,
            helicopterPropellersGeometry.indices
        );
    }
}

class HelicopterTailPropeller extends SceneObject{
    constructor(){
        super(
            helicopterTailPropellerGeometry.vertices,
            helicopterTailPropellerGeometry.colors,
            helicopterTailPropellerGeometry.indices
        );
    }
}

// --------------------------------------------------
// HELICOPTER (PARENT CLASS)
// --------------------------------------------------

class Helicopter extends SceneObject {
    constructor() {
        super([], [], []); // Helicopter itself has no geometry
        
        this.body = new HelicopterBody();
        this.topShaft = new HelicopterTopShaft();
        this.tail = new HelicopterTail();
        this.propellers = new HelicopterPropellers();
        this.tailPropeller = new HelicopterTailPropeller();
        
        this.propellerAngle = 0;
    }

    update(modelTransform) {
        this.modelTransform = modelTransform;
        this.propellerAngle += 0.2; // Increase angle for continuous rotation

        // Static parts relative to helicopter
        this.body.update(modelTransform);
        this.topShaft.update(modelTransform);
        this.tail.update(modelTransform);

        // Top propeller: Rotates around Y axis
        // Pivot is at X=0, Z=0
        let topPropLocal = m4.yRotation(this.propellerAngle);
        let topPropGlobal = m4.multiply(modelTransform, topPropLocal);
        this.propellers.update(topPropGlobal);

        // Tail propeller: Rotates around Z axis
        // Pivot is at X=0.7, Y=0.0, Z=0.06
        let tailPropLocal = m4.identity();
        tailPropLocal = m4.translate(tailPropLocal, -0.7, 0.0, -0.06);
        tailPropLocal = m4.zRotate(tailPropLocal, this.propellerAngle);
        tailPropLocal = m4.translate(tailPropLocal, 0.7, 0.0, 0.06);
        
        let tailPropGlobal = m4.multiply(modelTransform, tailPropLocal);
        this.tailPropeller.update(tailPropGlobal);
    }

    draw(renderer) {
        this.body.draw(renderer);
        this.topShaft.draw(renderer);
        this.tail.draw(renderer);
        this.propellers.draw(renderer);
        this.tailPropeller.draw(renderer);
    }
}
