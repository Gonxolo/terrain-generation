const heightMap = (xzMin, xzMax, xDivs, zDivs, y) => {

    const pos = [];
    const cols = [];
    const norms = [];
    const ind = [];

    let idx = 0;

    if (xzMin.type !== 'vec2' || xzMax.type !== 'vec2'){
        throw "heightMap: either xzMin or xzMax is not a vec2";
    }

    const dim = subtract(xzMax, xzMin);
    const dx = dim[0] / (xDivs);
    const dz = dim[1] / (zDivs);

    for (let x = xzMin[0]; x < xzMax[0]; x+=dx){
        for (let z = xzMin[1]; x < xzMax[1]; z+=dz){
            //Triangle 1
            //  x,z
            //   |\
            //   |  \
            //   |    \
            //   |      \
            //   |        \
            //   |__________\
            // x,z+dz      x+dx,z+dz
            pos.push(vec4(   x,       y(x, z),    z, 1.0));
            pos.push(vec4(   x,    y(x, z+dz), z+dz, 1.0));
            pos.push(vec4(x+dx, y(x+dx, z+dz), z+dz, 1.0));
            cols.push(vec4(0.5, 0.1, 0.5, 1.0));
            cols.push(vec4(0.5, 0.1, 0.5, 1.0));
            cols.push(vec4(0.5, 0.1, 0.5, 1.0));
            const nAux0 = vec3.create();
            vec3.cross(
                nAux0,
                vec3.subtract(
                    vec3(x+dx, y(x+dx, z+dz), z+dz),
                    vec3(x, y(x, z), z)
                ),
                vec3.subtract(
                    vec3(x, y(x, z+dz), z+dz),
                    vec3(x, y(x, z), z)
                )
            );
            const nAux1 = vec3.create();
            vec3.cross(
                nAux1,
                vec3.subtract(
                    vec3(x, y(x, z), z),
                    vec3(x, y(x, z+dz), z+dz)
                ),
                vec3.subtract(
                    vec3(x+dx, y(x+dx, z+dz), z+dz),
                    vec3(x, y(x, z+dz), z+dz)
                )
            );
            const nAux2 = vec3.create();
            vec3.cross(
                nAux2,
                vec3.subtract(
                    vec3(x, y(x, z+dz), z+dz),
                    vec3(x+dx, y(x+dx, z+dz), z+dz)
                ),
                vec3.subtract(
                    vec3(x, y(x, z), z),
                    vec3(x+dx, y(x+dx, z+dz), z+dz)
                )
            );
            norms.push(nAux0, nAux1, nAux2);
            ind.push(idx, idx+1, idx+2);

            //Triangle 2
            //  x,z         x+dx,z
            //    \----------|
            //      \        |
            //        \      |
            //          \    |
            //            \  |
            //              \|
            //           x+dx,z+dz
            pos.push(vec4(x+dx,    y(x+dx, z),    z, 1.0));
            cols.push(vec4(0.5, 0.1, 0.5, 1.0));
            const nAux3 = vec3.create();
            vec3.cross(
                nAux3,
                vec3.subtract(
                    vec3(x+dx, y(x+dx, z+dz), z+dz),
                    vec3(x+dx, y(x+dx, z), z)
                ),
                vec3.subtract(
                    vec3(x, y(x, z), z),
                    vec3(x+dx, y(x+dx, z), z)
                )
            );
            norms.push(nAux3);
            ind.push(idx, idx+2, idx+3);
            idx += 4;
        }
    }

    return {
        positions: pos,
        colors: cols,
        vertexNormals: norms,
        indices: ind,
    }
};