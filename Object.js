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
Object.prototype.coordenadasBaricentricas = function (a, b, c, p, u, v, w) {

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
    var pl = new PlaneWithPoint3D(a, b, c);
    var u, v, w;
    if (pl.puntoEnPlano(p)) {
        this.coordenadasBaricentricas(a, b, c, p, u, v, w);
        return (v >= 0.0 && w >= 0.0 && (v + w) <= 1.0);
    }else{
        return false;
    }
};