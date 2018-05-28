var g = 0.025;
var vl = 0.4;

function ground(scene) {
    var geometry = new THREE.PlaneGeometry(3.2, 4.4, 1);
    var material = new THREE.MeshStandardMaterial({ name: 'ground', opacity:0.01, color: 0xaaaaaa, side: THREE.DoubleSide });
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

    return ground;
}

function sphere(scene, id) {
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

    cube.castShadow = true; //default is false
    cube.receiveShadow = false; //default

    cube.position.y = 1;
    cube = Object.assign(cube, new Behavior(scene));
    scene.add(cube);

    return cube;
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
    this.power = 0;
    this.preparing = false;

    this.jump = function (power = 0.05) {
        if(!this.stop) return;

        this.vy = power;
        this.position.y += 0.1;
    }

    this.powerUp = function () {
        if(!this.stop) return;
        
        this.power += this.power > 0.1 ? 0 : 0.001;
        this.preparing = true;
        const g = 255 - (Math.floor(this.power*2000) > 255 ? 255 : Math.floor(this.power*2000));
        this.material.color.setHex(((255 << 16) + (g << 8) + (0)));
        document.getElementById("power").innerText = `Power: ${Math.floor(this.power*1000)}%`;
    }

    this.release = function () {
        if(!this.stop) return;
        if(this.preparing){
            this.jump(this.power*1.2);
            this.vz = this.power;
            this.power = 0;
            this.material.color.setHex(0xffff00);
            this.preparing = false;
            document.getElementById("power").innerText = `Power: ${this.power}%`;
        }
    }

    this.maxRelease = function() {
        this.power = 0.1;
        this.preparing = true;
        this.release();
    }

    this.moveTo = function (pos) {
        this.moving = true;
        this.objective = pos;
    }

    this.hitTest = function (element) {
        const size = this.geometry.type === "SphereGeometry" ? this.geometry.parameters.radius : this.geometry.parameters.height / 2;

        const xRange = [element.position.x - size/2 - element.geometry.parameters.width/2, element.position.x + size/2 + element.geometry.parameters.width/2];
        const zRange = [element.position.z - size/2 - element.geometry.parameters.height/2, element.position.z + size/2 + element.geometry.parameters.height/2];

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

        if (this.hity && this.hitx && this.hitz ) {
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