function create_shader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        shader_name = "vertex"
        if(type == gl.FRAGMENT_SHADER)
            shader_name = "fragment"
        console.log(shader_name + " shader create success!")
        return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function create_program(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        console.log("create program success!")
        return program;
    }
    
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function create_texture(image){
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    const level = 0;
    const internalFormat = gl.RGBA;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    gl.texImage2D(
        gl.TEXTURE_2D,
        level,
        internalFormat,
        srcFormat,
        srcType,
        image,
    );
    gl.generateMipmap(gl.TEXTURE_2D);
    return texture;
}

vertex_shader_code = `
    attribute vec3 a_position;
    attribute vec3 a_normal;

    uniform vec3 color;
    uniform mat4 model;
    uniform mat4 proj_view;
    varying vec3 frag_color;
    varying vec3 normal;
    varying vec4 world_pos;

    void main() {

        gl_Position = proj_view * model * vec4(a_position, 1.0);
        normal = normalize((model * vec4(a_normal, 0.0)).xyz); // world normal
        frag_color = color;
        world_pos = model * vec4(a_position, 1.0);
    }`

fragment_shader_code = `
    precision mediump float;
    varying vec3 frag_color;
    varying vec3 normal;
    varying vec4 world_pos;
    uniform vec3 camera_pos;

    // use a simple hard-coded directional light
    // const vec3 lightDirection = normalize(vec3(0.0, -1.0, -1.0)); 
    // const vec3 lightColor = vec3(1.0, 1.0, 1.0); 
    const vec3 ambientLight = vec3(.5, 0.5, 0.5); 

    uniform vec3 light_pos;
    uniform vec3 light_color;
    uniform float intensity;

    void main() {
        vec3 lightDirection = normalize(world_pos.xyz - light_pos);
        float diff = max(dot(normal, -lightDirection), 0.0);
        vec3 diffuse = diff * light_color * frag_color * intensity;
        vec3 ambient = ambientLight * frag_color;

        vec3 viewDirection = normalize(camera_pos - world_pos.xyz);
        vec3 reflectDirection = reflect(lightDirection, normal);
        float spec = pow(max(dot(viewDirection, reflectDirection), 0.0), 100.0);
        vec3 specular = spec * light_color * intensity;

        vec3 finalColor = ambient + diffuse + specular;
        // finalColor = normal;
        gl_FragColor = vec4(finalColor, 1.0);
    }`



vertex_shader_code_wire = `
    attribute vec3 a_position;

    uniform vec3 color;
    uniform mat4 model;
    uniform mat4 proj_view;
    varying vec3 frag_color;

    void main() {
        gl_Position = proj_view * model * vec4(a_position, 1.0);
        frag_color = color;
    }`

fragment_shader_code_wire = `
    precision mediump float;
    varying vec3 frag_color;

    void main() {
        gl_FragColor = vec4(frag_color, 1.0);
    }`

vertex_shader_code_models = `
    attribute vec3 a_position;
    attribute vec3 a_normal;
    attribute vec2 a_texcoord;

    uniform mat4 model;
    uniform mat4 proj_view;
    varying vec3 normal;
    varying vec4 world_pos;
    varying vec2 texc;

    void main() {
        gl_Position = proj_view * model * vec4(a_position, 1.0);
        normal = normalize((model * vec4(a_normal, 0.0)).xyz); // world normal
        world_pos = model * vec4(a_position, 1.0);
        texc = a_texcoord;
    }`

fragment_shader_code_models = `
    precision mediump float;
    varying vec3 normal;
    varying vec4 world_pos;
    uniform vec3 camera_pos;
    varying vec2 texc;

    uniform sampler2D tex1;

    uniform vec3 kakdks;
   
    const vec3 ambientLight = vec3(.5, 0.5, 0.5);

    uniform vec3 light_pos;
    uniform vec3 light_color;
    uniform float intensity;

    void main() {
        vec3 lightDirection = normalize(world_pos.xyz - light_pos);
        vec4 base_color = texture2D(tex1, texc); 
        float alpha = base_color.w;
        if (alpha == 0.0) {
            discard; 
        }
        // base_color = vec4(1, 1, 1, 1);
        float diff = max(dot(normal, -lightDirection), 0.0);
        vec3 diffuse = diff * light_color * base_color.xyz * intensity;
        vec3 ambient = ambientLight * base_color.xyz;

        vec3 viewDirection = normalize(camera_pos - world_pos.xyz);
        vec3 reflectDirection = reflect(lightDirection, normal);
        float spec = pow(max(dot(viewDirection, reflectDirection), 0.0), 100.0);
        vec3 specular = spec * light_color * intensity;

        vec3 finalColor = kakdks.x * ambient + kakdks.y * diffuse + kakdks.z * specular;

        gl_FragColor = vec4(finalColor, 1.0);
    }`

vertex_shader_code_water = `
    #define DRAG_MULT 0.38
    #define ITERATIONS_NORMAL 36

    attribute vec3 a_position;

    uniform vec3 color;
    uniform mat4 proj_view;
    varying vec3 frag_color;
    varying vec3 normal;
    varying vec4 world_pos;

    uniform float iTime;

    vec2 wavedx(vec2 position, vec2 direction, float frequency, float timeshift) {
        float x = dot(direction, position) * frequency + timeshift;
        float wave = exp(sin(x) - 1.0);
        float dx = wave * cos(x);
        return vec2(wave, -dx);
    }

    // Calculates waves by summing octaves of various waves with various parameters
    float getwaves(vec2 position, int iterations) {
        float wavePhaseShift = 0.1;// length(position) * 0.1; // this is to avoid every octave having exactly the same phase everywhere
        float iter = 0.0; // this will help generating well distributed wave directions
        float frequency = 1.0; // frequency of the wave, this will change every iteration
        float timeMultiplier = 2.0; // time multiplier for the wave, this will change every iteration
        float weight = 1.0;// weight in final sum for the wave, this will change every iteration
        float sumOfValues = 0.0; // will store final sum of values
        float sumOfWeights = 0.0; // will store final sum of weights
        for(int i=0; i < 100; i++) {
            // generate some wave direction that looks kind of random
            vec2 p = vec2(sin(iter), cos(iter));
            
            // calculate wave data
            vec2 res = wavedx(position, p, frequency, iTime * timeMultiplier + wavePhaseShift);

            // shift position around according to wave drag and derivative of the wave
            position += p * res.y * weight * DRAG_MULT;

            // add the results to sums
            sumOfValues += res.x * weight;
            sumOfWeights += weight;

            // modify next octave ;
            weight = mix(weight, 0.0, 0.2);
            frequency *= 1.18;
            timeMultiplier *= 1.07;

            // add some kind of random value to make next wave look random too
            iter += 1.2;
            
            if(i == iterations) break; 
        }
        // calculate and return
        return sumOfValues / sumOfWeights - 1.0;
    }

    vec3 get_normal(vec2 pos, float e) {
        vec2 ex = vec2(e, 0);
        float H = getwaves(pos.xy, ITERATIONS_NORMAL);
        vec3 a = vec3(pos.x, H, pos.y);
        return normalize(
            cross(
            a - vec3(pos.x - e, getwaves(pos.xy - ex.xy, ITERATIONS_NORMAL), pos.y), 
            a - vec3(pos.x, getwaves(pos.xy + ex.yx, ITERATIONS_NORMAL), pos.y + e)
            )
        );
    }

    void main() {
        vec2 pos = vec2(a_position.x, a_position.z);
        world_pos = vec4(pos.x, getwaves(pos, 12), pos.y, 1.0);
        gl_Position = proj_view * world_pos;
        frag_color = color;
        normal = get_normal(a_position.xz, 0.01);
    }`

fragment_shader_code_water = `
    precision mediump float;
    varying vec3 frag_color;
    varying vec3 normal;
    varying vec4 world_pos;
    uniform vec3 camera_pos;

    // use a simple hard-coded directional light
    // const vec3 lightDirection = normalize(vec3(0.0, -1.0, -1.0)); 
    // const vec3 lightColor = vec3(1.0, 1.0, 1.0); 
    const vec3 ambientLight = vec3(.5, 0.5, 0.5); 

    uniform vec3 light_pos;
    uniform vec3 light_color;
    uniform float intensity;

    uniform samplerCube uSkybox;

    void main() {
        vec3 lightDirection = normalize(world_pos.xyz - light_pos);
        float diff = max(dot(normal, -lightDirection), 0.0);
        vec3 diffuse = diff * light_color * frag_color * intensity;
        vec3 ambient = ambientLight * frag_color;

        vec3 viewDirection = normalize(camera_pos - world_pos.xyz);
        vec3 reflectDirection = reflect(lightDirection, normal);
        float spec = pow(max(dot(viewDirection, reflectDirection), 0.0), 100.0);
        vec3 specular = spec * light_color * intensity;

        vec3 reflectionViewDir = reflect(-viewDirection, normal);
        vec3 finalColor = ambient + diffuse + specular;
        finalColor *= textureCube(uSkybox, reflectionViewDir).xyz * 2.0;

        gl_FragColor = vec4(finalColor, 1.0);
    }`

vertex_shader_code_skybox = `
    attribute vec3 a_position;

    uniform mat4 proj;
    uniform mat4 view;

    varying vec3 vTexCoord;

    void main() {
        // Transform the vertex position to clip space
        mat4 viewMatrix = mat4(mat3(view));
        vec4 pos =  proj * viewMatrix * vec4(a_position, 1.0);
        gl_Position = pos; // Keep the z-depth constant to prevent clipping
        vTexCoord = a_position;  // Pass position as texture coordinate
    }
`

fragment_shader_code_skybox = `
    precision mediump float;

    uniform samplerCube uSkybox;

    varying vec3 vTexCoord;

    void main() {
        // Sample the cubemap texture
        // gl_FragColor = vec4(0, 1, 1, 1.0);
        gl_FragColor = textureCube(uSkybox, vTexCoord);
    }
`

