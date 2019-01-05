class Tepique {}

{Tepique.Environment = class{
    constructor(){
        this.camera = undefined;
        this.scene = undefined;
        this.renderer = undefined;
        this.label_renderer = undefined;
    }

    create(){
        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
        this.camera.position.z = 15;

        this.scene = new THREE.Scene();

        this.renderer = new THREE.WebGLRenderer( { antialias: true} );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth-10, window.innerHeight-20 );
        this.renderer.setClearColor(0xFFFFFF, 0);
        document.body.appendChild( this.renderer.domElement );

        this.label_renderer = new THREE.CSS2DRenderer();
        this.label_renderer.setSize( window.innerWidth-10, window.innerHeight-20 );
        this.label_renderer.domElement.style.position = 'absolute';
        this.label_renderer.domElement.style.top = 0;
        document.body.appendChild( this.label_renderer.domElement );
    }

    animation(game, gui){
        requestAnimationFrame( animate );

        game.play();
        gui.update();

        this.renderer.render( this.scene, this.camera );
        this.label_renderer.render( this.scene, this.camera );
    }

    get scene(){return this._scene;}
    set scene(scene){this._scene = scene;}
    get renderer(){return this._renderer;}
    set renderer(renderer){this._renderer = renderer;}
    get label_renderer(){return this._label_renderer;}
    set label_renderer(label_renderer){this._label_renderer = label_renderer;}
    get camera(){return this._camera;}
    set camera(camera){this._camera = camera;}
}}

{Tepique.Ground = class {
    constructor(width, height, ground_color, line_color, co_fri){
        this.width = width;
        this.height = height;
        this.ground_color = ground_color;
        this.line_color = line_color;
        this.co_fri = co_fri;
        this.mesh = undefined;
    }
    
    generateMesh(){
        let material, geometry;
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
    get co_fri(){return this._co_fri;}
    set co_fri(co_fri){this._co_fri = co_fri;}
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
        let material, geometry, mesh;

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
    constructor(team, number, color, radius, x, y, speed_limit, kickSpeed){
        this.team = team;
        this.number = number;
        this.color = color;
        this.radius = radius;
        this.x = x;
        this.y = y;
        this.speed_limit = speed_limit;
        this.kickSpeed = kickSpeed;
        this.speed = undefined;
        this.mesh = undefined;
    }

    generateMesh(){
        let material, geometry;

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
            text.position.set(-rad/3, -rad/3, 0);
            group.add(text);
        }
        
        loader.load( 'js/three/fonts/helvetiker_regular.typeface.json', function ( response ) {
            createText(response);
        } );

        group.position.set(this.x, this.y, 0.00001);

        this.mesh = group;

        return group;
    }

    get x(){return this._x;}
    set x(x){this._x = x;}
    get y(){return this._y;}
    set y(y){this._y = y;}
    get kickSpeed(){return this._kickSpeed;}
    set kickSpeed(kickSpeed){this._kickSpeed = kickSpeed;}
    get speed_limit(){return this._speed_limit;}
    set speed_limit(speed_limit){this._speed_limit = speed_limit;}
    get speed(){return this._speed;}
    set speed(speed){this._speed = speed;}
    get mesh(){return this._mesh;}
    set mesh(mesh){this._mesh = mesh;}
}}

{Tepique.Ball = class {
    constructor(radius, color, accel){
        this.radius = radius;
        this.color = color;
        this.accel = accel;
        this.mesh = undefined;
        this.speed = 0;
        this.radian = 0;
    }

    generateMesh(){

        let material, geometry;
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

    get accel(){return this._accel;}
    set accel(accel){this._accel = accel;}
    get speed(){return this._speed;}
    set speed(speed){this._speed = speed;}
    get radian(){return this._radian;}
    set radian(radian){this._radian = radian;}
}}

{Tepique.Game = class {
    constructor(environment, ground, goalpost, players, ball, control_method, duration){
        this.environment = environment;
        this.ground = ground;
        this.goalpost = goalpost;
        this.player = players;
        this.ball = ball;
        this.control_method = control_method;
        this.score = [0,0];
        this.isGoal = [false, false];
        this.goal_clock = new THREE.Clock(false);
        this.game_clock = new THREE.Clock(true);
        this.duration = duration;
        this.remaining_time = duration;
        this.init = function(){
            environment.create();
            ground.generateMesh();
            goalpost.generateMesh();
            players.generateMesh();
            ball.generateMesh();

            environment.scene.add(ground.mesh);
            environment.scene.add(goalpost.mesh);
            environment.scene.add(players.mesh);
            environment.scene.add(ball.mesh);

            control_method.generate();
        }();
    }

    play(){
        this.playerControl();
        this.borders(this.player);
        this.borders(this.ball);
        this.kickBall();
        this.playerSpeed();
        this.ballAnimation();
        this.goal();
        this.remainingTime();
        //this.playerAnimation();
    }

    borders(object){
        var x = object.mesh.position.x;
        var y = object.mesh.position.y;
        var x_border = this.ground.width/2;
        var y_border = this.ground.height/2;
        var goalpost_up = this.goalpost.getUpperDot();
        var goalpost_lower = this.goalpost.getLowerDot();
        var isBall = object instanceof Tepique.Ball;

        if(x >= x_border-object.radius && (y >= goalpost_up || y <= goalpost_lower)){
            object.mesh.position.x = x_border-object.radius;
            if(isBall){
                object.radian = Math.PI - object.radian;
            }
        }else if(y >= y_border-object.radius){
            object.mesh.position.y = y_border-object.radius;
            if(isBall){
                object.radian = -object.radian;
            }
        }else if(x <= -x_border+object.radius && (y >= goalpost_up || y <= goalpost_lower)){
            object.mesh.position.x = -x_border+object.radius;
            if(isBall){
                object.radian = Math.PI - object.radian;
            }
        }else if(y <= -y_border+object.radius){
            object.mesh.position.y = -y_border+object.radius;
            if(isBall){
                object.radian = -object.radian;
            }
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
        var rad = Math.atan2(object1.mesh.position.y - object2.mesh.position.y, 
            object1.mesh.position.x - object2.mesh.position.x);
        var invertedRad;
        if(rad <= 0){
            invertedRad = rad + Math.PI;
        }else{
            invertedRad = rad - Math.PI;
        }
        return invertedRad;
    }

    kickBall(){
        if(this.isCollision(this.player, this.ball) == 1 || this.isCollision(this.player, this.ball) == 0){
            if(this.control_method instanceof Tepique.KeyboardControl && this.control_method.kick){
                this.ball.radian = this.radian(this.player, this.ball);
                this.ball.speed = this.player.kickSpeed;
            }
        }
    }

    ballAnimation(){
        if(this.ball.speed > 0){
            this.ball.mesh.position.x += Math.cos(this.ball.radian)*this.ball.speed*this.ground.co_fri;
            this.ball.mesh.position.y += Math.sin(this.ball.radian)*this.ball.speed*this.ground.co_fri;
            this.ball.speed -= this.ball.accel;
        }
        if(this.isCollision(this.player, this.ball) == 0){
            this.ball.radian = this.radian(this.player, this.ball);
            this.ball.mesh.position.x += Math.cos(this.ball.radian)*0.04;
            this.ball.mesh.position.y += Math.sin(this.ball.radian)*0.04;
            if(this.ball.speed <= 0){
                this.ball.radian = this.radian(this.player, this.ball);
                this.ball.speed = this.player.speed*5;
                this.ball.mesh.position.x += Math.cos(this.ball.radian)*this.ball.speed*this.ground.co_fri;
                this.ball.mesh.position.y += Math.sin(this.ball.radian)*this.ball.speed*this.ground.co_fri;
            }else{
                this.ball.radian = this.radian(this.player, this.ball);
                this.ball.speed = this.ball.speed-this.player.speed;
                this.ball.mesh.position.x += Math.cos(this.ball.radian)*this.ball.speed*this.ground.co_fri;
                this.ball.mesh.position.y += Math.sin(this.ball.radian)*this.ball.speed*this.ground.co_fri;
            }
        }
    }

    goal(){
        var ballx = this.ball.mesh.position.x;

        if(ballx >= this.ground.width/2 && !this.isGoal[0]){
            this.score[0]++;
            this.isGoal[0] = true;
            this.goal_clock.start();
        }else if(ballx <= -this.ground.width/2 && !this.isGoal[1]){
            this.score[1]++;
            this.isGoal[1] = true;
            this.goal_clock.start();
        }
        if(this.isGoal[0] || this.isGoal[1]){
            if(this.goal_clock.getElapsedTime() >= 3){
                this.refresh();
                this.isGoal = [false, false];
                this.goal_clock.stop();
            }
        }
    }

    playerSpeed(){
        if(this.isCollision(this.player, this.ball) == 0){
            this.player.speed = this.player.speed_limit/1.5;
        }else{
            this.player.speed = this.player.speed_limit;
        }
        if(this.control_method instanceof Tepique.KeyboardControl){
            if(!this.control_method.up && !this.control_method.right && !this.control_method.down
                && !this.control_method.left){
                this.player.speed = 0;
            }
        }
    }

    playerAnimation(){
        if(this.player.speed > 0){
        }
    }

    playerControl(){
        if(this.control_method instanceof Tepique.KeyboardControl){
            this.control_method.control();
            if (this.control_method.move_up){    //up
                this.player.mesh.position.y += this.player.speed;
            }
            if (this.control_method.move_right){    //right
                this.player.mesh.position.x += this.player.speed;
            }
            if (this.control_method.move_down){    //down
                this.player.mesh.position.y -= this.player.speed;
            }
            if (this.control_method.move_left){    //left
                this.player.mesh.position.x -= this.player.speed;
            }
            if (this.control_method.move_upright){     //upright
                this.player.mesh.position.y += this.player.speed/Math.sqrt(2);
                this.player.mesh.position.x += this.player.speed/Math.sqrt(2);
            }
            if (this.control_method.move_downright){     //downright
                this.player.mesh.position.x += this.player.speed/Math.sqrt(2);
                this.player.mesh.position.y -= this.player.speed/Math.sqrt(2);
            }
            if (this.control_method.move_downleft){     //downleft
                this.player.mesh.position.y -= this.player.speed/Math.sqrt(2);
                this.player.mesh.position.x -= this.player.speed/Math.sqrt(2);
            }
            if (this.control_method.move_upleft){    //upleft
                this.player.mesh.position.x -= this.player.speed/Math.sqrt(2);
                this.player.mesh.position.y += this.player.speed/Math.sqrt(2);
            }
        }
    }

    refresh(){
        this.player.mesh.position.set(this.player.x, this.player.y, 0.00001);
        this.ball.mesh.position.set(0, 0, 0.00001);
        this.ball.radian = 0;
        this.ball.speed = 0;
    }

    remainingTime(){
        this.remaining_time = this.duration-Math.floor(this.game_clock.getElapsedTime())
    }

    get remaining_time(){return this._remaining_time;}
    set remaining_time(remaining_time){this._remaining_time = remaining_time;}
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
        this.gameClock();
    }

    update(){
        this.updateScoreBoard();
        this.updateGoalClock();
        this.updateGameClock();
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
        this.goal_clock.className = "GoalClock";
        this.goal_clock.style.color = "white";
        this.goal_clock.style.backgroundColor = "black";
        this.goal_clock.style.fontSize = "xx-large";
        var goal_clock_label = new THREE.CSS2DObject(this.goal_clock);
        goal_clock_label.position.set(0, 0, 0);
        this.game.ground.mesh.add(goal_clock_label);
    }

    updateGoalClock(){
        var elapsed_time = this.game.goal_clock.getElapsedTime();
        var countdown = 3-Math.floor(elapsed_time);
        this.goal_clock.textContent = (elapsed_time == 0 || countdown <= 0) ? "" : countdown.toString();
    }

    gameClock(){
        this.game_clock = document.createElement("div");
        this.game_clock.className = "gameClock";
        this.game_clock.style.color = "white";
        this.game_clock.style.fontSize = "xx-large";
        var game_clock_label = new THREE.CSS2DObject(this.game_clock);
        game_clock_label.position.set(0, -(this.game.ground.height/2+1), 0);
        this.game.ground.mesh.add(game_clock_label);
    }

    updateGameClock(){
        var time = this.game.remaining_time;
        var minutes = Math.floor(time/60);
        var seconds = time - minutes*60;
        if(minutes < 10){
            minutes = "0" + minutes.toString();
        }
        if(seconds < 10){
            seconds = "0" + seconds.toString();
        }
        this.game_clock.textContent = (time < 0) ? "" : minutes + ":" + seconds;
    }
}}

{Tepique.Audio = class {
}}

{Tepique.KeyboardControl = class {
    constructor(){
        this.up = false;
        this.down = false;
        this.left = false;
        this.right = false;
        this.kick = false;
        this.move_up = false;
        this.move_right = false;
        this.move_down = false;
        this.move_left = false;
        this.move_upright = false;
        this.move_downright = false;
        this.move_downleft = false;
        this.move_upleft = false;
    }

    generate(){
        document.addEventListener('keydown',press)
        function press(e){
            if (e.keyCode === 38 /* up */ || e.keyCode === 87 /* w */){
                keyboard.up = true;
            }
            if (e.keyCode === 39 /* right */ || e.keyCode === 68 /* d */){
                keyboard.right = true;
            }
            if (e.keyCode === 40 /* down */ || e.keyCode === 83 /* s */){
                keyboard.down = true;
            }
            if (e.keyCode === 37 /* left */ || e.keyCode === 65 /* a */){
                keyboard.left = true;
            }
            if (e.keyCode === 32 /* space */ || e.keyCode == 88 /* x */){
                keyboard.kick = true;
            }
        }
        document.addEventListener('keyup',release)
        function release(e){
            if (e.keyCode === 38 /* up */ || e.keyCode === 87 /* w */){
                keyboard.up = false;
            }
            if (e.keyCode === 39 /* right */ || e.keyCode === 68 /* d */){
                keyboard.right = false;
            }
            if (e.keyCode === 40 /* down */ || e.keyCode === 83 /* s */){
                keyboard.down = false;
            }
            if (e.keyCode === 37 /* left */ || e.keyCode === 65 /* a */){
                keyboard.left = false;
            }
            if (e.keyCode === 32 /* space */ || e.keyCode == 88 /* x */){
                keyboard.kick = false;
            }
        }
    }

    control(){
        this.move_up = (this.up && !this.right && !this.down && !this.left) ? true : false;
        this.move_right = (this.right && !this.down && !this.left && !this.up) ? true : false;
        this.move_down = (this.down && !this.left && !this.up && !this.right) ? true : false;
        this.move_left = (this.left && !this.up && !this.right && !this.down) ? true : false;
        this.move_upright = (this.up && this.right && !this.down && !this.left) ? true : false;
        this.move_downright = (this.right && this.down && !this.left && !this.up) ? true : false;
        this.move_downleft = (this.down && this.left && !this.up && !this.right) ? true : false;
        this.move_upleft = (this.left && this.up && !this.right && !this.down) ? true : false;
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
    get speed(){return this._speed;}
    set speed(speed){this._speed = speed;}
}}