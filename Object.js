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


/*ESPERAR POR KIARA*/
//function Object(filename, esRGB){
//    
//}



//Metodos
// Verifica si dos números tienen el mismo signo
Object.prototype.mismoSigno = function (number1, number2) {
    if (((number1 < 0) && (number2 < 0)) || ((number1 >= 0) && (number2 >= 0)))
        return(true);
    else
        return(false);
};

Object.prototype.calcularVectoresNormales = function () {
    for (var i = 0; i < this.NF; i++) {
        // 3 puntos para calcular 2 vectores para formar un plano
        var puntoA = new Point3Dcopy(this.F[i][0]);
        var puntoB = new Point3Dcopy(this.F[i][1]);
        var puntoC = new Point3Dcopy(this.F[i][2]);
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

    //Verificar si T1 y T2 no son co-planar
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

        //Calcular el intervalo de T1 en L
        //Determinar el vertice en un lado de P2
        if (dt1[0] !== 0) {
            if (dt1[1] !== 0) {
                if (dt1[2] !== 0) {
                    if (this.mismoSigno(dt1[0], dt1[1])) {
                        v0 = 0;
                        v1 = 2; //Signo diferente
                        v2 = 1;
                    } else {
                        if (this.mismoSigno(dt1[0], dt1[2])) {
                            v0 = 1;
                            v1 = 0; // Signo diferente
                            v2 = 2;
                        }
                    }
                }
            }
            else{   //dt[2] = 0
                //Solo el 3er punto de T1 esta en el plano de T2
                //si este punto esta dentro/en el triangulo, entonces es una colisión
                
            }
        }

        console.log(pt2);
    }

};