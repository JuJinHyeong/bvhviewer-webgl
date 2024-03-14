//(CC-NC-BY) JuJinhyeong 2019
function node(name, parent){
	this.name = name,
	this.parent = parent,
	this.offset = [],
	this.channel = [],
	this.children = [],
	this.matrix = glm.mat4(1.0)
}

function bvh(){
	this.root = null,
	this.cur = null;
	this.motion = [],
	this.frame = [],
	this.vertices = [],
	this.indices = [],
	this.fps = 0.0
}

//create bvh instance with id
function create_bvh(id){
	var human_body = new bvh();

	// get source_code in html by id
	var bvh_source = document.getElementById(id).innerHTML;

	//split bvh source code

	//split two region hierarchy / motion
	bvh_source = bvh_source.split('MOTION');
	var hierarchy_source = bvh_source[0].split('\n');
	var motion_source = bvh_source[1].split('\n');

	//trimming
	for(var i=0; i<hierarchy_source.length; i++){
		hierarchy_source[i] = hierarchy_source[i].trim();
	}
	for(var i=0; i<motion_source.length; i++){
		motion_source[i] = motion_source[i].trim();
	}

	// set bvh hierarchy
	set_hierarchy(human_body, hierarchy_source);

	// set bvh motion
	set_motion(human_body, motion_source);
	
	// get vertices per frame from motion
	set_vertices_frame(human_body);

	return human_body;
}

function print_bvh(bvh){
	print_hierarchy(bvh.root);
}

function print_hierarchy(node){
	console.log(node.name);
	for(var i=0; i<node.channel.length; i++){
		console.log(node.channel[i]);
	}
	for(var i=0; i<node.children.length; i++){
		print_node(node.children[i]);
	}
}

//build hierarchy of bvh
function set_hierarchy(bvh, hierarchy_source){
	// iterating hierarchy_source code
	for(var i=0; i<hierarchy_source.length; i++){
		var word = hierarchy_source[i].split(' ');
		if(word[0] == 'ROOT'){
			bvh.root = new node(word[1], null);
			bvh.cur = bvh.root;
		}
		else if(word[0] == 'JOINT'){
			bvh.cur.children[bvh.cur.children.length] = new node(word[1], bvh.cur);
			bvh.cur = bvh.cur.children[bvh.cur.children.length - 1];
		}
		else if(word[0] == 'End'){
			bvh.cur.children[bvh.cur.children.length] = new node(word[1], bvh.cur);
			bvh.cur = bvh.cur.children[bvh.cur.children.length - 1];
		}
		else if(word[0] == 'CHANNELS'){
			// get Channels
			for(var j=2; j<word.length; j++){
				bvh.cur.channel[j-2] = [];
				bvh.cur.channel[j-2][0] = word[j];
			}
		}
		else if(word[0] == 'OFFSET'){
			// get offsets
			bvh.cur.offset[0] = parseFloat(word[1]);
			bvh.cur.offset[1] = parseFloat(word[2]);
			bvh.cur.offset[2] = parseFloat(word[3]);
		}
		else if(word[0] == '}'){
			bvh.cur = bvh.cur.parent;
		}
	}
}

// get motion from  motion_source
function set_motion(bvh, motion_source){
	for(var i=0; i<motion_source.length; i++){
		if(i == 1){
			// get frame
			var word = motion_source[i].split('\t');
			bvh.frame = parseInt(word[1]);
		}
		else if(i == 2){
			// get fps
			var word = motion_source[i].split('\t');
			bvh.fps = parseInt(word[1]);
		}
		else{
			// get motions
			var word = motion_source[i].split(' ');
			bvh.motion[i-3] = [];
			for(var j=0; j<word.length; j++){
				bvh.motion[i-3][j] = parseFloat(word[j]);
			}
		}
	}
}

var vertices_index = 0;
var indices_index = 0;
var motion_index = 0;

// get vertices per frame
function set_vertices_frame(bvh){
	for(var i=0; i<bvh.frame; i++){
		vertices_index = 0;
		indices_index = 0;
		motion_index = 0;
		set_matrix(bvh, bvh.root, i);
		bvh.vertices[i] = [];
		set_vertices(bvh, bvh.root, 0, i);
	}
}

// get vertices with frame
function set_vertices(bvh, node, parent_index, frame){
	// vertex is matrix[3]
	var vertex = node.matrix[3];
	bvh.vertices[frame][vertices_index++] = vertex[0];
	bvh.vertices[frame][vertices_index++] = vertex[1];
	bvh.vertices[frame][vertices_index++] = vertex[2];
	bvh.vertices[frame][vertices_index++] = vertex[3];

	// get cur index
	var index = bvh.vertices[frame].length / 4 - 1;

	// add indices except root
	if(node.parent != null){
		bvh.indices[indices_index++] = parent_index;
		bvh.indices[indices_index++] = index;
	}

	//recursion
	for(var i=0; i<node.children.length; i++){
		set_vertices(bvh, node.children[i], index, frame);
	}
}

// set matrix in hierarchy
function set_matrix(bvh, node, frame){
	// set channels of node
	for(var i=0; i<node.channel.length; i++){
		node.channel[i][1] = bvh.motion[frame][motion_index++];
	}

	// initialise node matrix
	node.matrix = glm.mat4(1.0);
	
	// calculate offset
	node.matrix = glm.translate(node.matrix, glm.vec3(node.offset[0], node.offset[1], node.offset[2]));

	// iterate channels
	for(var i=0; i<node.channel.length; i++){
		if(node.channel[i][0] == 'Xposition'){
			node.matrix = glm.translate(node.matrix, glm.vec3(node.channel[i][1], 0.0, 0.0));
		}
		else if(node.channel[i][0] == 'Yposition'){
			node.matrix = glm.translate(node.matrix, glm.vec3(0.0, node.channel[i][1], 0.0));
		}
		else if(node.channel[i][0] == 'Zposition'){
			node.matrix = glm.translate(node.matrix, glm.vec3(0.0, 0.0, node.channel[i][1]));
		}
		else if(node.channel[i][0] == 'Xrotation'){
			node.matrix = glm.rotate(node.matrix, glm.radians(node.channel[i][1]), glm.vec3(1, 0, 0));
		}
		else if(node.channel[i][0] == 'Yrotation'){
			node.matrix = glm.rotate(node.matrix, glm.radians(node.channel[i][1]), glm.vec3(0, 1, 0));
		}
		else if(node.channel[i][0] == 'Zrotation'){
			node.matrix = glm.rotate(node.matrix, glm.radians(node.channel[i][1]), glm.vec3(0, 0, 1));
		}
	}

	// multiply matrix with parent matrix execp parent is null
	if(node.parent != null){
		node.matrix = node.parent.matrix['*'](node.matrix);
	}

	// recursion
	for(var i=0; i<node.children.length; i++){
		set_matrix(bvh, node.children[i], frame);
	}
}