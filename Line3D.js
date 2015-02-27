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
    this.P1 = line.P1;
    this.P2 = line.P2;
}

//Metodos


