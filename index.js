let cubeRotation = 0.0;

function cross(x, y) {
    return [
      x[1] * y[2] - x[2] * y[1],
      x[2] * y[0] - x[0] * y[2],
      x[0] * y[1] - x[1] * y[0],
    ];
}

function meshMaker(start, end, xStep, zStep) {

    const pos = [];
    const cols = [];
    const norms = [];
    const inds = [];

    let idx = 0;

    const dx = (end.x - start.x) / xStep;
    const dz = (end.z - start.z) / zStep;

    for (let x=start.x; x < end.x; x+=dx){
        for (let z=start.z; z < end.z; z+=dz){
            pos.push(x, 0.0, z);
            pos.push(x, 0.0, z+dz);
            pos.push(x+dx, 0.0, z+dz);
            pos.push(x+dx, 0.0, z);
            cols.push(
                0.0, 0.0, 0.0, 0.0,
                0.0, 0.0, 0.0, 0.0,
                0.0, 0.0, 0.0, 0.0,
                0.0, 0.0, 0.0, 0.0,
            );
            norms.push(
                0.0, 0.0, 1.0,
                0.0, 0.0, 1.0,
                0.0, 0.0, 1.0,
                0.0, 0.0, 1.0,
            );
            inds.push(idx, idx+1, idx+2, idx, idx+2, idx+3);
            idx += 4;
        }
    }

    return {
        positions: pos,
        vertexNormals: norms,
        colors: cols,
        indices: inds,
    };
}

let testMesh = meshMaker({x:-9999, z:-9999}, {x:10000, z:10000}, 100, 100);

const shape = testMesh;

main();

function main() {
    const canvas = document.querySelector("#glCanvas");
    // Initialize the GL context
    const gl = canvas.getContext("webgl");

    // Only continue if WebGL is available and working
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    const vsSource = `
        attribute vec4 aVertexPosition;
        attribute vec4 aVertexColor;
        attribute vec3 aVertexNormal;
        
        uniform mat4 uNormalMatrix;
        uniform mat4 uProjectionMatrix;
        uniform mat4 uViewMatrix;
        uniform mat4 uModelMatrix;
        
        varying lowp vec4 vColor;
        varying highp vec3 vLighting;
        
        void main(void) {
          gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aVertexPosition;
          vColor = aVertexColor;
          
          // Apply lighting effect

          highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
          // highp vec3 ambientLight = vec3(0.0, 0.0, 0.0);
          highp vec3 directionalLightColor = vec3(1, 1, 1);
          // highp vec3 directionalLightColor = vec3(1.0, 0.0, 0.0);
          highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));
    
          highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
    
          highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
          vLighting = ambientLight + (directionalLightColor * directional);
        }
    `;

    const fsSource = `
        varying lowp vec4 vColor;
        varying highp vec3 vLighting;
        
        void main(void) {
          gl_FragColor = vec4(vColor.rgb * vLighting, vColor.a);
        }
    `;

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
            vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            viewMatrix: gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
            modelMatrix: gl.getUniformLocation(shaderProgram, 'uModelMatrix'),
            normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
        },
    };

    const A = 1000;

    for (let p=0; p < shape.positions.length; p+=3){
        shape.positions[p+1] = //60 * shape.positions[p] + 40;
             A * Math.sin(shape.positions[p]) * Math.sin(shape.positions[p]) +
            A * Math.sin(shape.positions[p+2]) * Math.sin(shape.positions[p+2]);
        if (shape.positions[p+1] >= 5000.0) {
            shape.colors[p*(4/3)] = 1.0;
            shape.colors[p*(4/3)+1] = 1.0;
            shape.colors[p*(4/3)+2] = 1.0;
            shape.colors[p*(4/3)+3] = 1.0;
        }
        else if (shape.positions[p+1] >= 4000.0){
            shape.colors[p*(4/3)] = 0.7;
            shape.colors[p*(4/3)+1] = 0.7;
            shape.colors[p*(4/3)+2] = 0.7;
            shape.colors[p*(4/3)+3] = 1.0;
        }
        else if (shape.positions[p+1] >= 3000.0){
            shape.colors[p*(4/3)] = 160/255;
            shape.colors[p*(4/3)+1] = 82/255;
            shape.colors[p*(4/3)+2] = 45/255;
            shape.colors[p*(4/3)+3] = 1.0;
        }
        else if (shape.positions[p+1] >= 2000.0){
            shape.colors[p*(4/3)] = 1.0;
            shape.colors[p*(4/3)+1] = 1.0;
            shape.colors[p*(4/3)+2] = 0.0;
            shape.colors[p*(4/3)+3] = 1.0;
        }
        else if (shape.positions[p+1] >= 1000.0){
            shape.colors[p*(4/3)] = 173/255;
            shape.colors[p*(4/3)+1] = 1.0;
            shape.colors[p*(4/3)+2] = 47/255;
            shape.colors[p*(4/3)+3] = 1.0;
        }
        else if (shape.positions[p+1] >= 0.0){
            shape.colors[p*(4/3)] = 0.0;
            shape.colors[p*(4/3)+1] = 100/255;
            shape.colors[p*(4/3)+2] = 0.0;
            shape.colors[p*(4/3)+3] = 1.0;
        }
        else {
            shape.colors[p*(4/3)] = 1.0;
            shape.colors[p*(4/3)+1] = 0.0;
            shape.colors[p*(4/3)+2] = 1.0;
            shape.colors[p*(4/3)+3] = 1.0;
        }
    }
    for (let i=0; i < shape.positions.length; i+=4){
        // v0
        let v0 = cross(
            [shape.positions[(i+1)*3] - shape.positions[i*3],
                shape.positions[(i+1)*3+1] - shape.positions[i*3+1],
                shape.positions[(i+1)*3+2] - shape.positions[i*3+2]],
            [shape.positions[(i+2)*3] - shape.positions[i*3],
                shape.positions[(i+2)*3+1] - shape.positions[i*3+1],
                shape.positions[(i+2)*3+2] - shape.positions[i*3+2]]
        );
        shape.vertexNormals[i*3] = v0[0];
        shape.vertexNormals[i*3+1] = v0[1];
        shape.vertexNormals[i*3+2] = v0[2];

        // v1
        let v1 = cross(
            [shape.positions[(i+2)*3] - shape.positions[(i+1)*3],
                shape.positions[(i+2)*3+1] - shape.positions[(i+1)*3+1],
                shape.positions[(i+2)*3+2] - shape.positions[(i+1)*3+2]],
            [shape.positions[i*3] - shape.positions[(i+1)*3],
                shape.positions[i*3+1] - shape.positions[(i+1)*3+1],
                shape.positions[i*3+2] - shape.positions[(i+1)*3+2]]

        );
        shape.vertexNormals[(i+1)*3] = v1[0];
        shape.vertexNormals[(i+1)*3+1] = v1[1];
        shape.vertexNormals[(i+1)*3+2] = v1[2];

        // v2
        let v2 = cross(
            [shape.positions[i*3] - shape.positions[(i+2)*3],
                shape.positions[i*3+1] - shape.positions[(i+2)*3+1],
                shape.positions[i*3+2] - shape.positions[(i+2)*3+2]],
            [shape.positions[(i+1)*3] - shape.positions[(i+2)*3],
                shape.positions[(i+1)*3+1] - shape.positions[(i+2)*3+1],
                shape.positions[(i+1)*3+2] - shape.positions[(i+2)*3+2]]
        );
        shape.vertexNormals[(i+2)*3] = v2[0];
        shape.vertexNormals[(i+2)*3+1] = v2[1];
        shape.vertexNormals[(i+2)*3+2] = v2[2];

        // v3
        let v3 = cross(
            [shape.positions[i*3] - shape.positions[(i+3)*3],
                shape.positions[i*3+1] - shape.positions[(i+3)*3+1],
                shape.positions[i*3+2] - shape.positions[(i+3)*3+2]],
            [shape.positions[(i+2)*3] - shape.positions[(i+3)*3],
                shape.positions[(i+2)*3+1] - shape.positions[(i+3)*3+1],
                shape.positions[(i+2)*3+2] - shape.positions[(i+3)*3+2]]
        );
        shape.vertexNormals[(i+3)*3] = v3[0];
        shape.vertexNormals[(i+3)*3+1] = v3[1];
        shape.vertexNormals[(i+3)*3+2] = v3[2];
    }

    const buffers = initBuffers(gl, shape.positions, shape.vertexNormals, shape.colors, shape.indices);

    let then = 0;

    // Draw the scene repeatedly
    function render(now) {
        now *= 0.001;  // convert to seconds
        const deltaTime = now - then;
        then = now;

        drawScene(gl, programInfo, buffers, deltaTime);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

function initBuffers(gl, positions, vertexNormals, colors, indices) {

    // Create a buffer for the square's positions.

    const positionBuffer = gl.createBuffer();

    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Now create an array of positions for the square.



    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.

    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(positions),
        gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);



    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals),
        gl.STATIC_DRAW);

    // Now set up the colors for the faces. We'll use solid colors
    // for each face.



    // Convert the array of colors into a table for all the vertices.

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // This array defines each face as two triangles, using the
    // indices into the vertex array to specify each triangle's
    // position.



    // Now send the element array to GL

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        normal: normalBuffer,
        color: colorBuffer,
        indices: indexBuffer,
    };
}

function drawScene(gl, programInfo, buffers, deltaTime) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const fieldOfView = 90 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 50000.0;
    const projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix,
        fieldOfView,
        aspect,
        zNear,
        zFar);

    const viewMatrix = mat4.create();

    let eye = vec3.fromValues(10000.00001, 20000.0, 10000.00001);
    let at = vec3.fromValues(0.0, 0.0, 0.0);
    let up = vec3.fromValues(0.0, 1.0, 0.0);

    mat4.lookAt(viewMatrix, eye, at, up);

    const modelMatrix = mat4.create();

    mat4.translate(modelMatrix,
        modelMatrix,
        [0, -10, 10]
    );

    mat4.rotate(modelMatrix,
        modelMatrix,
        cubeRotation * 0.7,
        [0, 1, 0]
    );

    // mat4.rotate(modelMatrix,
    //     modelMatrix,
    //     cubeRotation * 0.3,
    //     [1, 0, 0]
    // );

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelMatrix);
    mat4.transpose(normalMatrix, normalMatrix);


    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition);
    }

    // Tell WebGL how to pull out the colors from the color buffer
    // into the vertexColor attribute.
    {
        const numComponents = 4;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset
        );
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
    }

    // Tell WebGL how to pull out the normals from
    // the normal buffer into the vertexNormal attribute.
    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexNormal,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexNormal);
    }

    // Tell WebGL which indices to use to index the vertices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    // Tell WebGL to use our program when drawing
    gl.useProgram(programInfo.program);

    // Set the shader uniforms
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.viewMatrix,
        false,
        viewMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelMatrix,
        false,
        modelMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.normalMatrix,
        false,
        normalMatrix);

    {
        // const vertexCount = 36;
        const vertexCount = shape.indices.length;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }

    cubeRotation += deltaTime;

}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    // Send the source to the shader object

    gl.shaderSource(shader, source);

    // Compile the shader program

    gl.compileShader(shader);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}


