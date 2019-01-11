class Tepique {}

{Tepique.Environment = class {
/*  ENVIRONMENT CLASS
*       -creates game environment: 3D scene, renderers and physics world
*       -animation loop
*       -set borders for players and the ball
*/
    constructor(camera_position){
        this.camera_position = camera_position;
        this.camera = undefined;
        this.scene = undefined;
        this.renderer = undefined;
        this.label_renderer = undefined;
        this.physics = undefined;
    }
    
    //creates environment elements: camera, three.js scene, renderers and physics world
    create(){   
        //generate camera with 70 FOV, screen-sized, 1 to near and 1000 to far plane
        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
        //set Z-axis camera position
        this.camera.position.z = this.camera_position;

        //create scene
        this.scene = new THREE.Scene();

        //set renderer for 3D models. screen-sized, background color white
        this.renderer = new THREE.WebGLRenderer( { antialias: true} );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth-10, window.innerHeight-20 );
        this.renderer.setClearColor(0xFFFFFF, 0);
        document.body.appendChild( this.renderer.domElement );

        //set randerer for HTML elements(GUI). Screen-sized, absolute position
        this.label_renderer = new THREE.CSS2DRenderer();
        this.label_renderer.setSize( window.innerWidth-10, window.innerHeight-20 );
        this.label_renderer.domElement.style.position = 'absolute';
        this.label_renderer.domElement.style.top = 0;
        document.body.appendChild( this.label_renderer.domElement );

        //generate p2 physics world
        this.physics = new p2.World({
            gravity: [0, 0]
        });
    }

    //animation loop
    animation(game, gui){
        requestAnimationFrame( animate );

        game.play();
        gui.update();

        this.renderer.render( this.scene, this.camera );
        this.label_renderer.render( this.scene, this.camera );
    }

    //sets borders for players and the ball
    setWalls(physics){
        for(let i=0; i < physics.bodies.length; i++){
            if(physics.bodies[i].name == "wall"){
                let line = physics.bodies[i];
                //setting restitution 1 allows to bounce from wall when ball hit
                physics.addContactMaterial(new p2.ContactMaterial(line.shapes[0].material, physics.getBodyById(99).shapes[0].material, {
                    restitution: 1,
                    stiffness: Number.MAX_VALUE,
                    friction: 0
                }));
                //setting restitution 0 removes bounce physics for players
                physics.addContactMaterial(new p2.ContactMaterial(line.shapes[0].material, physics.getBodyById(21).shapes[0].material, {
                    restitution: 0,
                    stiffness: Number.MAX_VALUE,
                    friction: 0
                }));
            }else if(physics.bodies[i].name == "goalpost"){
                let line = physics.bodies[i];
                //when ball met with goalpost walls, don't bounce
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
/*  GROUND CLASS
*       -generates ground(field) for 3D scene and physics engine
*/
    constructor(width, height, ground_color, line_color){
        this.width = width;
        this.height = height;
        this.ground_color = ground_color;
        this.line_color = line_color;
        this.mesh = undefined;
    }
    
    //create 3d scene mesh and physics body
    generate(scene, physics){
        let material, geometry;
        //this group used for assuming all different meshes in one mesh
        let group = new THREE.Group();


        // CREATE MESHES

        //field mesh
        geometry = new THREE.PlaneBufferGeometry(this.width, this.height);
        material = new THREE.MeshBasicMaterial( { color: this.ground_color } );
        group.add(new THREE.Mesh(geometry, material));

        //white hoop on the center position
        let circle_radius = this.height/7;
        material = new THREE.LineBasicMaterial( { color: this.line_color } );
        geometry = new THREE.CircleGeometry(circle_radius, 64);
        geometry.vertices.shift();
        group.add(new THREE.LineLoop(geometry, material));

        //vertical white lines on the center position
        geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(0, this.height/2, 0));
        geometry.vertices.push(new THREE.Vector3(0, -this.height/2, 0));
        group.add(new THREE.Line(geometry, material));

        //field borders
        geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(-this.width/2, this.height/2, 0));
        geometry.vertices.push(new THREE.Vector3(this.width/2, this.height/2, 0));
        geometry.vertices.push(new THREE.Vector3(this.width/2, -this.height/2, 0));
        geometry.vertices.push(new THREE.Vector3(-this.width/2, -this.height/2, 0));
        geometry.vertices.push(new THREE.Vector3(-this.width/2, this.height/2, 0));
        group.add(new THREE.Line(geometry, material));

        //center
        material = new THREE.MeshBasicMaterial( { color: this.line_color } );
        geometry = new THREE.CircleGeometry( circle_radius/10, 64 );
        group.add(new THREE.Mesh( geometry, material ));

        scene.add(group);   //add to scene
        this.mesh = group;


        // CREATE PHYSICS BODIES

        let line_shape, line;
        
        //upper border of field
        line_shape = new p2.Line({material: new p2.Material()});
        line = new p2.Body({
            position: [0, this.height/2]
        });
        line_shape.length = this.width;
        line.name = "wall";
        line.addShape(line_shape);
        physics.addBody(line);

        //lower border of field
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
/*  GOALPOST CLASS
*       -generates 3d scene meshes and physics bodies of groundposts related to created ground
*       -get methods for Y position of upper and lower dots of goalposts
*/
    constructor(ground, ratio, line_color, ground_color){
        this.ground = ground;
        this.ratio = ratio;
        this.line_color = line_color;
        this.ground_color = ground_color;
        this.width = undefined;
        this.height = undefined;
    }

    //create 3d scene meshes and physics bodies
    generate(scene, physics){
        let material, geometry, mesh;

        material = new THREE.LineBasicMaterial( { color: this.line_color } );

        var ground_width = this.ground.width;
        var ground_height = this.ground.height;

        //goalpost width = ground width/12 (ideal ratio)
        this.width = ground_width/12;

        //goalpost height = ground height/given goalpost ratio
        this.height = ground_height*this.ratio;

        var group = new THREE.Group();


        //MESHES

        //left goalpost
        geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3( -1*ground_width/2, this.height/2, 0) );
        geometry.vertices.push(new THREE.Vector3( -1*(this.width+ground_width/2), this.height/2, 0) );
        geometry.vertices.push(new THREE.Vector3( -1*(this.width+ground_width/2), -this.height/2, 0) );
        geometry.vertices.push(new THREE.Vector3( -1*ground_width/2, -this.height/2, 0) );
        group.add(new THREE.Line( geometry, material ));

        //right goalpost
        geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3( ground_width/2, this.height/2, 0) );
        geometry.vertices.push(new THREE.Vector3( (this.width+ground_width/2), this.height/2, 0) );
        geometry.vertices.push(new THREE.Vector3( (this.width+ground_width/2), -this.height/2, 0) );
        geometry.vertices.push(new THREE.Vector3( ground_width/2, -this.height/2, 0) );
        group.add(new THREE.Line(geometry, material));

        //ground of left goalpost
        geometry = new THREE.PlaneBufferGeometry(this.width, this.height);
        material = new THREE.MeshBasicMaterial( { color: this.ground_color} );
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = -(ground_width/2+this.width/2);
        group.add(mesh);

        //ground of right goalpost
        geometry = new THREE.PlaneBufferGeometry(this.width, this.height);
        material = new THREE.MeshBasicMaterial( { color: this.ground_color} );
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = ground_width/2+this.width/2;
        group.add(mesh);

        scene.add(group);   //add to scene


        //PHYSICS BODIES

        let line, line_shape;

        //right upper line of ground
        line_shape = new p2.Line({material: new p2.Material()});
        line = new p2.Body({
            position: [ground_width/2, this.height],
            angle: Math.PI/2
        });
        line_shape.length = this.height;
        line.name = "wall";
        line.addShape(line_shape);
        physics.addBody(line);

        //right lower line of ground
        line_shape = new p2.Line({material: new p2.Material()});
        line = new p2.Body({
            position: [ground_width/2, -this.height],
            angle: Math.PI/2
        });
        line_shape.length = this.height;
        line.name = "wall";
        line.addShape(line_shape);
        physics.addBody(line);

        //left upper line of ground
        line_shape = new p2.Line({material: new p2.Material()});
        line = new p2.Body({
            position: [-ground_width/2, this.height],
            angle: Math.PI/2
        });
        line_shape.length = this.height;
        line.name = "wall";
        line.addShape(line_shape);
        physics.addBody(line);

        //left lower line of ground
        line_shape = new p2.Line({material: new p2.Material()});
        line = new p2.Body({
            position: [-ground_width/2, -this.height],
            angle: Math.PI/2
        });
        line_shape.length = this.height;
        line.name = "wall";
        line.addShape(line_shape);
        physics.addBody(line);

        //upper line of left goalpost
        line_shape = new p2.Line({material: new p2.Material()});
        line = new p2.Body({
            position: [-(ground_width/2+this.width/2), this.height/2]
        });
        line_shape.length = this.width;
        line.name = "goalpost";
        line.addShape(line_shape);
        physics.addBody(line);

        //side line of left goalpost
        line_shape = new p2.Line({material: new p2.Material()});
        line = new p2.Body({
            position: [-(ground_width/2+this.width), 0],
            angle: Math.PI/2
        });
        line_shape.length = this.height;
        line.name = "goalpost";
        line.addShape(line_shape);
        physics.addBody(line);

        //bottom line of left goalpost
        line_shape = new p2.Line({material: new p2.Material()});
        line = new p2.Body({
            position: [-(ground_width/2+this.width/2), -this.height/2]
        });
        line_shape.length = this.width;
        line.name = "goalpost";
        line.addShape(line_shape);
        physics.addBody(line);

        //upper line of right goalpost
        line_shape = new p2.Line({material: new p2.Material()});
        line = new p2.Body({
            position: [ground_width/2+this.width/2, this.height/2]
        });
        line_shape.length = this.width;
        line.name = "goalpost";
        line.addShape(line_shape);
        physics.addBody(line);

        //side line of right goalpost
        line_shape = new p2.Line({material: new p2.Material()});
        line = new p2.Body({
            position: [ground_width/2+this.width, 0],
            angle: Math.PI/2
        });
        line_shape.length = this.height;
        line.name = "goalpost";
        line.addShape(line_shape);
        physics.addBody(line);

        //bottom line of right goalpost
        line_shape = new p2.Line({material: new p2.Material()});
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
/*  PLAYER CLASS
*       -creates 3d scene meshes and physics bodies for players
*/
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

    //generate 3d scene meshed and physics bodies
    generate(scene, physics){
        let material, geometry;

        var group = new THREE.Group();
        var rad = this.radius;
        var num = this.number;


        //MESHES

        //central circle with color
        material = new THREE.MeshBasicMaterial( { color: this.color } );
        geometry = new THREE.CircleBufferGeometry( this.radius, 64 );
        group.add(new THREE.Mesh( geometry, material ));

        //border hoop of central circle
        material = new THREE.LineBasicMaterial( { color: 0x000000 } );
        geometry = new THREE.CircleGeometry( this.radius, 64);
        geometry.vertices.shift();
        group.add(new THREE.LineLoop( geometry, material ));

        //print to scene player numbers in player
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

        //set player position as given parameters. Z position is 0.00001 because the lines on the ground can be see on players
            //without a little heigth
        group.position.set(this.x, this.y, 0.00001);
        group.userData = this.radius;   //add player radius to user data
        scene.add(group);   //add to scene


        //PHYSICS BODIES

        //player circle
        let player_shape = new p2.Circle({
            radius: this.radius,
            material: new p2.Material()
        });
        let player = new p2.Body({
            position: [0, 0],
            mass: this.mass,    //giving some mess makes this body kinematic
            damping: this.damping,  //damping is movement flexibility
            angularDamping: 1
        });
        player.addShape(player_shape);
        player.data = group;
        player.name = "player";
        player.id = 21; //player id's start from 21
        player.position[0] = this.x;
        player.position[1] = this.y;
        physics.addBody(player);
    }
}}

{Tepique.Ball = class {
/*  BALL CLASS
*       -creates 3D meshes and physics body of ball
*/
    constructor(radius, color, mass, damping){
        this.radius = radius;
        this.color = color;
        this.mass = mass;
        this.damping = damping;
    }

    //create mesh and physics body
    generate(scene, physics){

        let material, geometry;
        var group = new THREE.Group();


        //MESHES

        //central circle with color
        material = new THREE.MeshBasicMaterial( { color: this.color } );
        geometry = new THREE.CircleBufferGeometry( this.radius, 64 );
        group.add(new THREE.Mesh( geometry, material ));

        //border hoop of central circle
        material = new THREE.LineBasicMaterial( { color: 0x000000 } );
        geometry = new THREE.CircleGeometry( this.radius, 64);
        geometry.vertices.shift();
        group.add(new THREE.LineLoop( geometry, material ));

        group.position.z = 0.00001; //give Z to 0.00001 for avoid ground white lines-ball collision
        group.userData = this.radius;   //add radius to user data
        scene.add(group);   //add to scene


        //PHYSICS BODIES

        //ball circle
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
        ball.id = 99;   //id of ball is 99
        physics.addBody(ball);
    }
}}

{Tepique.Game = class {
/*  GAME CLASS
*       -this is main class of all game
*       -all rules, events and player control mechanisim controlled by this class
*/
    constructor(environment, ground, goalpost, players, ball, control_method, duration, score_limit){
        this.environment = environment;
        this.ground = ground;
        this.goalpost = goalpost;
        this.player = players;
        this.ball = ball;
        this.control_method = control_method;
        this.duration = duration;
        this.score_limit = score_limit;
        this.action = true; //while it is true, game must go on
        this.score = [0,0]; //holds score table
        this.isGoal = [false, false];   //using for goal detection
        this.goal_clock = new THREE.Clock(false);   //goal clock
        this.game_clock = new THREE.Clock(true);    //match clock
        this.remaining_time = duration; //match duration
        //create game and everything else
        this.init = function(){
            environment.create();   //create environment
            ground.generate(environment.scene, environment.physics);    //generate ground
            goalpost.generate(environment.scene, environment.physics);  //goalposts
            players.generate(environment.scene, environment.physics);   //players
            ball.generate(environment.scene, environment.physics);  //ball
            environment.setWalls(environment.physics);  //set field borders
            control_method.generate();  //generate the control method
        }();
    }

    //game loop
    play(){
        if(this.action){
            this.environment.physics.step(1/60);    //run physics engine
            this.playerControl();   //run player control method
            this.gameAnimation();   //play game animations
            this.kickBall();    //kick ball physics
            this.goal();    //goal detection
        }
        this.remainingTime();   //count the clock
    }

    //calculates player-ball collision
    //if they touch each other, return 0
    //if they are so close each other(which means player can kick the ball), return 1
    //if they not close each other, return -1
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

    //calculate distance between of two objects
    distance(object1, object2){
        var dx = object1.position[0] - object2.position[0];
        var dy = object1.position[1] - object2.position[1];
        return Math.sqrt(dx*dx + dy*dy);
    }

    //calculate inverted radian between of two objects (this using in kick ball algorithm)
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

    //kick the ball mechanism
    kickBall(){
        let ball = this.environment.physics.getBodyById(99);    //get ball
        let player = this.environment.physics.getBodyById(21);  //get player
        let col = this.isCollision(ball, player);
        //if ball is in kick area and player hit the space or X key, kick
        if(col == 1 || col == 0){
            if(this.control_method instanceof Tepique.KeyboardControl && this.control_method.kick){
                let radian = this.radian(player, ball); //calculate the angle which is shows us the way where ball will go
                //summing X and Y velocities with kick speed of player multiplying by cos(radian) and sin(radian),
                //gives ball a new movement
                ball.velocity[0] = ball.velocity[0] + this.player.kickSpeed * Math.cos(radian);
                ball.velocity[1] = ball.velocity[1] + this.player.kickSpeed * Math.sin(radian);
            }
        }
    }

    //check for goal
    goal(){
        let physics = this.environment.physics;
        var ballx = physics.getBodyById(99).position[0];    //get ball

        //if X position of ball exceed the right borders and goal state is 0ttt, it means goal
        if(ballx >= this.ground.width/2 && !this.isGoal[0]){
            this.score[0]++;    //inscrease the score
            this.isGoal[0] = true;  //set isGoal flag true
            this.goal_clock.start();    //start countdown from 3
        }else if(ballx <= -this.ground.width/2 && !this.isGoal[1]){ //if ball exceeds left borders
            this.score[1]++;
            this.isGoal[1] = true;
            this.goal_clock.start();
        }

        if(this.isGoal[0] || this.isGoal[1]){
            //if goal countdown finishes, resfresh all objects to initial position
            if(this.goal_clock.getElapsedTime() >= 3){
                //if scores reaches to limits, finish the game
                if(this.score[0] == this.score_limit || this.score[1] == this.score_limit){
                    this.action = false;
                }
                this.refresh();
                this.isGoal = [false, false];
                this.goal_clock.stop();
            }
        }
    }

    //changes 3d scene object positions related to physics engine positions(this means animation)
    gameAnimation(){
        let ball = this.environment.physics.getBodyById(99);
        let player = this.environment.physics.getBodyById(21);

        ball.data.position.x = ball.position[0];
        ball.data.position.y = ball.position[1];
        player.data.position.x = player.position[0];
        player.data.position.y = player.position[1];
    }

    //change player positions due to controller
    playerControl(){
        let physics = this.environment.physics;
        if(this.control_method instanceof Tepique.KeyboardControl){ //keyboard control mechanism
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

    //refresh every object in physics engine
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

    //calculate remaining time
    remainingTime(){
        if(this.action == true){
            this.remaining_time = this.duration-Math.floor(this.game_clock.getElapsedTime());
        }else if(this.remaining_time < 0 || this.action == false){  //if action flag is false, give -1 to remaining time constructor
            this.remaining_time = -1;
            this.action = false;
        }
    }
}}

{Tepique.GUI = class {
/*  GUI CLASS
*       -creates score board, game clock, and goal clock
*       -updates every loop these elements
*/
    constructor(game, color){
        this.game = game;
        this.color = color;
        this.score_board = undefined;
        this.goal_clock = undefined;
    }

    //place GUI elements in HTML renderer
    place(){
        this.scoreBoard();
        this.goalClock();
        this.gameClock();
    }

    //update elements
    update(){
        this.updateScoreBoard();
        this.updateGoalClock();
        this.updateGameClock();
    }

    //create score board
    scoreBoard(){
        this.score_board = document.createElement("div");
        this.score_board.className = "ScoreBoard";
        this.score_board.style.color = "white";
        this.score_board.style.fontSize = "xx-large";
        var score_board_label = new THREE.CSS2DObject(this.score_board);
        score_board_label.position.set(0, this.game.ground.height/2+1, 0);
        this.game.ground.mesh.add(score_board_label);
    }

    //update score board
    updateScoreBoard(){
        this.score_board.textContent = this.game.score[0].toString() + "\t-\t" + this.game.score[1].toString();
    }

    //create goal clock
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

    //update goal clock
    updateGoalClock(){
        var elapsed_time = this.game.goal_clock.getElapsedTime();
        var countdown = 3-Math.floor(elapsed_time);
        this.goal_clock.textContent = (elapsed_time == 0 || countdown <= 0) ? "" : countdown.toString();
    }

    //create game clock
    gameClock(){
        this.game_clock = document.createElement("div");
        this.game_clock.className = "gameClock";
        this.game_clock.style.color = "white";
        this.game_clock.style.fontSize = "xx-large";
        var game_clock_label = new THREE.CSS2DObject(this.game_clock);
        game_clock_label.position.set(0, -(this.game.ground.height/2+1), 0);
        this.game.ground.mesh.add(game_clock_label);
    }

    //update game clock
    updateGameClock(){
        var time = this.game.remaining_time;
        //converting miliseconds to standard formant of clock, ex: 15:47
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
/*  PHYSICSD DEBUG CLASS
*       -provides see what happens in physics engine
*/
    constructor(physics){
        this.physics = physics;
        this.width = undefined;
        this.height = undefined;
        this.ctx = undefined;
    }

    //create a canvas element to draw inside all bodies
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

    //animate all of bodies
    update(){
        this.ctx.clearRect(0,0,this.width,this.height); //clear all canvas at head of every frame

        this.ctx.save();
        this.ctx.translate(this.width/2, this.height/2);    //convert drawing position center according to physics engine
        this.ctx.scale(15, -15);    //Z-axis position of drawing distance

        for (var i = 0; i < this.physics.bodies.length; i++) {
            let body = this.physics.bodies[i];
            if(body.name == "player" || body.name == "ball"){   //ball or player, draw circle and fill it
                this.ctx.strokeStyle = '#000000';
                this.drawCircle(body);
            }else if(body.name == "wall"){  //draw borders
                this.ctx.strokeStyle = '#FFFFFF';
                this.drawLine(body);
            }else if(body.name == "goalpost"){  //draw goalposts
                this.ctx.strokeStyle = '#D90000';
                this.drawLine(body);
            }
        }
        this.ctx.restore();
    }

    //draw line
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

    //draw circle
    drawCircle(body){
        this.ctx.beginPath();
        this.ctx.save();
        this.ctx.translate(body.position[0], body.position[1]);
        let radius = body.data.userData; //get radiues from user data
        this.ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        if(body.name == "player"){  //if player - paint yellow, else - paint blue
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
/*  KEYBOARD CONTROL CLASS
*       -control which key pressed on keyboard and conver it to movement
*/
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

    //place keyboard listener
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

    //convert key flags to movements
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