/* Representacion de un plano en el espacio 3D
 * Autor: Harold N. Montenegro H.
 */

//Atributos
var A, B, C;

//Constructores
function Plane() {
    this.A = new Point3D(0.0, 0.0, 0.0);
    this.B = new Point3D(1.0, 0.0, 0.0);
    this.C = new Point3D(0.0, 1.0, 0.0);
}

function PlaneWithPoints3D(p1, p2, p3) {
    var plano = new Plane();
    plano.A = new Point3D(p1.X, p1.Y, p1.Z);
    plano.B = new Point3D(p2.X, p2.Y, p2.Z);
    plano.C = new Point3D(p3.X, p3.Y, p3.Z);
    return plano;
}

function PlaneCopy(p) {
    var plano = new Plane();
    plano.A = new Point3D(p.A.X, p.A.Y, p.A.Z);
    plano.B = new Point3D(p.B.X, p.B.Y, p.B.Z);
    plano.C = new Point3D(p.C.X, p.C.Y, p.C.Z);
    return plano;
}

//Metodos
Plane.prototype.normal = function () {
    var V1 = new Vector3Dhead(this.A, this.B);
    var V2 = new Vector3Dhead(this.A, this.C);
    var VN = V1.prodCruz(V2);
    return VN;
};

Plane.prototype.unitNormal = function () {
    var V1 = new Vector3Dhead(this.A, this.B);
    var V2 = new Vector3Dhead(this.A, this.C);
    var VN = V1.prodCruz(V2);
    VN.normalizar();
    return VN;
};

Plane.prototype.puntoEnPlano = function (P) {
    var V = new Vector3Dhead(this.A, this.P);
    var n = new Plane();
    var N = n.normal();
    if(Math.abs(N.prodPunto(V)) <= 1.0e-15 ){
        return true;
    }else{
        return false;
    }
};