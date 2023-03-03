function main() {
    const gl = document.querySelector('canvas').getContext('webgl2');

    if (!gl) {
        alert("Unable to setup WebGL. Your browser or computer may not support it.");
    }

    // User Inputs
    document.addEventListener("keydown", KeyDown, false);
    document.addEventListener("keyup", KeyUp, false);

    const texSrc = [
        'https://threejsfundamentals.org/threejs/resources/images/heightmap-96x64.png',
        "https://i.imgur.com/661Y8GH.png",
        "https://i.imgur.com/i286323.png",
        "https://i.imgur.com/deQVKex.jpg?1",
        "https://i.imgur.com/TwZc2eb.jpg",
        "https://i.imgur.com/lWWv8sU.jpg",
        "https://i.imgur.com/kwkp0G2.jpg",
        "https://i.imgur.com/m3UW8h7.jpg",
        "https://i.imgur.com/DqJQcjF.jpg",
        "https://i.imgur.com/hopMlae.jpg",
        "https://i.imgur.com/5Osmccc.jpg",
        "https://i.imgur.com/xD8Z8vh.jpg",
        "https://i.imgur.com/xD8Z8vh.jpg",
        "https://i.imgur.com/5FjpfCb.jpg",
        "https://i.imgur.com/8dX182l.jpg",
        "https://i.imgur.com/F7kiUPR.jpg",
        "https://i.imgur.com/NnCWVqV.png",
        "https://i.imgur.com/4OqV4zl.png",
        "https://i.imgur.com/TVFbILm.png"
    ]

    let texNumber = Math.floor(Math.random() * texSrc.length);

    let cameraPhi = Math.PI/2;
    let cameraTheta = Math.PI/4;
    let cameraRadius = 75000;
    const playerPos = () => {
        return [
            cameraRadius * Math.sin(cameraTheta) * Math.cos(cameraPhi),
            cameraRadius * Math.cos(cameraTheta),
            cameraRadius * Math.sin(cameraTheta) * Math.sin(cameraPhi)
        ]
    };
    const playerTarget = {x: 0, y: 0, z: 0};

    function KeyDown(event) {
        if (event.key === 'w') {
            cameraRadius -= 1000;
        }
        if (event.key === 's') {
            cameraRadius += 1000;
        }
        if (event.key === 'ArrowRight'){
            cameraPhi -= 0.03;
        }
        if (event.key === 'ArrowLeft'){
            cameraPhi += 0.03;
        }
        if (event.key === 'ArrowUp'){
            cameraTheta = Math.max(cameraTheta - 0.03, 0.03);
        }
        if (event.key === 'ArrowDown'){
            cameraTheta = Math.min(cameraTheta + 0.03, Math.PI/3);
        }
        if (event.key === 'r') {
            location.reload();
        }
    }

    function KeyUp(event) {
        console.log(event);
    }

    console.log(gl.getParameter(gl.MAX_ELEMENT_INDEX));
    console.log(gl.getParameter(gl.MAX_ELEMENTS_VERTICES));
    console.log(gl.getParameter(gl.MAX_ELEMENTS_INDICES));

    const m4 = twgl.m4;
    const vs = `
    #version 300 es
    
    in vec4 position;
    in vec2 texcoord;
 
    uniform sampler2D displacementMap;
    uniform mat4 projection;
    uniform mat4 view;
    uniform mat4 model;
 
    out vec3 v_worldPosition;
 
    void main() {
      float displacementScale = 7500.0;
      float displacement = texture(displacementMap, texcoord).r * displacementScale;
      vec4 displacedPosition = position + vec4(0, displacement, 0, 0);
      gl_Position = projection * view * model * displacedPosition;
      v_worldPosition = (model * displacedPosition).xyz;
      v_worldPosition.y = v_worldPosition.y - 380.0;
    }  
  `;

    const fs = `
  #version 300 es

  precision highp float;

  in vec3 v_worldPosition;
  
  out vec4 fragColor;

  void main() {
    vec3 dx = dFdx(v_worldPosition);
    vec3 dy = dFdy(v_worldPosition);
    vec3 normal = normalize(cross(dy, dx));
    
    // just hard code lightDir and color
    // to make it easy
    vec3 lightDir = normalize(vec3(1, -2, 3));
    float light = dot(lightDir, normal);
    vec3 color;
    if (v_worldPosition.y >= 6000.0){
        color = vec3(1.0, 1.0, 1.0);
    }
    else if (v_worldPosition.y >= 5000.0){
        color = vec3(1.0, 1.0, 1.0);
    }
    else if (v_worldPosition.y >= 4000.0){
        color = vec3(0.5, 0.5, 0.5);
    }
    else if (v_worldPosition.y >= 3000.0){
        color = vec3(0.5, 0.4, 0.2);
    }
    else if (v_worldPosition.y >= 2000.0){
        color = vec3(0.85, 0.7, 0.0);
    }
    else if (v_worldPosition.y >= 1000.0){
        color = vec3(0.0, 1.0, 0.0);
    }
    else if (v_worldPosition.y >= 0.0){
        color = vec3(0.0, 0.6, 0.0);
    }
    else {
        color = vec3(0.0, 0.6, 0.0);
    }
    fragColor = vec4(color * (light * 0.5 + 0.5), 1);
  }
  `;

    // compile shader, link, look up locations
    const programInfo = twgl.createProgramInfo(gl, [vs, fs]);

    // make some vertex data
    // calls gl.createBuffer, gl.bindBuffer, gl.bufferData for each array
    const bufferInfo = twgl.primitives.createPlaneBufferInfo(
        gl,
        75000,  // width
        75000,  // height
        250,  // quads across
        250,  // quads down
    );

    const tex = twgl.createTexture(gl, {
        src: texSrc[texNumber],
        minMag: gl.NEAREST,
        wrap: gl.CLAMP_TO_EDGE,
    });

    function render(time) {
        time *= 0.0005;  // seconds

        twgl.resizeCanvasToDisplaySize(gl.canvas);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        const fov = 60 * Math.PI / 180;
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const near = 1;
        const far = 150000;
        const projection = m4.perspective(fov, aspect, near, far);

        const eye = playerPos();
        const target = [playerTarget.x, playerTarget.y, playerTarget.z];
        const up = [0, 1, 0];
        const camera = m4.lookAt(eye, target, up);
        const view = m4.inverse(camera);
        const model = m4.identity();

        gl.useProgram(programInfo.program);

        // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
        twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

        // calls gl.activeTexture, gl.bindTexture, gl.uniformXXX
        twgl.setUniformsAndBindTextures(programInfo, {
            projection,
            view,
            model,
            displacementMap: tex,
        });

        // calls gl.drawArrays or gl.drawElements
        twgl.drawBufferInfo(gl, bufferInfo);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}
main();