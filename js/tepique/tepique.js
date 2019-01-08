class Tepique {}

{Tepique.Environment = class {
    constructor(camera_position){
        this.camera_position = camera_position;
        this.camera = undefined;
        this.scene = undefined;
        this.renderer = undefined;
        this.label_renderer = undefined;
        this.physics = undefined;
    }

    create(){
        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
        this.camera.position.z = this.camera_position;

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

        this.physics = new p2.World({
            gravity: [0, 0]
        });
    }

    animation(game, gui){
        requestAnimationFrame( animate );

        game.play();
        gui.update();

        this.renderer.render( this.scene, this.camera );
        this.label_renderer.render( this.scene, this.camera );
    }

    setWalls(physics){
        for(let i=0; i < physics.bodies.length; i++){
            if(physics.bodies[i].name == "wall"){
                let line = physics.bodies[i];
                physics.addContactMaterial(new p2.ContactMaterial(line.shapes[0].material, physics.getBodyById(99).shapes[0].material, {
                    restitution: 1,
                    stiffness: Number.MAX_VALUE,
                    friction: 0
                }));
                physics.addContactMaterial(new p2.ContactMaterial(line.shapes[0].material, physics.getBodyById(21).shapes[0].material, {
                    restitution: 0,
                    stiffness: Number.MAX_VALUE,
                    friction: 0
                }));
            }else if(physics.bodies[i].name == "goalpost"){
                let line = physics.bodies[i];
                physics.addContactMaterial(new p2.ContactMaterial(line.shapes[0].material, physics.getBodyById(99).shapes[0].material, {
                    restitution: 0,
                    stiffness: Number.MAX_VALUE,
                    friction: 0
                }));
                physics.addContactMaterial(new p2.ContactMaterial(line.shapes[0].material, physics.getBodyById(21).shapes[0].material, {
                    restitution: 0,
                    stiffness: Number.MAX_VALUE,
                    friction: 0
                }));
            }
        }
    }
}}

{Tepique.Ground = class {
    constructor(width, height, ground_color, line_color, co_fri){
        this.width = width;
        this.height = height;
        this.ground_color = ground_color;
        this.line_color = line_color;
        this.mesh = undefined;
    }
    
    generate(scene, physics){
        let material, geometry;
        let group = new THREE.Group();

        geometry = new THREE.PlaneBufferGeometry(this.width, this.height);
        material = new THREE.MeshBasicMaterial( { color: this.ground_color } );
        group.add(new THREE.Mesh(geometry, material));

        let circle_radius = this.height/7;

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

        scene.add(group);
        this.mesh = group;

        let line_shape, line;
        
        line_shape = new p2.Line({material: new p2.Material()});
        line = new p2.Body({
            position: [0, this.height/2]
        });
        line_shape.length = this.width;
        line.name = "wall";
        line.addShape(line_shape);
        physics.addBody(line);

        line_shape = new p2.Line({material: new p2.Material()});
        line = new p2.Body({
            position: [0, -this.height/2]
        });
        line_shape.length = this.width;
        line.name = "wall";
        line.addShape(line_shape);
        physics.addBody(line);
    }
}}

{Tepique.GoalPost = class {
    constructor(ground, ratio, line_color, ground_color){
        this.ground = ground;
        this.ratio = ratio;
        this.line_color = line_color;
        this.ground_color = ground_color;
        this.width = undefined;
        this.height = undefined;
    }

    generate(scene, physics){
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

        scene.add(group);

        let line, line_shape;

        line_shape = new p2.Line({material: new p2.Material()}); //right upper
        line = new p2.Body({
            position: [ground_width/2, this.height],
            angle: Math.PI/2
        });
        line_shape.length = this.height;
        line.name = "wall";
        line.addShape(line_shape);
        physics.addBody(line);

        line_shape = new p2.Line({material: new p2.Material()}); //right lower
        line = new p2.Body({
            position: [ground_width/2, -this.height],
            angle: Math.PI/2
        });
        line_shape.length = this.height;
        line.name = "wall";
        line.addShape(line_shape);
        physics.addBody(line);

        line_shape = new p2.Line({material: new p2.Material()}); //left upper
        line = new p2.Body({
            position: [-ground_width/2, this.height],
            angle: Math.PI/2
        });
        line_shape.length = this.height;
        line.name = "wall";
        line.addShape(line_shape);
        physics.addBody(line);

        line_shape = new p2.Line({material: new p2.Material()}); //left lower
        line = new p2.Body({
            position: [-ground_width/2, -this.height],
            angle: Math.PI/2
        });
        line_shape.length = this.height;
        line.name = "wall";
        line.addShape(line_shape);
        physics.addBody(line);

        line_shape = new p2.Line({material: new p2.Material()}); //left goalpost upper
        line = new p2.Body({
            position: [-(ground_width/2+this.width/2), this.height/2]
        });
        line_shape.length = this.width;
        line.name = "goalpost";
        line.addShape(line_shape);
        physics.addBody(line);

        line_shape = new p2.Line({material: new p2.Material()}); //left goalpost side
        line = new p2.Body({
            position: [-(ground_width/2+this.width), 0],
            angle: Math.PI/2
        });
        line_shape.length = this.height;
        line.name = "goalpost";
        line.addShape(line_shape);
        physics.addBody(line);

        line_shape = new p2.Line({material: new p2.Material()}); //left goalpost bottom
        line = new p2.Body({
            position: [-(ground_width/2+this.width/2), -this.height/2]
        });
        line_shape.length = this.width;
        line.name = "goalpost";
        line.addShape(line_shape);
        physics.addBody(line);

        line_shape = new p2.Line({material: new p2.Material()}); //right goalpost upper
        line = new p2.Body({
            position: [ground_width/2+this.width/2, this.height/2]
        });
        line_shape.length = this.width;
        line.name = "goalpost";
        line.addShape(line_shape);
        physics.addBody(line);

        line_shape = new p2.Line({material: new p2.Material()}); //right goalpost side
        line = new p2.Body({
            position: [ground_width/2+this.width, 0],
            angle: Math.PI/2
        });
        line_shape.length = this.height;
        line.name = "goalpost";
        line.addShape(line_shape);
        physics.addBody(line);

        line_shape = new p2.Line({material: new p2.Material()}); //right goalpost bottom
        line = new p2.Body({
            position: [ground_width/2+this.width/2, -this.height/2]
        });
        line_shape.length = this.width;
        line.name = "goalpost";
        line.addShape(line_shape);
        physics.addBody(line);
    }

    getUpperDot(){return this.ground.height/2*this.ratio;}
    getLowerDot(){return -this.ground.height/2*this.ratio;}
}}

{Tepique.Player = class {
    constructor(team, number, color, radius, x, y, kickSpeed, mass, damping){
        this.team = team;
        this.number = number;
        this.color = color;
        this.radius = radius;
        this.x = x;
        this.y = y;
        this.kickSpeed = kickSpeed;
        this.mass = mass;
        this.damping = damping;
    }

    generate(scene, physics){
        let material, geometry;

        var group = new THREE.Group();
        var rad = this.radius;
        var num = this.number;

        material = new THREE.MeshBasicMaterial( { color: this.color } );
        geometry = new THREE.CircleBufferGeometry( this.radius, 64 );
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
        group.userData = this.radius;
        scene.add(group);

        let player_shape = new p2.Circle({
            radius: this.radius,
            material: new p2.Material()
        });
        let player = new p2.Body({
            position: [0, 0],
            mass: this.mass,
            damping: this.damping,
            angularDamping: 1
        });
        player.addShape(player_shape);
        player.data = group;
        player.name = "player";
        player.id = 21;
        player.position[0] = this.x;
        player.position[1] = this.y;
        physics.addBody(player);
    }
}}

{Tepique.Ball = class {
    constructor(radius, color, mass, damping){
        this.radius = radius;
        this.color = color;
        this.mass = mass;
        this.damping = damping;
    }

    generate(scene, physics){

        let material, geometry;
        var group = new THREE.Group();

        material = new THREE.MeshBasicMaterial( { color: this.color } );
        geometry = new THREE.CircleBufferGeometry( this.radius, 64 );
        group.add(new THREE.Mesh( geometry, material ));

        material = new THREE.LineBasicMaterial( { color: 0x000000 } );
        geometry = new THREE.CircleGeometry( this.radius, 64);
        geometry.vertices.shift();
        group.add(new THREE.LineLoop( geometry, material ));

        group.position.z = 0.00001;
        group.userData = this.radius;
        scene.add(group);

        let ball_shape = new p2.Circle({
            radius: this.radius,
            material: new p2.Material()
        });
        let ball = new p2.Body({
            position: [0, 0],
            mass: this.mass,
            damping: this.damping,
            angularDamping: 1
        });
        ball.addShape(ball_shape);
        ball.data = group;
        ball.name = "ball";
        ball.id = 99;
        physics.addBody(ball);
    }
}}

{Tepique.Game = class {
    constructor(environment, ground, goalpost, players, ball, control_method, duration, score_limit){
        this.environment = environment;
        this.ground = ground;
        this.goalpost = goalpost;
        this.player = players;
        this.ball = ball;
        this.control_method = control_method;
        this.duration = duration;
        this.score_limit = score_limit;
        this.action = true;
        this.score = [0,0];
        this.isGoal = [false, false];
        this.goal_clock = new THREE.Clock(false);
        this.game_clock = new THREE.Clock(true);
        this.remaining_time = duration;
        this.init = function(){
            environment.create();
            ground.generate(environment.scene, environment.physics);
            goalpost.generate(environment.scene, environment.physics);
            players.generate(environment.scene, environment.physics);
            ball.generate(environment.scene, environment.physics);
            environment.setWalls(environment.physics);
            control_method.generate();
        }();
    }

    play(){
        if(this.action){
            this.environment.physics.step(1/60);
            this.playerControl();
            this.gameAnimation();
            this.kickBall();
            this.goal();
        }
        this.remainingTime();
    }

    isCollision(ball, player){
        var dist = this.distance(ball, player);
        if(dist <= (this.ball.radius + this.player.radius)){    //touch
            return 0;
        }else if(dist <= (this.ball.radius + this.player.radius+0.1)){  //so close
            return 1;
        }else{
            return -1;  //not contact
        }
    }

    distance(object1, object2){
        var dx = object1.position[0] - object2.position[0];
        var dy = object1.position[1] - object2.position[1];
        return Math.sqrt(dx*dx + dy*dy);
    }

    radian(object1, object2){
        var rad = Math.atan2(object1.position[1] - object2.position[1], object1.position[0] - object2.position[0]);
        var invertedRad;
        if(rad <= 0){
            invertedRad = rad + Math.PI;
        }else{
            invertedRad = rad - Math.PI;
        }
        return invertedRad;
    }

    kickBall(){
        let ball = this.environment.physics.getBodyById(99);
        let player = this.environment.physics.getBodyById(21);
        let col = this.isCollision(ball, player);
        if(col == 1 || col == 0){
            if(this.control_method instanceof Tepique.KeyboardControl && this.control_method.kick){
                let radian = this.radian(player, ball);
                ball.velocity[0] = ball.velocity[0] + this.player.kickSpeed * Math.cos(radian);
                ball.velocity[1] = ball.velocity[1] + this.player.kickSpeed * Math.sin(radian);
            }
        }
    }

    goal(){
        let physics = this.environment.physics;
        var ballx = physics.getBodyById(99).position[0];

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
                if(this.score[0] == this.score_limit || this.score[1] == this.score_limit){
                    this.action = false;
                }
                this.refresh();
                this.isGoal = [false, false];
                this.goal_clock.stop();
            }
        }
    }

    gameAnimation(){
        let ball = this.environment.physics.getBodyById(99);
        let player = this.environment.physics.getBodyById(21);

        ball.data.position.x = ball.position[0];
        ball.data.position.y = ball.position[1];
        player.data.position.x = player.position[0];
        player.data.position.y = player.position[1];
    }

    playerControl(){
        let physics = this.environment.physics;
        if(this.control_method instanceof Tepique.KeyboardControl){
            this.control_method.control();
            for(let i = 0; i < physics.bodies.length; i++){
                let body = physics.bodies[i];

                if(body.name == "player"){
                    if (this.control_method.move_up){    //up
                        body.force[1] += 5;
                    }
                    if (this.control_method.move_right){    //right
                        body.force[0] += 5;
                    }
                    if (this.control_method.move_down){    //down
                        body.force[1] -= 5;
                    }
                    if (this.control_method.move_left){    //left
                        body.force[0] -= 5;
                    }
                    if (this.control_method.move_upright){     //upright
                        body.force[1] += 5/Math.sqrt(2);
                        body.force[0] += 5/Math.sqrt(2);
                    }
                    if (this.control_method.move_downright){     //downright
                        body.force[0] += 5/Math.sqrt(2);
                        body.force[1] -= 5/Math.sqrt(2);
                    }
                    if (this.control_method.move_downleft){     //downleft
                        body.force[1] -= 5/Math.sqrt(2);
                        body.force[0] -= 5/Math.sqrt(2);
                    }
                    if (this.control_method.move_upleft){    //upleft
                        body.force[0] -= 5/Math.sqrt(2);
                        body.force[1] += 5/Math.sqrt(2);
                    }
                }
            }
        }
    }

    refresh(){
        let physics = this.environment.physics;
        physics.getBodyById(99).position[0] = 0;
        physics.getBodyById(99).position[1] = 0;
        physics.getBodyById(99).velocity[0] = 0;
        physics.getBodyById(99).velocity[1] = 0;
        physics.getBodyById(21).position[0] = this.player.x;
        physics.getBodyById(21).position[1] = this.player.y;
        physics.getBodyById(21).velocity[0] = 0;
        physics.getBodyById(21).velocity[1] = 0;
    }

    remainingTime(){
        if(this.action == true){
            this.remaining_time = this.duration-Math.floor(this.game_clock.getElapsedTime());
        }else if(this.remaining_time < 0 || this.action == false){
            this.remaining_time = -1;
            this.action = false;
        }
    }
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

        this.game_clock.textContent = (time < 0) ? "Game Finished!" : minutes + ":" + seconds;
    }
}}

{Tepique.PhysicsDebug = class {
    constructor(physics){
        this.physics = physics;
        this.width = undefined;
        this.height = undefined;
        this.ctx = undefined;
    }

    create(){
        var canvas = document.createElement("canvas");
        document.body.appendChild(canvas);
        canvas.style.position = "absolute";
        canvas.style.backgroundColor = "rgba(100,100,100,0.5)";
        canvas.style.zIndex = "100";
        canvas.style.left = "0px";
        canvas.width = window.innerWidth/1.75;
        canvas.height = window.innerHeight/2;
    
        this.width = canvas.width;
        this.height = canvas.height;
    
        this.ctx = canvas.getContext("2d");
        this.ctx.lineWidth = 0.05;
    }

    update(){
        this.ctx.clearRect(0,0,this.width,this.height);

        this.ctx.save();
        this.ctx.translate(this.width/2, this.height/2);
        this.ctx.scale(15, -15);

        for (var i = 0; i < this.physics.bodies.length; i++) {
            let body = this.physics.bodies[i];
            if(body.name == "player" || body.name == "ball"){
                this.ctx.strokeStyle = '#000000';
                this.drawCircle(body);
            }else if(body.name == "wall"){
                this.ctx.strokeStyle = '#FFFFFF';
                this.drawLine(body);
            }else if(body.name == "goalpost"){
                this.ctx.strokeStyle = '#D90000';
                this.drawLine(body);
            }
        }
        this.ctx.restore();
    }

    drawLine(body){
        this.ctx.beginPath();
        this.ctx.save();
        this.ctx.translate(body.position[0], body.position[1]);
        if(body.angle == Math.PI/2){
            this.ctx.moveTo(0, -body.shapes[0].length/2);
            this.ctx.lineTo(0, body.shapes[0].length/2);
        }else{
            this.ctx.moveTo(-body.shapes[0].length/2, 0);
            this.ctx.lineTo(body.shapes[0].length/2, 0);
        }
        this.ctx.stroke();
        this.ctx.restore();
    }

    drawCircle(body){
        this.ctx.beginPath();
        this.ctx.save();
        this.ctx.translate(body.position[0], body.position[1]);
        let radius = body.data.userData;
        this.ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        if(body.name == "player"){
            this.ctx.fillStyle = "yellow";
        }else{
            this.ctx.fillStyle = "blue";
        }
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();
    }
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
}}