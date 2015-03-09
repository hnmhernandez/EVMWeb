/*
 /* 
 * Libreria para la representacion de objetos volumetricos usando el modelo EVM
 * Autor: Harold N. Montenegro H.
 */

/******************Inicializacion de libreria WebGL****************************/

/**Inicializar WebGL en canvas**/
var gl;
function initGL(canvas) {
    try {
        gl = canvas.getContext("webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("No puede iniciarse webGL en este navegador");
    }
}

function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType === 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type === "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type === "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}


/**Inicializar Shaders que apuntan a los ID del HTML**/
var shaderProgram;
function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("No pueden iniciarse los shaders");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}

/**Actualiza las matrices uniforme de modelo-vista y proyeccion
 *          que estan en la GPU con la que se tiene en Javascript**/
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}


/**Inicializar los buffer a usar con sus respectivos vertices**/
var triangleVertexPositionBuffer;
var squareVertexPositionBuffer;
function initBuffers() {
    triangleVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    var vertices = [
        0.0, 1.0, 0.0,
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    triangleVertexPositionBuffer.itemSize = 3;
    triangleVertexPositionBuffer.numItems = 3;

    squareVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    vertices = [
        1.0, 1.0, 0.0,
        -1.0, 1.0, 0.0,
        1.0, -1.0, 0.0,
        -1.0, -1.0, 0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    squareVertexPositionBuffer.itemSize = 3;
    squareVertexPositionBuffer.numItems = 4;
}

/**Se encarga de realizar el renderizado de la escena 
 *                 en el lienzo**/
function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

    mat4.identity(mvMatrix);

    mat4.translate(mvMatrix, [-1.5, 0.0, -7.0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);


    mat4.translate(mvMatrix, [3.0, 0.0, 0.0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
}

/**FUNCION SOLO DE PRUEBAS**/
function pruebas() {

    var puntoA = new Point3D(4, 3, 5);
    var puntoB = new Point3D(1, 5, 7);
    var puntoC = new Point3D(1, -8, 4);
    var puntoD = new Point3D(3, 5, 2);

    var line = new Line3D(puntoA, puntoB);
    console.log("/**Imprimiendo line(PuntoA, PuntoB)**/");
    console.log(line.P1);
    console.log(line.P2);

    var line2 = new Line3Dcopy(line);
    console.log("/**Prueba de Line3Dcopy**/");
    console.log(line2.P1);
    console.log(line2.P2);


    var vector = new Vector3D(7, 8, 9);
    console.log("/**vector = Prueba de Vector3D 7,8,9**/");
    console.log(vector.P3D);

    var vectorB = new Vector3D(1, 2, 3);
    console.log("/**vectorB = Prueba de Vector3D 1,2,3**/");
    console.log(vectorB.P3D);

    var vectorOrigin = new Vector3Dorigin(puntoA);
    console.log("/**vector2 = Prueba de Vector3Dorigin pasandole puntoA(1,2,3)**/");
    console.log(vectorOrigin.P3D);

    var vectorHead = new Vector3Dhead(puntoA, puntoB);
    console.log("/**Prueba de Vector3Dhead pasandole puntoA y puntoB**/");
    console.log(vectorHead.P3D);

    console.log("/**Prueba de suma de vectores --> vector + vectorB --> (7,8,9) * (1,2,3)**/");
    var vectorSuma = vector.suma(vectorB);
    console.log(vectorSuma.P3D);

    console.log("/**Prueba de producto punto de vectores --> vector * vectorB --> (7,8,9) * (1,2,3)**/");
    console.log(vector.prodPunto(vectorB));

    var normaVector = vector.norma();
    console.log("/**Norma del vector --> sqrt(7*7 + 8*8 + 9*9)**/");
    console.log(normaVector);

    var vectorCruz = vector.prodCruz(vectorB);
    console.log("/**Prueba de producto cruz de vectores --> vector x vectorB --> (7,8,9) x (1,2,3)**/");
    vector.prodCruz(vectorB);
    console.log(vectorCruz.P3D);

    var vectorNormalizado = new Vector3D(7, 8, 9);
    vectorNormalizado.normalizar();
    console.log("/**Prueba normalizar vectores --> vector(7,8,9) **/");
    console.log(vectorNormalizado.P3D);

    console.log("/**Prueba de Line3D **/");
    var line1 = new Line3D(puntoA, puntoB);
    console.log(line1.P1);
    console.log(line1.P2);

    console.log("/**Prueba copia de Line3D **/");
    var line2 = Line3Dcopy(line1);
    console.log(line2.P1);
    console.log(line2.P2);

    if (line1.igual(line2)) {
        console.log("L1 es igual a L2");
    } else {
        console.log("L1 es distinto a L2");
    }

    var line1 = new Line3D(puntoC, puntoD);
    console.log("/**Prueba de interseccion entre lineas **/");
    console.log(line1.puntoInterseccion(line2));


    console.log("/**Prueba sobre planos3D **/");
    var plano1 = new Plane();
    var plano2 = new PlaneWithPoints3D(puntoA, puntoB, puntoC);
    var plano3 = new PlaneCopy(plano2);


    console.log("/**Sacando el vector normal de un plano --> plano2(puntoA, puntoB, puntoC) **/");
    console.log(plano2.normal().P3D);

    console.log("/**Comprobando si el punto esta en el plano **/");
    if (plano2.puntoEnPlano(puntoB)) {
        console.log("puntoB si esta en el plano");
    } else {
        console.log("puntoB no esta en el plano");
    }


    console.log("/**PRUEBAS DE OBJECT **/");
    console.log("/**Creando un nuevo Object **/");
    var object1 = new Object(3, 3, 4);
    object1.F[0][0] = puntoA;
    object1.F[0][1] = puntoB;
    object1.F[0][2] = puntoC;
    object1.F[1][0] = puntoD;
    object1.F[1][1] = puntoA;
    object1.F[1][2] = puntoB;
    object1.F[2][0] = puntoC;
    object1.F[2][1] = puntoD;
    object1.F[2][2] = puntoA;

    console.log(object1.V);

    console.log("/**Copiando object1 a object2 **/");
    var object2 = new ObjectCopy(object1);
    console.log(object2);


    console.log("/**Probando calcularVectoreNormales( **/");
    object1.calcularVectoresNormales();
    console.log("/**Vector normal 0**/");
    console.log(object1.N[0]);
    console.log("/**Vector normal 1**/");
    console.log(object1.N[1]);
    console.log("/**Vector normal 2**/");
    console.log(object1.N[2]);


    console.log("/**Probando el calculo de las coordenadas baricentricas**/");
    var u = 0.0, v = 0.0, w = 0.0;
    object1.coordenadasBaricentricas(puntoA, puntoB, puntoC, puntoD, this.u, this.v, this.w);
    console.log(u + " " + v + " " + w);
}


/**Iniciar WebGL apuntando al canvas del HTML**/
function webGLStart() {
    var canvas = document.getElementById("leccion1-canvas");

    pruebas();

    initGL(canvas);
    initShaders();
    initBuffers();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    drawScene();
}

/******************************************************************************/


