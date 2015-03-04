/* Representacion de una Linea 3D en el espacio
 * Autor: Harold N. Montenegro H.
 */

//Atributos
var P1, P2;

//Constructores
function Line3D(A, B) {
    this.P1 = new Point3D(A.X, A.Y, A.Z);
    this.P2 = new Point3D(B.X, B.Y, B.Z);
}

function Line3Dcopy(l) {
    var line = new Line3D(l.P1, l.P2);
    return line;
}

//Metodos
Line3D.prototype.igual = function (l) {
    if (this.P1.X === l.P1.X && this.P1.Y === l.P1.Y && this.P1.Y === l.P1.Y && this.P2.X === l.P2.X && this.P2.Y === l.P2.Y && this.P2.Z === l.P2.Z) {
        return true;
    } else {
        return false;
    }
};

Line3D.prototype.puntoInterseccion = function (l) {
    var k;
    var U = new Vector3Dhead(this.P1, this.P2);
    var V = new Vector3Dhead(l.P1, l.P2);
    var CA = new Vector3Dhead(this.P1, l.P1);

    //Verificar si las lineas son paralelas, si lo son no intersectan
    var UV = U.prodCruz(V);
    var n = UV.norma();
    if (n === 0) {
        return p;
    }

    //Y si las lineas no son paralelas, buscar el punto de interseccion p
    var CAV = CA.prodCruz(V);

    if (UV.P3D.X !== 0) {
        k = CAV.P3D.X / UV.P3D.X;
    } else if (UV.P3D.Y !== 0) {
        k = CAV.P3D.Y / UV.P3D.Y;
    } else {
        k = CAV.P3D.Z / UV.P3D.Z;
    }

    var p = new Point3D(this.P1.X + k * U.P3D.X, this.P1.Y + k * U.P3D.Y, this.P1.Z + k * U.P3D.Z);
    return p;
};