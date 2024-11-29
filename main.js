canvas = document.querySelector("#c");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
gl = canvas.getContext("webgl");
if (!gl) {
    alert("WebGL is not supported.")
}

const vertices = new Float32Array([
    -1.0,  1.0, -1.0,
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
    -1.0,  1.0, -1.0,

    -1.0, -1.0,  1.0,
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
    -1.0, -1.0,  1.0,

     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,

    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,

    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0,

    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0
]);
  

vertex_shader = create_shader(gl, gl.VERTEX_SHADER, vertex_shader_code);
fragment_shader = create_shader(gl, gl.FRAGMENT_SHADER, fragment_shader_code);

vertex_shader_wire = create_shader(gl, gl.VERTEX_SHADER, vertex_shader_code_wire);
fragment_shader_wire = create_shader(gl, gl.FRAGMENT_SHADER, fragment_shader_code_wire);

vertex_shader_models = create_shader(gl, gl.VERTEX_SHADER, vertex_shader_code_models);
fragment_shader_models = create_shader(gl, gl.FRAGMENT_SHADER, fragment_shader_code_models);

vertex_shader_water = create_shader(gl, gl.VERTEX_SHADER, vertex_shader_code_water);
fragment_shader_water = create_shader(gl, gl.FRAGMENT_SHADER, fragment_shader_code_water);

vertex_shader_skybox = create_shader(gl, gl.VERTEX_SHADER, vertex_shader_code_skybox);
fragment_shader_skybox = create_shader(gl, gl.FRAGMENT_SHADER, fragment_shader_code_skybox);

program = create_program(gl, vertex_shader, fragment_shader);
program_wire = create_program(gl, vertex_shader_wire, fragment_shader_wire);
program_models = create_program(gl, vertex_shader_models, fragment_shader_models);
program_water = create_program(gl, vertex_shader_water, fragment_shader_water);
program_skybox = create_program(gl, vertex_shader_skybox, fragment_shader_skybox);

position_loc = gl.getAttribLocation(program, "a_position")
normal_loc = gl.getAttribLocation(program, "a_normal")
color_loc = gl.getUniformLocation(program, 'color');
model_loc = gl.getUniformLocation(program, 'model');
proj_view_loc = gl.getUniformLocation(program, 'proj_view');
campos_loc = gl.getUniformLocation(program, 'camera_pos');
light_pos = gl.getUniformLocation(program, 'light_pos');
light_color = gl.getUniformLocation(program, 'light_color');
light_intensity = gl.getUniformLocation(program, 'intensity');

position_loc_wire = gl.getAttribLocation(program_wire, "a_position")
color_loc_wire = gl.getUniformLocation(program_wire, 'color');
model_loc_wire = gl.getUniformLocation(program_wire, 'model');
proj_view_loc_wire = gl.getUniformLocation(program_wire, 'proj_view');

position_loc_models = gl.getAttribLocation(program_models, "a_position")
normal_loc_models = gl.getAttribLocation(program_models, "a_normal")
texcoord_loc_models = gl.getAttribLocation(program_models, "a_texcoord")
model_loc_models = gl.getUniformLocation(program_models, 'model');
proj_view_loc_models = gl.getUniformLocation(program_models, 'proj_view');
sampler_loc = gl.getUniformLocation(program_models, 'tex1');
campos_loc_models = gl.getUniformLocation(program_models, 'camera_pos');
light_pos_models = gl.getUniformLocation(program_models, 'light_pos');
light_color_models = gl.getUniformLocation(program_models, 'light_color');
light_intensity_models = gl.getUniformLocation(program_models, 'intensity');
kakdks_loc = gl.getUniformLocation(program_models, 'kakdks');

position_loc_water = gl.getAttribLocation(program_water, "a_position");
color_loc_water = gl.getUniformLocation(program_water, 'color');
proj_view_loc_water = gl.getUniformLocation(program_water, 'proj_view');
campos_loc_water = gl.getUniformLocation(program_water, 'camera_pos');
light_pos_water = gl.getUniformLocation(program_water, 'light_pos');
light_color_water = gl.getUniformLocation(program_water, 'light_color');
light_intensity_water = gl.getUniformLocation(program_water, 'intensity');
time_loc = gl.getUniformLocation(program_water, 'iTime');

position_loc_skybox = gl.getAttribLocation(program_skybox, "a_position")
proj_loc_skybox = gl.getUniformLocation(program_skybox, 'proj');
view_loc_skybox = gl.getUniformLocation(program_skybox, 'view');
skybox_tex = gl.getUniformLocation(program_skybox, 'uSkybox');

skybox_tex_water = gl.getUniformLocation(program_water, 'uSkybox');

const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const cubemap = gl.createTexture();
gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemap);

const water_texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, water_texture);

gl.texImage2D(gl.TEXTURE_2D, 0,  gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
const image = new Image();
image.src = "";
image.addEventListener('load', function() {
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemap);
  gl.texImage2D(target, level, internalFormat, format, type, image);
  gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
});

const faces = [
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, src: './penguins/indigo_rt.jpg' },
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, src: './penguins/indigo_lf.jpg' },
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, src: './penguins/indigo_up.jpg' },
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, src: './penguins/indigo_dn.jpg' },
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, src: './penguins/indigo_bk.jpg' },
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, src: './penguins/indigo_ft.jpg' },
];

faces.forEach((faceInfo) => {
    const {target, src} = faceInfo;   
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 512;
    const height = 512;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;
   
    gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);
    const image = new Image();
    image.src = src;
    image.addEventListener('load', function() {
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemap);
      gl.texImage2D(target, level, internalFormat, format, type, image);
      gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    });
});

gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

(async () => {
    let light = {
        position: [0, 3, 5],
        color: [1, 1, 1],
        intensity: 1
    }
    let light_object = new Shape(generateSphere(1, 100, 100), color=[10, 10, 10]);
    const model_data = await loadGLTF("third-party-mesh/", 'test.gltf');
    image_dict = {}
    let object = []
    model_data.forEach(mesh => {
        let position_vbo = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, position_vbo);
        gl.bufferData(gl.ARRAY_BUFFER, mesh.positions, gl.STATIC_DRAW);

        let normal_vbo = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, normal_vbo);
        gl.bufferData(gl.ARRAY_BUFFER, mesh.normals, gl.STATIC_DRAW);

        let tex_vbo = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, tex_vbo);
        gl.bufferData(gl.ARRAY_BUFFER, mesh.texcoords, gl.STATIC_DRAW);

        object.push([mesh.texture, position_vbo, normal_vbo, tex_vbo, mesh.positions.length / 3])
        image_dict[mesh.texture] = 1
    });

    let keys = Object.keys(image_dict)
    const images = await loadImage("third-party-mesh/", keys)

    for(let i = 0; i < keys.length; i ++){
        image_dict[keys[i]] = create_texture(images[i])
    }


    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);

    render_hierarchy = false;
    hierarchy_colors = [
        [1, 0, 0],    
        [0, 1, 0],   
        [0, 0, 1],    
        [1, 1, 0],    
        [0, 1, 1],    
        [1, 0, 1],    
        [1, 0.65, 0], 
        [0.5, 0, 0.5], 
        [0, 0, 0],   
        [1, 1, 1]
    ];

    function create_vbos(scene){
        scene.create_vbos(gl);
        for (let i = 0; i < scene.get_children_count(); i++) {
            create_vbos(scene.get_child(i));
        }
    }

    function draw_water(scene, proj_view, time){
        gl.bindBuffer(gl.ARRAY_BUFFER, scene.vbo_v)
        gl.vertexAttribPointer(
            position_loc,
            3,                // Number of components per vertex (3 for vec3)
            gl.FLOAT,         // Data type
            false,            // Normalize
            0,                // Stride
            0                 // Offset
        );

        gl.useProgram(program_water); 
        gl.enableVertexAttribArray(position_loc_water);
        gl.uniform3fv(color_loc_water, new Float32Array(scene.color));
        gl.uniformMatrix4fv(proj_view_loc_water, false, new Float32Array(proj_view));
        gl.uniform3fv(campos_loc_water, cam.position)
        gl.uniform3fv(light_color_water, new Float32Array(light.color));
        gl.uniform3fv(light_pos_water, new Float32Array(light.position));
        gl.uniform1f(light_intensity_water, light.intensity);
        gl.uniform1f(time_loc, time * 0.001);
        gl.uniform1i(skybox_tex_water, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemap);
        gl.drawArrays(gl.TRIANGLES, 0, scene.get_vertex_count());
    }

    function draw_skybox(proj, view){
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.vertexAttribPointer(
            position_loc_skybox,
            3,                // Number of components per vertex (3 for vec3)
            gl.FLOAT,         // Data type
            false,            // Normalize
            0,                // Stride
            0                 // Offset
        );
        gl.useProgram(program_skybox);
        gl.enableVertexAttribArray(position_loc_skybox);
        gl.uniform1i(skybox_tex, 0);
        gl.uniformMatrix4fv(proj_loc_skybox, false, new Float32Array(proj));
        gl.uniformMatrix4fv(view_loc_skybox, false, new Float32Array(view));

        gl.depthMask(false);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemap);
      
        gl.drawArrays(gl.TRIANGLES, 0, 36);
        gl.depthMask(true);
    }

    function draw_mesh(object, model, proj_view, ka = 1.0, kd = 1.0, ks=1.0){
        object.forEach(mesh => {
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh[1])
            gl.vertexAttribPointer(
                position_loc_models,
                3,                // Number of components per vertex (3 for vec3)
                gl.FLOAT,         // Data type
                false,            // Normalize
                0,                // Stride
                0                 // Offset
            );
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh[2])
            gl.vertexAttribPointer(
                normal_loc_models,
                3,                // Number of components per vertex (3 for vec3)
                gl.FLOAT,         // Data type
                false,            // Normalize
                0,                // Stride
                0                 // Offset
            );
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh[3])
            gl.vertexAttribPointer(
                texcoord_loc_models,
                2,                // Number of components per vertex (3 for vec3)
                gl.FLOAT,         // Data type
                false,            // Normalize
                0,                // Stride
                0                 // Offset
            );
            gl.enableVertexAttribArray(position_loc_models);
            gl.enableVertexAttribArray(normal_loc_models);
            gl.enableVertexAttribArray(texcoord_loc_models);

            gl.useProgram(program_models); 
            gl.uniformMatrix4fv(model_loc_models, false, new Float32Array(transpose4x4(model)));
            gl.uniformMatrix4fv(proj_view_loc_models, false, new Float32Array(proj_view));
            gl.uniform3fv(campos_loc_models, cam.position)
            gl.uniform3fv(light_color_models, new Float32Array(light.color));
            gl.uniform3fv(light_pos_models, new Float32Array(light.position));
            gl.uniform1f(light_intensity_models, light.intensity);
            gl.uniform3fv(kakdks_loc, new Float32Array([ka, kd, ks]))
            gl.uniform1i(sampler_loc, 0); 
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, image_dict[mesh[0]]);            
            gl.drawArrays(gl.TRIANGLES, 0, mesh[4]);
        });

    }

    function draw_scene(scene, model, proj_view, depth){
        gl.bindBuffer(gl.ARRAY_BUFFER, scene.vbo_v)
        gl.vertexAttribPointer(
            position_loc,
            3,                // Number of components per vertex (3 for vec3)
            gl.FLOAT,         // Data type
            false,            // Normalize
            0,                // Stride
            0                 // Offset
        );
        gl.bindBuffer(gl.ARRAY_BUFFER, scene.vbo_n)
        gl.vertexAttribPointer(
            normal_loc,
            3,                // Number of components per vertex (3 for vec3)
            gl.FLOAT,         // Data type
            false,            // Normalize
            0,                // Stride
            0                 // Offset
        );
        
        gl.useProgram(program); 
        gl.enableVertexAttribArray(position_loc);
        gl.enableVertexAttribArray(normal_loc);
        gl.uniform3fv(color_loc, new Float32Array(scene.color));
        gl.uniformMatrix4fv(model_loc, false, new Float32Array(transpose4x4(multiply4x4Matrices(model, scene.model_matrix))));
        gl.uniformMatrix4fv(proj_view_loc, false, new Float32Array(proj_view));
        gl.uniform3fv(campos_loc, cam.position)
        gl.uniform3fv(light_color, new Float32Array(light.color));
        gl.uniform3fv(light_pos, new Float32Array(light.position));
        gl.uniform1f(light_intensity, light.intensity);
        gl.drawArrays(gl.TRIANGLES, 0, scene.get_vertex_count());

        if(render_hierarchy){
            gl.useProgram(program_wire)
            gl.enableVertexAttribArray(position_loc_wire);
            gl.bindBuffer(gl.ARRAY_BUFFER, scene.vbo_b)
            gl.vertexAttribPointer(
                position_loc_wire,
                3,                // Number of components per vertex (3 for vec3)
                gl.FLOAT,         // Data type
                false,            // Normalize
                0,                // Stride
                0                 // Offset
            );
            gl.uniform3fv(color_loc_wire, new Float32Array(hierarchy_colors[depth]));
            gl.uniformMatrix4fv(model_loc_wire, false, new Float32Array(transpose4x4(multiply4x4Matrices(model, scene.model_matrix))));
            gl.uniformMatrix4fv(proj_view_loc_wire, false, new Float32Array(proj_view));
            gl.drawArrays(gl.LINES, 0, 24);
        }
        for (let i = 0; i < scene.get_children_count(); i++) {
            draw_scene(scene.get_child(i), multiply4x4Matrices(model, scene.model_matrix), proj_view, depth + 1);
        }
    }

    scene = create_windmill();
    scene.translate(0, -1, 0);
    water = new Shape(generatePlane(100, 100, 1000), color=[0.0, 0.41, 0.58]);

    create_vbos(scene, gl);
    create_vbos(light_object, gl)
    create_vbos(water, gl);

    // 6, 10, 10
    let cam = new Camera([10.181984233286734, 7.063035287938819, 11.212260327568579], [0, 0, 1], [0, 1, 0], 45, canvas.width / canvas.height, 0.1, 1000)

    function render (time) { 
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        proj = cam.computeProjectionMatrix()
        view = cam.computeViewMatrix()
        proj_view = transpose4x4(multiply4x4Matrices(proj, view))
        scene.translate(0, 0.005 * (Math.sin(time * 0.001)), 0);
        scene.get_child(0).get_child(0).rotate(0, 0.5, 0);
        draw_skybox(transpose4x4(proj), transpose4x4(view));
        draw_mesh(object, multiply4x4Matrices(get_translation_matrix(1.5, -1, -5), get_scale_matrix(0.5)), proj_view)
        draw_scene(scene, get_identity_matrix(), proj_view, 0)
        draw_scene(light_object, get_translation_matrix(light.position[0], light.position[1], light.position[2]), proj_view, 0)
        draw_water(water, proj_view, time);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    window.addEventListener("keydown", (event) => {
        if(["w", "a", "s", "d"].includes(event.key)){
            let [x, y, z] = cam.get_cam_axis()
            let speed = 0.5
            if(event.key == 'w') scene.translate(speed * -z[0], speed * -z[1], speed * -z[2]);
            if(event.key == 's') scene.translate(speed * z[0], speed * z[1], speed * z[2]);
            if(event.key == 'a') scene.translate(speed * -x[0], speed * -x[1], speed * -x[2]);
            if(event.key == 'd') scene.translate(speed * x[0], speed * x[1], speed * x[2]);
        }
    
        if(["R", "Y", "P"].includes(event.key)){
            let speed = 1.0
            if(event.key == 'R') cam.roll += speed;
            if(event.key == 'Y') cam.yaw += speed;
            if(event.key == 'P') cam.pitch += speed;
        }
    
        if(["r", "y", "p"].includes(event.key)){
            let speed = 1.0
            if(event.key == 'r') cam.roll -= speed;
            if(event.key == 'y') cam.yaw -= speed;
            if(event.key == 'p') cam.pitch -= speed;
        }
    
        if (event.key === "ArrowUp" || event.key === "ArrowDown"){
            let sign = -1;
            if(event.key === "ArrowDown") sign = 1
            let speed = 0.5;
            let [x, y, z] = cam.get_cam_axis()
            cam.position[0] += sign * speed * z[0];
            cam.position[1] += sign * speed * z[1];
            cam.position[2] += sign * speed * z[2];
        }
    
        if (event.key === "ArrowLeft" || event.key === "ArrowRight"){
            let sign = 1;
            if(event.key === "ArrowLeft") sign = -1
            let speed = 0.5;
            let [x, y, z] = cam.get_cam_axis()
            cam.position[0] += sign * speed * x[0];
            cam.position[1] += sign * speed * x[1];
            cam.position[2] += sign * speed * x[2];
        }
    
        if (event.key == "h"){
            render_hierarchy ^= 1
        }

        if(["C", "V", "B"].includes(event.key)){
            let speed = 1.0
            if(event.key == 'C') light.position[0] += speed
            if(event.key == 'V') light.position[1] += speed;
            if(event.key == 'B') light.position[2] += speed;
        }
    
        if(["c", "v", "b"].includes(event.key)){
            let speed = 1.0
            if(event.key == 'c') light.position[0] -= speed;
            if(event.key == 'v') light.position[1] -= speed;
            if(event.key == 'b') light.position[2] -= speed;
        }
    });
    
    window.camera = cam;
})();