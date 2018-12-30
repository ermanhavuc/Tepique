class Tepique {}

Tepique.Ground = class {

    constructor(width, height, ground_color, line_color, feature){
        this.width = width;
        this.height = height;
        this.ground_color = ground_color;
        this.line_color = line_color;
        this.feature = feature;
    }
    
    mesh(){

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

        return group;
    }

    getWidth(){return this.width;}
    getHeight(){return this.height;}
    getGroundColor(){return this.ground_color;}
    getLineColor(){return this.line_color;}
    getFeature(){return this.feature;}
}

Tepique.GoalPost = class {
    constructor(ground, ratio, color){
        this.ground = ground;
        this.ratio = ratio;
        this.color = color;
        this.goalpost_width;
    }

    mesh(){

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
        group.add(new THREE.Line(geometry, material));

        geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3( width/2, height/2*this.ratio, 0) );
        geometry.vertices.push(new THREE.Vector3( (this.goalpost_width+width/2), height/2*this.ratio, 0) );
        geometry.vertices.push(new THREE.Vector3( (this.goalpost_width+width/2), -height/2*this.ratio, 0) );
        geometry.vertices.push(new THREE.Vector3( width/2, -height/2*this.ratio, 0) );
        group.add(new THREE.Line(geometry, material));

        return group;
    }

    getRatio(){return this.ratio;}
    getColor(){return this.color;}
    getFacet(){return this.facet;}
    getUpperDot(){return this.ground.getHeight()/2*this.ratio;}
    getLowerDot(){return -this.ground.getHeight()/2*this.ratio;}
    getWidth(){return this.goalpost_width;}
}