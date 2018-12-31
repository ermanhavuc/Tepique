class Tepique {}

{Tepique.Ground = class {

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
        geometry.vertices.push(new THREE.Vector3(0, -this.height/2, 0));
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

    get width(){return this._width;}
    set width(width){this._width = width;}
    get height(){return this._height;}
    set height(height){this._height = height;}
    get ground_color(){return this._ground_color;}
    set ground_color(ground_color){this._ground_color = ground_color;}
    get line_color(){return this._line_color;}
    set line_color(line_color){this._line_color = line_color;}
    get feature(){return this._feature;}
    set feature(feature){this._feature = feature;}
    get mesh(){return this._mesh;}
    set mesh(mesh){this._mesh = mesh;}
    
}}

{Tepique.GoalPost = class {
    constructor(ground, ratio, color){
        this.ground = ground;
        this.ratio = ratio;
        this.color = color;
        this.goalpost_width = undefined;
        this.mesh = undefined;
    }

    generateMesh(){

        material = new THREE.LineBasicMaterial( { color: this.color } );

        var width = this.ground.width;
        var height = this.ground.height;

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
}}

{Tepique.Player = class {
    constructor(team, number, color, radius, x, y, xSpeed, ySpeed, kickSpeed){
        this.team = team;
        this.number = number;
        this.color = color;
        this.radius = radius;
        this.x = x;
        this.y = y;
        this.xSpeed = xSpeed;
        this.ySpeed = ySpeed;
        this.kickSpeed = kickSpeed;
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

    get x(){return this._x;}
    set x(x){this._x = x;}
    get y(){return this._y;}
    set y(y){this._y = y;}
    get xSpeed(){return this._xSpeed;}
    set xSpeed(xSpeed){this._xSpeed = xSpeed;}
    get ySpeed(){return this._ySpeed;}
    set ySpeed(ySpeed){this._ySpeed = ySpeed;}
    get kickSpeed(){return this._kickSpeed;}
    set kickSpeed(kickSpeed){this._kickSpeed = kickSpeed;}
    get mesh(){return this._mesh;}
    set mesh(mesh){this._mesh = mesh;}
}}

{Tepique.Ball = class {
    constructor(radius, color){
        this.radius = radius;
        this.color = color;
        this.mesh = undefined;
    }

    generateMesh(){

        var group = new THREE.Group();

        material = new THREE.MeshBasicMaterial( { color: this.color } );
        geometry = new THREE.CircleGeometry( this.radius, 64 );
        group.add(new THREE.Mesh( geometry, material ));

        material = new THREE.LineBasicMaterial( { color: 0x000000 } );
        geometry = new THREE.CircleGeometry( this.radius, 64);
        geometry.vertices.shift();
        group.add(new THREE.LineLoop( geometry, material ));

        this.mesh = group;

        return group;
    }
}}

{Tepique.Game = class {
    constructor(ground, goalpost, players, ball, control){
        this.ground = ground;
        this.goalpost = goalpost;
        this.player = players;
        this.ball = ball;
        this.control = control;
    }

    play(){
        this.borders(this.player);
        this.borders(this.ball);
        this.ballCollision();
        this.kickBall();
    }

    borders(object){
        var ground = this.ground;

        if(object.mesh.position.x >= ground.width/2-object.radius){
            object.mesh.position.x = ground.width/2-object.radius;
        }else if(object.mesh.position.y >= ground.height/2-object.radius){
            object.mesh.position.y = ground.height/2-object.radius;
        }else if(object.mesh.position.x <= -ground.width/2+object.radius){
            object.mesh.position.x = -ground.width/2+object.radius;
        }else if(object.mesh.position.y <= -ground.height/2+object.radius){
            object.mesh.position.y = -ground.height/2+object.radius;
        }

        if((object.mesh.position.x >= ground.width/2-object.radius) && (object.mesh.position.y >= ground.height/2-object.radius)){
            object.mesh.position.x = ground.width/2-object.radius;
            object.mesh.position.y = ground.height/2-object.radius;
        }else if((object.mesh.position.x >= ground.width/2-object.radius) && (object.mesh.position.y <= -ground.height/2+object.radius)){
            object.mesh.position.x = ground.width/2-object.radius;
            object.mesh.position.y = -ground.height/2+object.radius;
        }else if((object.mesh.position.x <= -ground.width/2+object.radius) && (object.mesh.position.y <= -ground.height/2+object.radius)){
            object.mesh.position.x = -ground.width/2+object.radius;
            object.mesh.position.y = -ground.height/2+object.radius;
        }else if((object.mesh.position.y >= ground.height/2-object.radius) && (object.mesh.position.x <= -ground.width/2+object.radius)){
            object.mesh.position.y = ground.height/2-object.radius;
            object.mesh.position.x = -ground.width/2+object.radius;
        }

    }

    ballCollision(){
        var player = this.player;
        var ball = this.ball;
        var px = player.mesh.position.x;
        var py = player.mesh.position.y;
        var bx = ball.mesh.position.x;
        var by = ball.mesh.position.y;
        
        if(this.isCollision(player, ball)){
            var rad = Math.atan2(py - by, px - bx);
            var invertedRad;
            if(rad <= 0){
                invertedRad = rad + Math.PI;
            }else{
                invertedRad = rad - Math.PI;
            }
            ball.mesh.position.x += Math.cos(invertedRad)*0.1;
            ball.mesh.position.y += Math.sin(invertedRad)*0.1;
        }

        return invertedRad;
    }

    isCollision(){
        if(this.distance(this.ball, this.player) <= (this.ball.radius + this.player.radius)){
            return true;
        }else{
            return false;
        }
    }

    distance(object1, object2){
        var dx = object1.mesh.position.x - object2.mesh.position.x;
        var dy = object1.mesh.position.y - object2.mesh.position.y;
        return Math.sqrt(dx*dx + dy*dy);
    }

    kickBall(){
        if(this.isCollision(this.player, this.ball)){
            if(this.control.name == "keyboard" && this.control.kick){
                this.ball.mesh.position.x += 2;
                this.ball.mesh.position.y += 2;
            }
        }
    }
}}

{Tepique.KeyboardControl = class {
    constructor(player, ball){
        this.name = "keyboard";
        this.xSpeed = player.xSpeed;
        this.ySpeed = player.ySpeed;
        this.player = player;
        this.up = false;
        this.down = false;
        this.left = false;
        this.right = false;
        this.kick = false;
        this.init = function(){
            var script = document.createElement('script');
            script.src = "lib/keyboardControl.js";
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
    get name(){return this._name;}
    set name(name){this._name = name;}
    get kick(){return this._kick;}
    set kick(kick){this._kick = kick;}
    get xSpeed(){return this._xSpeed;}
    set xSpeed(xSpeed){this._xSpeed = xSpeed;}
    get ySpeed(){return this._ySpeed;}
    set ySpeed(ySpeed){this._ySpeed = ySpeed;}
}}