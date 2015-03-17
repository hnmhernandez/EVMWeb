/* Representacion de un objecto 3D basado en poligonos
 * Autor: Harold N. Montenegro H.
 */

//Atributos
var NV, NF, NE;     //Numeros de vertives, caras y bordes
var V = new Array();    //Vector de vertices
var F = new Array();    //Matrix de caras (una cara por fila)
var N = new Array();    //Vector de normales


//Constructores
function Object(vertices, caras, bordes) {
    this.NV = vertices;
    this.NF = caras;
    this.NE = bordes;
    this.V = new Array(vertices);
    this.F = new Array(caras);
    for (var i = 0; i < caras; i++) {
        this.F[i] = new Array(vertices);
    }
    this.N = new Array(caras);
}

function ObjectCopy(obj) {
    var objeto = new Object(obj.NV, obj.NF, obj.NE);
    return objeto;
}

function ObjectFile(filename, esRGB) {
    console.log(filename[0]);
    var lector = new FileReader();
    lector.onload = function (e) {
        var contenido = e.target.result;
        contenido = contenido.split("\n");

        if (contenido[0] === "OFF") {
            var vertices = parseInt(contenido[1].split(" ")[0]);
            var caras = parseInt(contenido[1].split(" ")[1]);
            var bordes = parseInt(contenido[1].split(" ")[2]);

            var object = new Object(vertices, caras, bordes);
            var punto;
            for (var i = 0; i < vertices; i++) {
                punto = new Point3D(parseInt(contenido[i + 2].split(" ")[0]), parseInt(contenido[i + 2].split(" ")[1]), parseInt(contenido[i + 2].split(" ")[2]));
                object.V[i] = punto;
            }

            for (var i = 0; i < caras; i++){
                
            }



        } else {
            alert("Esto no es un archivo .off, todo archivo .off debe comenzar con la línea OFF");
        }
    };
    lector.readAsText(filename[0]);
//    console.log(lector.target);
}

//Metodos
Object.prototype.swap = function () {
    var aux;
    aux = number1;
    number1 = number2;
    number2 = aux;
};

// Verifica si dos números tienen el mismo signo
Object.prototype.mismoSigno = function (number1, number2) {
    if (((number1 < 0) && (number2 < 0)) || ((number1 >= 0) && (number2 >= 0)))
        return(true);
    else
        return(false);
};

Object.prototype.calcularVectoresNormales = function () {
    var indexVector;
    for (var i = 0; i < this.NF; i++) {
        // 3 puntos para calcular 2 vectores para formar un plano
        indexVector = this.F[i][0];
        var puntoA = new Point3Dcopy(this.V[indexVector]);
        indexVector = this.F[i][1];
        var puntoB = new Point3Dcopy(this.V[indexVector]);
        indexVector = this.F[i][2];
        var puntoC = new Point3Dcopy(this.V[indexVector]);
//        console.log(this.F[i][0]);

        var p = new PlaneWithPoints3D(puntoA, puntoB, puntoC);
        this.N[i] = p.unitNormal().P3D;
    }
};

Object.prototype.triArea2D = function (x1, y1, x2, y2, x3, y3) {
    return ((x1 - x2) * (y2 - y3) - (x2 - x3) * (y1 - y2));
};

//Calcular las coordenadas baricentricas(u,v,w) para 
//el punto3D p con respecto al triangulo (a,b,c)
Object.prototype.coordenadasBaricentricas = function (a, b, c, p) {

    //Unnormalizar triangulo normal
    var ba = new Vector3Dhead(a, b);
    var ca = new Vector3Dhead(a, c);
    var m = ba.prodCruz(ca);

    //Componentes absolutos para determinar la proyeccion del plano
    var x = Math.abs(m.P3D.X);
    var y = Math.abs(m.P3D.Y);
    var z = Math.abs(m.P3D.Z);

    //Calcular áreas en plano de mayor proyección
    var nu, nv, ood;
    if (x >= y && x >= z) {
        //x es más grande, proyecto al plano yz
        nu = this.triArea2D(p.Y, p.Z, b.Y, b.Z, c.Y, c.Z);
        nv = this.triArea2D(p.Y, p.Z, c.Y, c.Z, a.Y, a.Z);
        ood = 1.0 / m.P3D.X;
    } else if (y >= x && y >= z) {
        //y es más grande, proyecto al plano xz
        nu = this.triArea2D(p.X, p.Z, b.X, b.Z, c.X, c.Z);
        nv = this.triArea2D(p.X, p.Z, c.X, c.Z, a.X, a.Z);
        ood = 1.0 / -m.P3D.Y;
    } else {
        //z es más grande, proyecto al plano xy
        nu = this.triArea2D(p.X, p.Y, b.X, b.Y, c.X, c.Y);
        nv = this.triArea2D(p.X, p.Y, c.X, c.Y, a.X, a.Y);
        ood = 1.0 / m.P3D.Z;
    }
    u = nu * ood;
    v = nv * ood;
    w = 1.0 - u - v;
};

//Entrada: a,b,c: Vertices del triangulo.
//p: punto.
//Output: true si p esta dentro del triangulo, false de lo contrario.
Object.prototype.puntoEnTriangulo = function (a, b, c, p) {
    var pl = new PlaneWithPoints3D(a, b, c);

    if (pl.puntoEnPlano(p)) {
        this.coordenadasBaricentricas(a, b, c, p);
        return (v >= 0.0 && w >= 0.0 && (v + w) <= 1.0);
    } else {
        return false;
    }
};

//Möller's fast triangle - Detección de colisión de triangulos
Object.prototype.trianguloEnTriangulo = function (A1, B1, C1, A2, B2, C2) {
    var i, vof;
    var v0, v1, v2; //Para buscar intervalos
    var aux, d1, d2;
    var N1, N2; //Normales de T1 y T2
    var vt1 = new Array(3), vt2 = new Array(3);    //Vertices de los triangulos T1 y T2
    var dt1 = new Array(3), dt2 = new Array(3);    //Distancia desde los vertices para el plano de T1 y T2
    var pt1 = new Array(3), pt2 = new Array(3);    //Proyección de los vertices dentro de la linea de intersección
    var D;  //D= N1 x N2 es la dirección de la linea de intersección L
    var it1 = new Array(2), it2 = new Array(2);     //Intervalos de T1 y T2
    var T1 = new PlaneWithPoints3D(A1, B1, C1);     //Triangulos T1 y T2
    var T2 = new PlaneWithPoints3D(A2, B2, C2);

    //Vertices de T1
    vt1[0] = new Vector3Dorigin(A1);
    vt1[1] = new Vector3Dorigin(B1);
    vt1[2] = new Vector3Dorigin(C1);

    //Vertices de T2
    vt2[0] = new Vector3Dorigin(A2);
    vt2[1] = new Vector3Dorigin(B2);
    vt2[2] = new Vector3Dorigin(C2);

    //Normales de T1 y T2
    N1 = T1.normal();
    N2 = T2.normal();

    //Verificar si T1 se encuentra en un lado de P2 (plano de T2)
    //Ecuación del Plano P2: N2.X + d2 = 0 (Donde X es algun punto en el plano)
    d2 = -1 * N2.prodPunto(vt2[0]);
    for (i = 0; i < 3; i++) {
        dt1[i] = N2.prodPunto(vt1[i]) + d2;
    }
    //Si dt2 [i]! = 0 y todos dt2 [i] tienen el mismo signo T2 se encuentra en un lado de P1
    if ((dt2[0] !== 0) && (dt2[1] !== 0) && (dt2[2] !== 0) && (((dt2[0] < 0) && (dt2[1] < 0) && (dt2[2] < 0)) || ((dt2[0] > 0) && (dt2[1] > 0) && (dt2[2] > 0)))) {
        return false;
    }

    // Verify if T1 and T2 are not co-planar ----------------------------------
    if ((dt1[0] !== 0) || (dt1[1] !== 0) || (dt1[2] !== 0)) {

        //Dirección de la linea L
        D = N1.prodCruz(N2);

        //Calcular los ejes para proyectar L
        aux = Math.abs(D.P3D.X);
        vof = 0;
        if (Math.abs(D.P3D.Y) > aux) {
            aux = Math.abs(D.P3D.Y);
            vof = 1;
        }

        if (Math.abs(D.P3D.Z) > aux) {
            aux = Math.abs(D.P3D.Z);
            vof = 2;
        }
        //Proyección de los vertices T1 y T2 dentro de la linea L
        for (i = 0; i < 3; i++) {
            switch (vof) {
                case 0:
                    pt1[i] = vt1[i].P3D.X;
                    pt2[i] = vt2[i].P3D.X;
                    break;
                case 1:
                    pt1[i] = vt1[i].P3D.Y;
                    pt2[i] = vt2[i].P3D.Y;
                    break;
                case 2:
                    pt1[i] = vt1[i].P3D.Z;
                    pt2[i] = vt2[i].P3D.Z;
                    break;
            }
        }


        // Calculate interval of T1 on L --------------------------------------
        // Determine the vertex on one side of P2
        if (dt1[0] !== 0)
        {

            if (dt1[1] !== 0)
            {

                if (dt1[2] !== 0)
                {

                    if (this.mismoSigno(dt1[0], dt1[1])) {
                        v0 = 0;
                        v1 = 2; // Different sign
                        v2 = 1;

                    }
                    else {
                        if (this.mismoSigno(dt1[0], dt1[2])) {
                            v0 = 0;
                            v1 = 1; // Different sign
                            v2 = 2;
                        }
                        else {
                            v0 = 1;
                            v1 = 0; // Different sign
                            v2 = 2;
                        }
                    }
                }
                else // dt1[2] = 0
                {
                    // Only the 3rd point of T1 is in the plane of T2
                    // if this point its in/on the triangle, there's a collision 
                    return(this.puntoEnTriangulo(vt2[0].P3D, vt2[1].P3D, vt2[2].P3D, vt1[2].P3D));
                    //--
                    if (this.mismoSigno(dt1[0], dt1[1])) {
                        v0 = 0;
                        v1 = 2; // Different sign
                        v2 = 1;
                    }
                    else
                    {
                        if (dt1[0] > 0)
                        {
                            v0 = 0;
                            v1 = 1; // Different sign
                            v2 = 2;
                        }
                        else
                        {
                            v0 = 1;
                            v1 = 0; // Different sign
                            v2 = 2;
                        }
                    }
                }
            }
            else // dt1[1] = 0
            {
                if (dt1[2] !== 0)
                {
                    // Only the 3rd point of T1 is in the plane of T2
                    // if this point its in/on the triangle, there's a collision 
                    return(this.puntoEnTriangulo(vt2[0].P3D, vt2[1].P3D, vt2[2].P3D, vt1[1].P3D));
                    //--

                    if (sameSign(dt1[0], dt1[2]))
                    {
                        v0 = 0;
                        v1 = 1; // Different sign
                        v2 = 2;
                    }
                    else
                    {
                        if (dt1[0] > 0)
                        {
                            v0 = 0;
                            v1 = 2; // Different sign
                            v2 = 1;
                        }
                        else
                        {
                            v0 = 1;
                            v1 = 0; // Different sign
                            v2 = 2;
                        }
                    }
                }
                else
                {
                    // Only the 2nd or 3rd points of T1 are in the plane of T2
                    if (this.puntoEnTriangulo(vt2[0].P3D, vt2[1].P3D, vt2[2].P3D, vt1[1].P3D) || this.puntoEnTriangulo(vt2[0].P3D, vt2[1].P3D, vt2[2].P3D, vt1[2].P3D))
                        return(true);
                    //--
                    v0 = 1;
                    v1 = 0; // Different sign
                    v2 = 2;
                }
            }
        }
        else // dt1[0] = 0
        {
            if (dt1[1] !== 0)
            {
                if (dt1[2] !== 0)
                {
                    // Only the 3rd point of T1 is in the plane of T2
                    // if this point its in/on the triangle, there's a collision 
                    return(this.puntoEnTriangulo(vt2[0].P3D, vt2[1].P3D, vt2[2].P3D, vt1[0].P3D));
                    //--

                    if (this.mismoSigno(dt1[1], dt1[2])) {
                        v0 = 1;
                        v1 = 0; // Different sign
                        v2 = 2;
                    }
                    else
                    {
                        if (dt1[1] > 0) {
                            v0 = 0;
                            v1 = 2; // Different sign
                            v2 = 1;
                        }
                        else {
                            v0 = 0;
                            v1 = 1; // Different sign
                            v2 = 2;
                        }
                    }
                }
                else // dt1[2] = 0
                {
                    // Only the 1nd or 3rd points of T1 are in the plane of T2
                    if (this.puntoEnTriangulo(vt2[0].P3D, vt2[1].P3D, vt2[2].P3D, vt1[0].P3D) || this.puntoEnTriangulo(vt2[0].P3D, vt2[1].P3D, vt2[2].P3D, vt1[2].P3D))
                        return(true);
                    //--
                    v0 = 0;
                    v1 = 1; // Different sign
                    v2 = 2;
                }
            }
            else // dt1[1] = 0
            {
                if (dt1[2] !== 0)
                {
                    // Only the 2nd or 3rd points of T1 are in the plane of T2
                    if (this.puntoEnTriangulo(vt2[0].P3D, vt2[1].P3D, vt2[2].P3D, vt1[0].P3D) || this.puntoEnTriangulo(vt2[0].P3D, vt2[1].P3D, vt2[2].P3D, vt1[1].P3D))
                        return(true);
                    //--
                    v0 = 0;
                    v1 = 2; // Different sign
                    v2 = 1;
                }
            }
        }
        // Calculate 1st interception of T1 with line L
        it1[0] = pt1[v0] + (pt1[v1] - pt1[v0]) * (dt1[v0] / (dt1[v0] - dt1[v1]));
        // Calculate 2nd interception of T1 with line L
        it1[1] = pt1[v1] + (pt1[v2] - pt1[v1]) * (dt1[v1] / (dt1[v1] - dt1[v2]));


        if (it1[0] > it1[1]) {
            number1 = it1[0];
            number2 = it1[1];
            this.swap();
            it1[0] = number1;
            it1[1] = number2;
        }


        // Calculate interval of T2 on L --------------------------------------
        if (dt2[0] !== 0)
        {

            if (dt2[1] !== 0)
            {

                if (dt2[2] !== 0)
                {

                    if (this.mismoSigno(dt2[0], dt2[1])) {
                        v0 = 0;
                        v1 = 2; // Different sign
                        v2 = 1;

                    }
                    else {
                        if (this.mismoSigno(dt2[0], dt2[2])) {
                            v0 = 0;
                            v1 = 1; // Different sign
                            v2 = 2;

                        }
                        else {

                            v0 = 1;
                            v1 = 0; // Different sign
                            v2 = 2;
                        }
                    }
                }
                else // dt2[2] = 0
                {
                    // Only the 3rd point of T2 is in the plane of T1
                    // if this point its in/on the triangle, there's a collision 
                    return(this.puntoEnTriangulo(vt1[0].P3D, vt1[1].P3D, vt1[2].P3D, vt2[2].P3D));
                    //--

                    if (this.mismoSigno(dt2[0], dt2[1])) {
                        v0 = 0;
                        v1 = 2; // Different sign
                        v2 = 1;
                    }
                    else
                    {
                        if (dt2[0] > 0)
                        {
                            v0 = 0;
                            v1 = 1; // Different sign
                            v2 = 2;
                        }
                        else
                        {
                            v0 = 1;
                            v1 = 0; // Different sign
                            v2 = 2;
                        }
                    }
                }
            }
            else // dt2[1] = 0
            {
                if (dt2[2] !== 0)
                {
                    // Only the 3rd point of T2 is in the plane of T1
                    // if this point its in/on the triangle, there's a collision 
                    return(this.puntoEnTriangulo(vt1[0].P3D, vt1[1].P3D, vt1[2].P3D, vt2[1].P3D));
                    //--

                    if (this.mismoSigno(dt2[0], dt2[2]))
                    {
                        v0 = 0;
                        v1 = 1; // Different sign
                        v2 = 2;
                    }
                    else
                    {
                        if (dt2[0] > 0)
                        {
                            v0 = 0;
                            v1 = 2; // Different sign
                            v2 = 1;
                        }
                        else
                        {
                            v0 = 1;
                            v1 = 0; // Different sign
                            v2 = 2;
                        }
                    }
                }
                else
                {
                    // Only the 2nd or 3rd points of T1 are in the plane of T2
                    if (this.puntoEnTriangulo(vt1[0].P3D, vt1[1].P3D, vt1[2].P3D, vt2[1].P3D) || this.puntoEnTriangulo(vt1[0].P3D, vt1[1].P3D, vt1[2].P3D, vt2[2].P3D))
                        return(true);
                    //--
                    v0 = 1;
                    v1 = 0; // Different sign
                    v2 = 2;
                }
            }
        }
        else // dt2[0] = 0
        {
            if (dt2[1] !== 0)
            {
                if (dt2[2] !== 0)
                {
                    // Only the 3rd point of T2 is in the plane of T1
                    // if this point its in/on the triangle, there's a collision 
                    return(this.puntoEnTriangulo(vt1[0].P3D, vt1[1].P3D, vt1[2].P3D, vt2[0].P3D));
                    //--

                    if (this.mismoSigno(dt2[1], dt2[2])) {
                        v0 = 1;
                        v1 = 0; // Different sign
                        v2 = 2;
                    }
                    else
                    {
                        if (dt2[1] > 0) {
                            v0 = 0;
                            v1 = 2; // Different sign
                            v2 = 1;
                        }
                        else {
                            v0 = 0;
                            v1 = 1; // Different sign
                            v2 = 2;
                        }
                    }
                }
                else // dt2[2] = 0
                {
                    // Only the 2nd or 3rd points of T1 are in the plane of T2
                    if (this.puntoEnTriangulo(vt1[0].P3D, vt1[1].P3D, vt1[2].P3D, vt2[0].P3D) || this.puntoEnTriangulo(vt1[0].P3D, vt1[1].P3D, vt1[2].P3D, vt2[2].P3D))
                        return(true);
                    //--
                    v0 = 0;
                    v1 = 1; // Different sign
                    v2 = 2;
                }
            }
            else // dt2[1] = 0
            {
                if (dt2[2] !== 0)
                {
                    // Only the 2nd or 3rd points of T1 are in the plane of T2
                    if (this.puntoEnTriangulo(vt1[0].P3D, vt1[1].P3D, vt1[2].P3D, vt2[0].P3D) || this.puntoEnTriangulo(vt1[0].P3D, vt1[1].P3D, vt1[2].P3D, vt2[1].P3D))
                        return(true);
                    //--
                    v0 = 0;
                    v1 = 2; // Different sign
                    v2 = 1;
                }
                else
                {
                    // Esto no va a ocurrir porque sino serian coplanares
                }
            }
        }
        // Calculate 1st interception of T2 with line L
        it2[0] = pt2[v0] + (pt2[v1] - pt2[v0]) * (dt2[v0] / (dt2[v0] - dt2[v1]));
        // Calculate 2nd interception of T2 with line L
        it2[1] = pt2[v1] + (pt2[v2] - pt2[v1]) * (dt2[v1] / (dt2[v1] - dt2[v2]));

        if (it2[0] > it2[1]) {
            number1 = it2[0];
            number2 = it2[1];
            swap();
            it2[0] = number1;
            it2[1] = number2;

        }


        // Verify if the intervals overlap ------------------------------------
        if ((it1[1] < it2[0]) || (it2[1] < it1[0])) {
            return(false);
        }
    }
    // If T1 and T2 are co-planar do point-in-triangle test -------------------
    else {
        // Point in triangle test
        if (!this.puntoEnTriangulo(vt1[0].P3D, vt1[1].P3D, vt1[2].P3D, vt2[0].P3D) && !this.puntoEnTriangulo(vt1[0].P3D, vt1[1].P3D, vt1[2].P3D, vt2[1].P3D) && !this.puntoEnTriangulo(vt1[0].P3D, vt1[1].P3D, vt1[2].P3D, vt2[2].P3D) && !this.puntoEnTriangulo(vt2[0].P3D, vt2[1].P3D, vt2[2].P3D, vt1[0].P3D) && !this.puntoEnTriangulo(vt2[0].P3D, vt2[1].P3D, vt2[2].P3D, vt1[1].P3D) && !this.puntoEnTriangulo(vt2[0].P3D, vt2[1].P3D, vt2[2].P3D, vt1[2].P3D)) {
            return(false);
        }
    }
    return(true);
};