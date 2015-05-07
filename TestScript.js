/* Clase para realizar pruebas de operaciones
 * Autor: Harold N. Montenegro H.
 */

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
    var puntoE = new Point3D(10, 5, 1);
    var puntoF = new Point3D(9, 5, 1);
    var puntoG = new Point3D(8, 7, 6);

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
    var object1 = new Object(8, 12, 12);
    var puntoAA = new Point3D(0, 0, 0);
    var puntoBB = new Point3D(0, 1, 0);
    var puntoCC = new Point3D(1, 0, 0);
    var puntoDD = new Point3D(1, 1, 0);
    var puntoEE = new Point3D(0, 0, 1);
    var puntoFF = new Point3D(0, 1, 1);
    var puntoGG = new Point3D(1, 0, 1);
    var puntoHH = new Point3D(1, 1, 1);

    var puntoJJ = new Point3D(2, 4, 5);
    var puntoKK = new Point3D(7, 3, 7);
    var puntoLL = new Point3D(9, 7, 6);
    var puntoMM = new Point3D(7, 5, 3);
    var puntoNN = new Point3D(7, 4, 4);
    var puntoOO = new Point3D(7, 4, 6);
    var puntoPP = new Point3D(8, 8, 3);
    var puntoQQ = new Point3D(5, 3, 2);


    var puntoII = new Point3D(2, 5, 9);

    object1.V[0] = puntoAA;
    object1.V[1] = puntoBB;
    object1.V[2] = puntoCC;
    object1.V[3] = puntoDD;
    object1.V[4] = puntoEE;
    object1.V[5] = puntoFF;
    object1.V[6] = puntoGG;
    object1.V[7] = puntoHH;


    object1.F[0][0] = 3;
    object1.F[0][1] = 0;
    object1.F[0][2] = 1;
    object1.F[0][3] = 3;

    object1.F[1][0] = 3;
    object1.F[1][1] = 0;
    object1.F[1][2] = 3;
    object1.F[1][3] = 2;

    object1.F[2][0] = 3;
    object1.F[2][1] = 4;
    object1.F[2][2] = 5;
    object1.F[2][3] = 0;

    object1.F[3][0] = 3;
    object1.F[3][1] = 4;
    object1.F[3][2] = 1;
    object1.F[3][3] = 0;

    object1.F[4][0] = 3;
    object1.F[4][1] = 1;
    object1.F[4][2] = 5;
    object1.F[4][3] = 7;

    object1.F[5][0] = 3;
    object1.F[5][1] = 1;
    object1.F[5][2] = 7;
    object1.F[5][3] = 3;

    object1.F[6][0] = 3;
    object1.F[6][1] = 2;
    object1.F[6][2] = 7;
    object1.F[6][3] = 6;

    object1.F[7][0] = 3;
    object1.F[7][1] = 2;
    object1.F[7][2] = 3;
    object1.F[7][3] = 7;

    object1.F[8][0] = 3;
    object1.F[8][1] = 0;
    object1.F[8][2] = 6;
    object1.F[8][3] = 4;

    object1.F[9][0] = 3;
    object1.F[9][1] = 0;
    object1.F[9][2] = 2;
    object1.F[9][3] = 6;

    object1.F[10][0] = 3;
    object1.F[10][1] = 4;
    object1.F[10][2] = 7;
    object1.F[10][3] = 5;

    object1.F[11][0] = 3;
    object1.F[11][1] = 4;
    object1.F[11][2] = 6;
    object1.F[11][3] = 7;


    var object2 = new Object(8, 12, 12);

    object2.V[0] = puntoJJ;
    object2.V[1] = puntoKK;
    object2.V[2] = puntoLL;
    object2.V[3] = puntoMM;
    object2.V[4] = puntoNN;
    object2.V[5] = puntoOO;
    object2.V[6] = puntoPP;
    object2.V[7] = puntoQQ;


    object2.F[0][0] = 3;
    object2.F[0][1] = 0;
    object2.F[0][2] = 3;
    object2.F[0][3] = 3;

    object2.F[1][0] = 3;
    object2.F[1][1] = 0;
    object2.F[1][2] = 2;
    object2.F[1][3] = 2;

    object2.F[2][0] = 3;
    object2.F[2][1] = 4;
    object2.F[2][2] = 1;
    object2.F[2][3] = 0;

    object2.F[3][0] = 3;
    object2.F[3][1] = 4;
    object2.F[3][2] = 1;
    object2.F[3][3] = 0;

    object2.F[4][0] = 3;
    object2.F[4][1] = 1;
    object2.F[4][2] = 5;
    object2.F[4][3] = 7;

    object2.F[5][0] = 3;
    object2.F[5][1] = 3;
    object2.F[5][2] = 7;
    object2.F[5][3] = 2;

    object2.F[6][0] = 3;
    object2.F[6][1] = 2;
    object2.F[6][2] = 1;
    object2.F[6][3] = 6;

    object2.F[7][0] = 3;
    object2.F[7][1] = 2;
    object2.F[7][2] = 3;
    object2.F[7][3] = 7;

    object2.F[8][0] = 3;
    object2.F[8][1] = 0;
    object2.F[8][2] = 2;
    object2.F[8][3] = 4;

    object2.F[9][0] = 3;
    object2.F[9][1] = 6;
    object2.F[9][2] = 2;
    object2.F[9][3] = 6;

    object2.F[10][0] = 3;
    object2.F[10][1] = 4;
    object2.F[10][2] = 7;
    object2.F[10][3] = 5;

    object2.F[11][0] = 3;
    object2.F[11][1] = 4;
    object2.F[11][2] = 2;
    object2.F[11][3] = 7;




    console.log(object1);

    console.log("/**Copiando object1 a object2 **/");
    var object3 = new ObjectCopy(object1);
    console.log(object3);


    console.log("/**Verificando si dos numeros tienen el mismo signo**/");
    if (object1.mismoSigno(1, -2)) {
        console.log("SI tienen el mismo signo");
    } else {
        console.log("NO tienen el mismo signo");
    }


    console.log("/**Probando calcularVectoreNormales( **/");
    object1.calcularVectoresNormales();
    console.log(object1.N[0]);
    console.log(object1.N[1]);
    console.log(object1.N[2]);
    console.log(object1.N[3]);
    console.log(object1.N[4]);
    console.log(object1.N[5]);
    console.log(object1.N[6]);
    console.log(object1.N[7]);
    console.log(object1.N[8]);
    console.log(object1.N[9]);
    console.log(object1.N[10]);
    console.log(object1.N[11]);



    console.log("/**Probando el calculo de las coordenadas baricentricas**/");

    object1.coordenadasBaricentricas(puntoA, puntoB, puntoC, puntoD);

    console.log(u + " " + v + " " + w);

    console.log("/**Verificando si el puntoA esta en el triangulo**/");
    if (object1.puntoEnTriangulo(puntoA, puntoC, puntoB, puntoA)) {
        console.log("El punto P SI esta en el triangulo");
    } else {
        console.log("El punto P NO esta en el triangulo");
    }

    console.log("/**Verificando si los triangulos colisionan**/");
    if (object1.trianguloEnTriangulo(puntoA, puntoB, puntoC, puntoE, puntoF, puntoG)) {
        console.log("SI colisionan");
    } else {
        console.log("NO colisionan");
    }

    console.log("Probando lectura de un objecto desde archivo");
    //var objectFile = new ObjectFile(this.file, false);

    console.log("Esta el vertice en el objecto?");
    var posicion = object1.estaVertice(puntoII);
    console.log(posicion);

    console.log("Insertando una nueva cara");
    var cara = new Array();
    cara[0] = puntoAA;
    cara[1] = puntoGG;
    cara[2] = puntoCC;

    object1.nuevaCara(cara);
    console.log(object1.F[12]);

    console.log("Probando rotacion");
    //    object1.rotar(45, 'Z');
    //    console.log(object1.V[1]);
    console.log("Probando translacion");
    //    object1.transladar(45,45,45);
    //    console.log(object1.V[1]);
    console.log("Probando escalado");
    object1.transladar(45, 45, 45);
    //    console.log(object1.V[1]);
    console.log("Probando colision entre dos objectos");
    console.log(object2);
    if (object1.colision(object2)) {
        console.log("SI colisionan");
    } else {
        console.log("NO colisionan");
    }

    console.log("PRUEBAS DEL EVM");
    var evm1 = new EVM("XYZ", 3);
    console.log(evm1);

    console.log("EVM POR ARCHIVO");



}

/**Iniciar WebGL apuntando al canvas del HTML**/
function webGLStart() {
    //    var canvas = document.getElementById("leccion1-canvas");
    pruebas();
    //    initGL(canvas);
    //    initShaders();
    //    initBuffers();
    //
    //    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    //    gl.enable(gl.DEPTH_TEST);
    //
    //    drawScene();
}

/******************************************************************************/

var evm1 = null;
var evm2 = null;
var evm3 = null;
var min, max, tx, ty, tz;
var arrayBig = new Array();
var arrayTime = new Array();

function ejecutar(){
    /*Inicializando variables*/
    arrayTime.length = 0;
    min = 0;
    max = 0;
    var repeticion = 1;   //Cantidad de repeticiones de procesar()

    /*Guardando opcion de area critica*/
    var areaCritica = document.getElementsByName("areaCritica")[0].checked;

    for(var i=0 ;i<repeticion;i++){
        procesar(areaCritica);
    }

    setTimeout(function(){
        console.log(arrayTime);
        var resultadoTotal = 0;
        for(var i=0; i<arrayTime.length ; i++){
            resultadoTotal = resultadoTotal + arrayTime[i];
        }
        resultadoTotal = resultadoTotal/repeticion;
        console.log("Total: " + resultadoTotal);
    }, 5000);
}

function procesar(areaCritica) {
    new EVMFile(document.getElementById("fileEVM").files, function (evmResult) {
        evm1 = evmResult;

        new EVMFile(document.getElementById("fileEVM2").files, function (evmResult) {
            evm2 = evmResult;
            var evmTotal = new EVM(0, 0);
            //                        console.log("EVM 1");
            //                        console.log(JSON.stringify(evm1));
            //                        console.log("EVM 2");
            //                        console.log(JSON.stringify(evm2));

            /*Asignar Min y Max*/
            min = evm1.minPoint();
            max = evm1.maxPoint();          

            /*Mover EVM1 si areaCritica es true o false*/
            //            if(areaCritica){
            //                do{
            //                    tx = Math.floor((Math.random() * (max.X+1)));
            //                    ty = Math.floor((Math.random() * (max.Y+1)));
            //                    tz = Math.floor((Math.random() * (max.Z+1)));
            //                    evm3 = evm2;
            //                    evm3.translate(tx,ty,tz);
            //                    console.log("EVM 3");
            //                    console.log(evm3);
            //                    console.log(evm1.collide(evm3));
            //                }while(!evm1.collide(evm3));
            //            }else{
            //                tx = max.X + 10;
            //                ty = max.Y + 10;
            //                tz = max.Z + 10;
            //                evm3 = evm2;
            //                evm3.translate(tx,ty,tz);
            //            }

            var mark_start = performance.now();
            if (document.getElementsByName("operation")[0].checked) {
                evmTotal = evm1.intersection(evm2);
            } else if (document.getElementsByName("operation")[1].checked) {
                //                console.log("Result Difference");
                evmTotal = evm1.difference(evm2);
            } else if (document.getElementsByName("operation")[2].checked) {
                //                console.log("Result Union");
                evmTotal = evm1.unite(evm2);
            } else if (document.getElementsByName("operation")[3].checked) {
                //                console.log("Result Collision");
                evmTotal = evm1.collide(evm2);
            }
            console.log(JSON.stringify(evmTotal));
            var mark_end = performance.now();
            arrayTime.push((mark_end-mark_start) * 1000)
        });
    });
}

function ejecutarBig(){
    /*Inicializando variables*/
    arrayTime.length = 0;
    min = 0;
    max = 0;
    var repeticiones = 1000;               //Cantidad de repeticiones de procesarBig()
    var min = 12;                    // Numero inicial de EVs <= 12
    var max = 6000;                    //Numero final de EVs <= 6000

    var evm1, evm2, a=0 , b=0 , evmEncontrado=false;

    /*Guardando opcion de area critica*/
    var areaCritica = document.getElementsByName("areaCritica")[0].checked;


    new EVMFileBig(document.getElementById("bigFile").files, function (arrayBig) {
        //        console.log(arrayBig);
        for(var i=0 ;i<repeticiones;i++){
            a=-1, b=-1;
            while((a+b) != max){
                a = randomIntFromInterval(min,max);
                b = randomIntFromInterval(min,max);
            }
            evmEncontrado = false;
            var j=0;
            while(!evmEncontrado && j< arrayBig.length){
                if(a == arrayBig[j].NEV){
                    evmEncontrado = true;
                    evm1 = arrayBig[j];
                }else{
                    j++;
                }
            }

            evmEncontrado = false;
            j = 0;
            while(!evmEncontrado && j< arrayBig.length){
                if(b == arrayBig[j].NEV){
                    evmEncontrado = true;
                    evm2 = arrayBig[j];
                }else{
                    j++;
                }
            }
            //            console.log("a " + a + " b " + b);



            //            evm1 = arrayBig[a];
            //            evm2 = arrayBig[b];
            //
            procesarBig(areaCritica, evm1, evm2);
        }
    });

    setTimeout(function(){
        //        console.log(arrayTime);
        var resultadoTotal = 0;
        for(var i=0; i<arrayTime.length ; i++){
            resultadoTotal = resultadoTotal + arrayTime[i];
        }
        resultadoTotal = resultadoTotal/repeticiones;
        console.log("Total: " + resultadoTotal);
    }, 60000);
}

function randomIntFromInterval(min,max){
    var numRan = -1;
    while(numRan % 2 != 0){
        numRan = Math.floor(Math.random()*(max-min+1)+min);
    }
    return numRan;
}

function procesarBig(areaCritica, evm1, evm2) {
//    console.log("evm1");
//    console.log(evm1);
//    console.log("evm2");
//    console.log(evm2);
//    console.log();
    //
    //            /*Asignar Min y Max*/
    //            min = evm1.minPoint();
    //            max = evm1.maxPoint();          
    //
    //            /*Mover EVM1 si areaCritica es true o false*/
    //            //            if(areaCritica){
    //            //                do{
    //            //                    tx = Math.floor((Math.random() * (max.X+1)));
    //            //                    ty = Math.floor((Math.random() * (max.Y+1)));
    //            //                    tz = Math.floor((Math.random() * (max.Z+1)));
    //            //                    evm3 = evm2;
    //            //                    evm3.translate(tx,ty,tz);
    //            //                    console.log("EVM 3");
    //            //                    console.log(evm3);
    //            //                    console.log(evm1.collide(evm3));
    //            //                }while(!evm1.collide(evm3));
    //            //            }else{
    //            //                tx = max.X + 10;
    //            //                ty = max.Y + 10;
    //            //                tz = max.Z + 10;
    //            //                evm3 = evm2;
    //            //                evm3.translate(tx,ty,tz);
    //            //            }
    //    
    var evmTotal = new EVM(0, 0);
    if (document.getElementsByName("operation")[0].checked) {
        var mark_start = performance.now();
        evmTotal = evm1.intersection(evm2);
        var mark_end = performance.now();
    } else if (document.getElementsByName("operation")[1].checked) {
        var mark_start = performance.now();
        evmTotal = evm1.difference(evm2);
        var mark_end = performance.now();
    } else if (document.getElementsByName("operation")[2].checked) {
        var mark_start = performance.now();
        evmTotal = evm1.unite(evm2);
        var mark_end = performance.now();
    } else if (document.getElementsByName("operation")[3].checked) {
        var mark_start = performance.now();
        evmTotal = evm1.collide(evm2);
        var mark_end = performance.now();
    }
//    console.log(JSON.stringify(evmTotal));

    arrayTime.push((mark_end-mark_start) * 1000)
    //        });
}

function prueba(){
    var p1= new Point3D(0,0,0);
    var p2= new Point3D(0,0,2);
    var p3= new Point3D(0,1,0);
    
    var arrayVert = new Array();
    arrayVert[0] = p1;
    arrayVert[1] = p2;
    arrayVert[2] = p3;
    
    var obj1 = new EVMWithExVert(arrayVert, 1, 3);
    var obj2 = new EVMCopy2(obj1);
    
    obj1.v[0].Y = 32;
    
    console.log(JSON.stringify(obj1));
    console.log(JSON.stringify(obj2));
    
}