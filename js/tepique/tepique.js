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
    constructor(ground, ratio, line_color, ground_color){
        this.ground = ground;
        this.ratio = ratio;
        this.line_color = line_color;
        this.ground_color = ground_color;
        this.width = undefined;
        this.height = undefined;
        this.mesh = undefined;
    }

    generateMesh(){

        material = new THREE.LineBasicMaterial( { color: this.line_color } );

        var ground_width = this.ground.width;
        var ground_height = this.ground.height;

        this.width = ground_width/12;
        this.height = ground_height*this.ratio;

        var group = new THREE.Group();

        geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3( -1*ground_width/2, this.height/2, 0) );
        geometry.vertices.push(new THREE.Vector3( -1*(this.width+ground_width/2), this.height/2, 0) );
        geometry.vertices.push(new THREE.Vector3( -1*(this.width+ground_width/2), -this.height/2, 0) );
        geometry.vertices.push(new THREE.Vector3( -1*ground_width/2, -this.height/2, 0) );
        group.add(new THREE.Line( geometry, material ));

        geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3( ground_width/2, this.height/2, 0) );
        geometry.vertices.push(new THREE.Vector3( (this.width+ground_width/2), this.height/2, 0) );
        geometry.vertices.push(new THREE.Vector3( (this.width+ground_width/2), -this.height/2, 0) );
        geometry.vertices.push(new THREE.Vector3( ground_width/2, -this.height/2, 0) );
        group.add(new THREE.Line(geometry, material));

        geometry = new THREE.PlaneBufferGeometry(this.width, this.height);
        material = new THREE.MeshBasicMaterial( { color: this.ground_color} );
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = -(ground_width/2+this.width/2);
        group.add(mesh);

        geometry = new THREE.PlaneBufferGeometry(this.width, this.height);
        material = new THREE.MeshBasicMaterial( { color: this.ground_color} );
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = ground_width/2+this.width/2;
        group.add(mesh);

        this.mesh = group;

        return group;
    }

    getUpperDot(){return this.ground.height/2*this.ratio;}
    getLowerDot(){return -this.ground.height/2*this.ratio;}
    get ratio(){return this._ratio;}
    set ratio(ratio){this._ratio = ratio;}
    get color(){return this._color;}
    set color(color){this._color = color;}
    get width(){return this._width;}
    set width(width){this._width = width;}
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
        
        loader.load( 'js/three/fonts/helvetiker_regular.typeface.json', function ( response ) {
            createText(response);
        } );

        group.position.x = this.x;
        group.position.y = this.y;
        group.position.z = 0.00001;

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

        group.position.z = 0.00001;
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
        this.score = [0,0];
        this.isGoal = [false, false];
        this.clock = new THREE.Clock(false);
    }

    play(){
        this.borders(this.player);
        this.borders(this.ball);
        this.ballCollision();
        this.kickBall();
        this.goal();
    }

    borders(object){
        var x = object.mesh.position.x;
        var y = object.mesh.position.y;
        var x_border = this.ground.width/2;
        var y_border = this.ground.height/2;
        var goalpost_up = this.goalpost.getUpperDot();
        var goalpost_lower = this.goalpost.getLowerDot();

        if(x >= x_border-object.radius && (y >= goalpost_up || y <= goalpost_lower)){
            object.mesh.position.x = x_border-object.radius;
        }else if(y >= y_border-object.radius){
            object.mesh.position.y = y_border-object.radius;
        }else if(x <= -x_border+object.radius && (y >= goalpost_up || y <= goalpost_lower)){
            object.mesh.position.x = -x_border+object.radius;
        }else if(y <= -y_border+object.radius){
            object.mesh.position.y = -y_border+object.radius;
        }

        if(x >= x_border-object.radius && y >= y_border-object.radius){
            object.mesh.position.x = x_border-object.radius;
            object.mesh.position.y = y_border-object.radius;
        }else if(x >= x_border-object.radius && y <= -y_border+object.radius){
            object.mesh.position.x = x_border-object.radius;
            object.mesh.position.y = -y_border+object.radius;
        }else if(x <= -x_border+object.radius && y <= -y_border+object.radius){
            object.mesh.position.x = -x_border+object.radius;
            object.mesh.position.y = -y_border+object.radius;
        }else if(y >= y_border-object.radius && x <= -x_border+object.radius){
            object.mesh.position.x = -x_border+object.radius;
            object.mesh.position.y = y_border-object.radius;
        }

    }

    ballCollision(){
        var player = this.player;
        var ball = this.ball;
        
        if(this.isCollision(player, ball) == 0){
            var rad = this.radian(player, ball);
            ball.mesh.position.x += Math.cos(rad)*0.1;
            ball.mesh.position.y += Math.sin(rad)*0.1;
        }
    }

    isCollision(){
        var dist = this.distance(this.ball, this.player);

        if(dist <= (this.ball.radius + this.player.radius)){    //touch
            return 0;
        }else if(dist <= (this.ball.radius + this.player.radius+0.1)){  //so close
            return 1;
        }else{
            return -1;  //not contact
        }
    }

    distance(object1, object2){
        var dx = object1.mesh.position.x - object2.mesh.position.x;
        var dy = object1.mesh.position.y - object2.mesh.position.y;
        return Math.sqrt(dx*dx + dy*dy);
    }

    radian(object1, object2){
        var rad = Math.atan2(object1.mesh.position.y - object2.mesh.position.y, object1.mesh.position.x - object2.mesh.position.x);
        var invertedRad;
        if(rad <= 0){
            invertedRad = rad + Math.PI;
        }else{
            invertedRad = rad - Math.PI;
        }
        return invertedRad;
    }

    kickBall(){
        if(this.isCollision(this.player, this.ball) == 1){
            if(this.control.name == "keyboard" && this.control.kick){
                var rad = this.radian(this.player, this.ball);
                this.ball.mesh.position.x += Math.cos(rad)*this.player.kickSpeed;
                this.ball.mesh.position.y += Math.sin(rad)*this.player.kickSpeed;
            }
        }
    }

    goal(){
        var ballx = this.ball.mesh.position.x;

        if(ballx >= this.ground.width/2 && !this.isGoal[0]){
            this.score[0]++;
            this.isGoal[0] = true;
            this.clock.start();
        }else if(ballx <= -this.ground.width/2 && !this.isGoal[1]){
            this.score[1]++;
            this.isGoal[1] = true;
            this.clock.start();
        }
        if(this.isGoal[0] || this.isGoal[1]){
            if(this.clock.getElapsedTime() >= 3){
                this.refresh();
                this.isGoal = [false, false];
                this.clock.stop();
            }
        }
    }

    refresh(){
        this.player.mesh.position.set(this.player.x, this.player.y, 0.00001);
        this.ball.mesh.position.set(0, 0, 0.00001);
    }

    get ground(){return this._ground;}
    set ground(ground){this._ground = ground;}
    get score(){return this._score;}
    set score(score){this._score = score;}
    get clock(){return this._clock;}
    set clock(clock){this._clock = clock;}
}}

{Tepique.GUI = class {
    constructor(game, color){
        this.game = game;
        this.color = color;
        this.score_board = undefined;
        this.goal_clock = undefined;
    }

    place(){
        this.scoreBoard();
        this.goalClock();
    }

    update(){
        this.updateScoreBoard();
        this.updateGoalClock();
    }

    scoreBoard(){
        this.score_board = document.createElement("div");
        this.score_board.className = "ScoreBoard";
        this.score_board.style.color = "white";
        this.score_board.style.fontSize = "xx-large";
        var score_board_label = new THREE.CSS2DObject(this.score_board);
        score_board_label.position.set(0, this.game.ground.height/2+1, 0);
        this.game.ground.mesh.add(score_board_label);
    }

    updateScoreBoard(){
        this.score_board.textContent = this.game.score[0].toString() + "\t-\t" + this.game.score[1].toString();
    }

    goalClock(){
        this.goal_clock = document.createElement("div");
        this.goal_clock.className = "ScoreBoard";
        this.goal_clock.style.color = "white";
        this.goal_clock.style.fontSize = "xx-large";
        var goal_clock_label = new THREE.CSS2DObject(this.goal_clock);
        goal_clock_label.position.set(0, -(this.game.ground.height/2+1), 0);
        this.game.ground.mesh.add(goal_clock_label);
    }

    updateGoalClock(){
        var elapsed_time = this.game.clock.getElapsedTime();
        var countdown = 3-Math.floor(elapsed_time);
        if(elapsed_time == 0 || countdown == 0){
            this.goal_clock.textContent = "";
        }else{
            this.goal_clock.textContent = countdown.toString();
        }
    }
}}

{Tepique.Audio = class {

}}

{Tepique.KeyboardControl = class {
    constructor(player){
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
            script.src = "js/tepique/keyboardControl.js";
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

    get up(){return this._up;}
    set up(up){this._up = up;}
    get down(){return this._down;}
    set down(down){this._down = down;}
    get left(){return this._left;}
    set left(left){this._left = left;}
    get right(){return this._right;}
    set right(right){this._right = right;}
    get name(){return this._name;}
    set name(name){this._name = name;}
    get kick(){return this._kick;}
    set kick(kick){this._kick = kick;}
    get xSpeed(){return this._xSpeed;}
    set xSpeed(xSpeed){this._xSpeed = xSpeed;}
    get ySpeed(){return this._ySpeed;}
    set ySpeed(ySpeed){this._ySpeed = ySpeed;}
}}