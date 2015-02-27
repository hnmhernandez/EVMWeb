/* Representacion de un Vector 3D en el espacio
 * Autor: Harold N. Montenegro H.
 */

//Atributo
var P3D;

//Constructores
function Vector3D(x, y, z) {
    this.P3D = new Point3D(x, y, z);
}

function Vector3Dorigin(P) {     //Cola = Origen(0,0,0); Cabeza = P(X,Y,Z)
    this.P3D = new Point3D(P.X, P.Y, P.Z);
}

function Vector3Dhead(A, B) {    //Cola = A(X,Y,Z); Cabeza = B(X,Y,Z)
    this.P3D = new Point3D(B.X - A.X, B.Y - A.Y, B.Z - A.Z);
}

//metodos
Vector3D.prototype.suma = function (u) {
    this.P3D = new Point3D(this.P3D.X + u.P3D.X, this.P3D.Y + u.P3D.Y, this.P3D.Z + u.P3D.Z);
};
