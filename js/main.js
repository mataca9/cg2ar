// Phyfics

var g = 0.025;
var vl = 0.4;

function distancePlain(pos1, pos2){
    var a = pos1.x - pos2.x;
    var b = pos1.z - pos2.z;

    var c = Math.sqrt( a*a + b*b );
}

function ground(scene) {
    var geometry = new THREE.PlaneGeometry(20, 20, 1);
    var material = new THREE.MeshStandardMaterial({ name: 'ground', opacity: 0, color: 0xaaaaaa, side: THREE.DoubleSide });
    // var material = new THREE.MeshNormalMaterial({
    //     transparent: true,
    //     opacity: 1,
    //     side: THREE.DoubleSide
    // });

    var ground = new THREE.Mesh(geometry, material);

    ground.position.x += 0.5;
    ground.position.z += 1;
    ground.receiveShadow = true;
    ground.rotation.x = Math.PI / 2;
    scene.add(ground);

    ground.material.transparent = true;

    return ground;
}

function sphere(scene) {
    var geometry = new THREE.SphereGeometry(0.2, 32, 32);
    var material = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    var sphere = new THREE.Mesh(geometry, material);

    sphere.castShadow = true; //default is false
    sphere.receiveShadow = false; //default

    sphere.position.y = 5;
    sphere = Object.assign(sphere, new Behavior());
    scene.add(sphere);

    return sphere;
}

function cube(scene) {
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var materials = new THREE.MeshStandardMaterial(
        new THREE.MeshStandardMaterial({ color: 0xffff00 })
    );
    var cube = new THREE.Mesh(geometry, materials);

    cube.position.y = cube.geometry.parameters.height / 2 + 0.05;
    cube = Object.assign(cube, new Behavior(scene));
    scene.add(cube);

    return cube;
}

function cylinder(scene, opacity = 1) {
    var materials = new THREE.MeshStandardMaterial(
        new THREE.MeshStandardMaterial({ color: 0x00ff00 })
    );

    var extrudeSettings = {
        amount: 1.7,
        steps: 1,
        bevelEnabled: false,
        curveSegments: 8
    };

    var arcShape = new THREE.Shape();
    arcShape.absarc(0, 0, 0.75, 0, Math.PI * 2, false);

    var holePath = new THREE.Path();
    holePath.absarc(0, 0, 0.75, 0, Math.PI * 2, true);
    arcShape.holes.push(holePath);

    var geometry = new THREE.ExtrudeGeometry(arcShape, extrudeSettings);

    var cylinder = new THREE.Mesh(geometry, materials);

    cylinder = Object.assign(cylinder, new Behavior(scene));
    cylinder.rotation.x = -Math.PI / 2;
    scene.add(cylinder);
    return cylinder;
}

function Behavior() {
    this.vy = 0;
    this.vx = 0;
    this.vz = 0;
    this.rx = 0;
    this.ry = 0;
    this.rz = 0;
    this.stop = false;
    this.hity = false;
    this.hitx = false;
    this.hitz = false;
    this.objective = null;
    this.preparing = false;

    this.jump = function (power = 0.05) {
        if (!this.stop) return;

        this.vy = power;
        this.position.y += 0.1;
    }

    this.release = function (power) {
        if (!this.stop) return;

        this.position.y += 0.1;
        this.vz = power / 100 * Math.cos(this.rotation.x - Math.PI / 2);
        this.vx = power / 100 * -Math.cos(this.rotation.z - Math.PI / 2);
        this.vy = power / 100 * -Math.sin(this.rotation.z - Math.PI / 2);
    }

    this.maxRelease = function () {
        this.power = 0.5;
        this.preparing = true;
        this.release();
    }

    this.moveTo = function (pos) {
        this.moving = true;
        this.objective = pos;
    }

    this.hitTest = function (element) {
        const size = this.geometry.type === "SphereGeometry" ? this.geometry.parameters.radius : this.geometry.parameters.height / 2;

        const xRange = [element.position.x - size / 2 - element.geometry.parameters.width / 2, element.position.x + size / 2 + element.geometry.parameters.width / 2];
        const zRange = [element.position.z - size / 2 - element.geometry.parameters.height / 2, element.position.z + size / 2 + element.geometry.parameters.height / 2];

        this.hity = this.position.y <= element.position.y + size;
        this.hitx = this.position.x >= xRange[0] && this.position.x <= xRange[1];
        this.hitz = this.position.z >= zRange[0] && this.position.z <= zRange[1];

        if (this.hity && this.hitx && this.hitz) {
            this.stop = this.vy < 0.04 && this.vy > -0.04;
            this.position.y = element.position.y + size;
            this.vx *= 0.95;
            this.vz *= 0.95;
        } else {
            this.stop = false;
        }

    }

    this.update = function () {
        this.vy -= g;
        this.position.y += this.vy;
        this.position.x += this.vx;
        this.position.z += this.vz;
        this.rotation.x += this.rx;
        this.rotation.y += this.ry;
        this.rotation.z += this.rz;

        if (this.hity && this.hitx && this.hitz) {
            this.vy *= vl;
            this.vy = -this.vy;
        }

        if (this.objective) {
            if (this.position.x == this.objective.x && this.position.z == this.objective.z) {
                this.objetive = null;
                return;
            }

            const dx = this.position.x - this.objective.x;
            const dz = this.position.z - this.objective.z;

            this.position.x += dx > 0.5 ? -0.05 : dx < -0.5 ? 0.05 : 0;
            this.position.z += dz > 0.5 ? -0.05 : dz < -0.5 ? 0.05 : 0;
        }
    }
}

THREE.CylinderCurvedSurfaceGeometry = function (radius, height, startAngle, endAngle, horizontalSegments, verticalSegments) {
    var width = radius * 2 * Math.PI;
    var plane = new THREE.PlaneGeometry(width, height, horizontalSegments, verticalSegments);
    var index = 0;

    for (var i = 0; i <= verticalSegments; i++) {
        for (var j = 0; j <= horizontalSegments; j++) {
            var angle = startAngle + (j / horizontalSegments) * (endAngle - startAngle);
            plane.vertices[index].z = radius * Math.cos(angle);
            plane.vertices[index].x = radius * Math.sin(angle);
            index++;
        }
    }

    return plane;
}