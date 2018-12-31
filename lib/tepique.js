class Tepique {}

Tepique.Ground = class {

    constructor(width, height, ground_color, line_color, feature){
        this.width = width;
        this.height = height;
        this.ground_color = ground_color;
        this.line_color = line_color;
        this.feature = feature;
        this.mesh = undefined;
    }
    
    generateMesh(){

        var group = new THREE.Group();

        geometry = new THREE.PlaneBufferGeometry(this.width, this.height);
        material = new THREE.MeshBasicMaterial( { color: this.ground_color} );
        group.add(new THREE.Mesh(geometry, material));

        var circle_radius = this.height/7;

        material = new THREE.LineBasicMaterial( { color: this.line_color } );
        geometry = new THREE.CircleGeometry(circle_radius, 64);
        geometry.vertices.shift();
        group.add(new THREE.LineLoop(geometry, material));

        geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(0, this.height/2, 0));
        geometry.vertices.push(new THREE.Vector3(0, circle_radius, 0));
        group.add(new THREE.Line(geometry, material));

        geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(0, -this.height/2, 0));
        geometry.vertices.push(new THREE.Vector3(0, -circle_radius, 0));
        group.add(new THREE.Line(geometry, material));

        geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(-this.width/2, this.height/2, 0));
        geometry.vertices.push(new THREE.Vector3(this.width/2, this.height/2, 0));
        geometry.vertices.push(new THREE.Vector3(this.width/2, -this.height/2, 0));
        geometry.vertices.push(new THREE.Vector3(-this.width/2, -this.height/2, 0));
        geometry.vertices.push(new THREE.Vector3(-this.width/2, this.height/2, 0));
        group.add(new THREE.Line(geometry, material));

        material = new THREE.MeshBasicMaterial( { color: this.line_color } );
        geometry = new THREE.CircleGeometry( circle_radius/10, 64 );
        group.add(new THREE.Mesh( geometry, material ));

        this.mesh = group;

        return group;
    }

    getWidth(){return this.width;}
    getHeight(){return this.height;}
    getGroundColor(){return this.ground_color;}
    getLineColor(){return this.line_color;}
    getFeature(){return this.feature;}
    get mesh(){return this._mesh;}
    set mesh(mesh){this._mesh = mesh;}
}

Tepique.GoalPost = class {
    constructor(ground, ratio, color){
        this.ground = ground;
        this.ratio = ratio;
        this.color = color;
        this.goalpost_width = undefined;
        this.mesh = undefined;
    }

    generateMesh(){

        material = new THREE.LineBasicMaterial( { color: this.color } );

        var width = this.ground.getWidth();
        var height = this.ground.getHeight();

        this.goalpost_width = width/12;

        var group = new THREE.Group();

        geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3( -1*width/2, height/2*this.ratio, 0) );
        geometry.vertices.push(new THREE.Vector3( -1*(this.goalpost_width+width/2), height/2*this.ratio, 0) );
        geometry.vertices.push(new THREE.Vector3( -1*(this.goalpost_width+width/2), -height/2*this.ratio, 0) );
        geometry.vertices.push(new THREE.Vector3( -1*width/2, -height/2*this.ratio, 0) );
        group.add(new THREE.Line( geometry, material ));

        geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3( width/2, height/2*this.ratio, 0) );
        geometry.vertices.push(new THREE.Vector3( (this.goalpost_width+width/2), height/2*this.ratio, 0) );
        geometry.vertices.push(new THREE.Vector3( (this.goalpost_width+width/2), -height/2*this.ratio, 0) );
        geometry.vertices.push(new THREE.Vector3( width/2, -height/2*this.ratio, 0) );
        group.add(new THREE.Line(geometry, material));

        this.mesh = group;

        return group;
    }

    getRatio(){return this.ratio;}
    getColor(){return this.color;}
    getFacet(){return this.facet;}
    getUpperDot(){return this.ground.getHeight()/2*this.ratio;}
    getLowerDot(){return -this.ground.getHeight()/2*this.ratio;}
    getWidth(){return this.goalpost_width;}
    get mesh(){return this._mesh;}
    set mesh(mesh){this._mesh = mesh;}
}

Tepique.Player = class {
    constructor(team, number, color, radius, x, y, xSpeed, ySpeed){
        this.team = team;
        this.number = number;
        this.color = color;
        this.radius = radius;
        this.x = x;
        this.y = y;
        this.xSpeed = xSpeed;
        this.ySpeed = ySpeed;
        this.mesh = undefined;
    }

    generateMesh(){
        
        var group = new THREE.Group();
        var rad = this.radius;
        var num = this.number;

        material = new THREE.MeshBasicMaterial( { color: this.color } );
        geometry = new THREE.CircleGeometry( this.radius, 64 );
        group.add(new THREE.Mesh( geometry, material ));

        material = new THREE.LineBasicMaterial( { color: 0x000000 } );
        geometry = new THREE.CircleGeometry( this.radius, 64);
        geometry.vertices.shift();
        group.add(new THREE.LineLoop( geometry, material ));

        var loader = new THREE.FontLoader();

        function createText(font){
            var geometry = new THREE.TextGeometry( num.toString(), {
                font: font,
                size: rad/1.3,
                height: 0.00001,
                curveSegments: 12,
                bevelEnabled: false,
            } );
            
            var text = new THREE.Mesh(geometry, material);
            text.position.x = -rad/3;
            text.position.y = -rad/3;
            group.add(text);
        }
        
        loader.load( 'three/fonts/helvetiker_regular.typeface.json', function ( response ) {
            createText(response);
        } );

        group.position.x = this.x;
        group.position.y = this.y;

        this.mesh = group;

        return group;
    }

    get xSpeed(){return this._xSpeed;}
    get ySpeed(){return this._ySpeed;}
    set xSpeed(xSpeed){this._xSpeed = xSpeed;}
    set ySpeed(ySpeed){this._ySpeed = ySpeed;}
    get mesh(){return this._mesh;}
    set mesh(mesh){this._mesh = mesh;}
}

Tepique.Ball = class {
    constructor(radius, x, y, color){
        this.radius = radius;
        this.x = x;
        this.y = y;
        this.color = color;
    }
}

Tepique.KeyboardControl = class {
    constructor(player){
        this.xSpeed = player.xSpeed;
        this.ySpeed = player.ySpeed;
        this.player = player;
        this.up = false;
        this.down = false;
        this.left = false;
        this.right = false;
        this.init = function(){
            var script = document.createElement('script');
            script.src = "lib/keyboardControl.js".split("/////")[0];
            script.onload = function () {};
            document.body.appendChild(script);
        }();
    }

    control(){
        if (this.up){
            this.player.mesh.position.y += this.ySpeed;
        }
        if (this.right){
            this.player.mesh.position.x += this.xSpeed;
        }
        if (this.down){
            this.player.mesh.position.y -= this.ySpeed;
        }
        if (this.left){
            this.player.mesh.position.x -= this.xSpeed;
        }
    }

    setUp(bool){this.up = bool;}
    setDown(bool){this.down = bool;}
    setLeft(bool){this.left = bool;}
    setRight(bool){this.right = bool;}
    getUp(){return this.up;}
    getDown(){return this.down;}
    getLeft(){return this.left;}
    getRight(){return this.right;}
    get xSpeed(){return this._xSpeed;}
    get ySpeed(){return this._ySpeed;}
    set xSpeed(xSpeed){this._xSpeed = xSpeed;}
    set ySpeed(ySpeed){this._ySpeed = ySpeed;}
}