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