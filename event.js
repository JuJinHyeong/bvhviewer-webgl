//(CC-NC-BY) JuJinhyeong 2019
var cx;
var cy;

var drag_start = {x:0, y:0};
var drag_end = {x:0, y:0};
var mouse_changed_x = 0.0;
var mouse_changed_y = 0.0;
var is_clicked;

//Add mouse event in canvas.
function init_event(canvas){
    canvas.addEventListener("mousedown", find_start_position, false);
    canvas.addEventListener("mousemove", find_changed_position, false);
    canvas.addEventListener("mouseup", function(){
		// save pre_y before mouse_changed_y becomes 0
		prev_y += mouse_changed_y;
		mouse_changed_x = 0.0;
		mouse_changed_y = 0.0;
		is_clicked = false;
		// save prev_camera_pos
		prev_camera_pos = glm.vec4(camera_pos[0], camera_pos[1], camera_pos[2], camera_pos[3]);
	}, false);
}

function find_start_position(event){
    drag_start = {
        x : event.pageX,
        y : event.pageY
    };
    is_clicked = true;
}

function find_changed_position(event){
    if(is_clicked){
        drag_end = {
            x: event.pageX,
            y: event.pageY
        };
        mouse_changed_x = drag_end.x - drag_start.x;
        mouse_changed_y = drag_end.y - drag_start.y;
    }
}