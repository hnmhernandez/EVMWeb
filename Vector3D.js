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
    var vectorResultante = new Point3D(B.X - A.X, B.Y - A.Y, B.Z - A.Z);
    return vectorResultante;
}

//metodos
Vector3D.prototype.suma = function (u) {
    var vectorResultante = new Point3D(this.P3D.X + u.P3D.X, this.P3D.Y + u.P3D.Y, this.P3D.Z + u.P3D.Z);
    return vectorResultante;
};

Vector3D.prototype.resta = function (u) {
    var vectorResultante = new Point3D(this.P3D.X - u.P3D.X, this.P3D.Y - u.P3D.Y, this.P3D.Z - u.P3D.Z);
    return vectorResultante;
};

Vector3D.prototype.prodPunto = function (u) {
    return (this.P3D.X * u.P3D.X + this.P3D.Y * u.P3D.Y + this.P3D.Z * u.P3D.Z);
};

Vector3D.prototype.prodCruz = function (u) {
    var vectorResultante = new Point3D(this.P3D.Y * u.P3D.Z - this.P3D.Z * u.P3D.Y,
            this.P3D.Z * u.P3D.X - this.P3D.X * u.P3D.Z,
            this.P3D.X * u.P3D.Y - this.P3D.Y * u.P3D.X);

    return vectorResultante;
};

Vector3D.prototype.norma = function () {    //norma de un vector sqrt(v1^2 + v2^2 + v3^2)
    return (Math.sqrt(this.P3D.X * this.P3D.X + this.P3D.Y * this.P3D.Y + this.P3D.Z * this.P3D.Z));
};

Vector3D.prototype.normalizar = function () {
    var norma = this.norma();
    this.P3D.X = this.P3D.X / norma;
    this.P3D.Y = this.P3D.Y / norma;
    this.P3D.Z = this.P3D.Z / norma;
};