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

Line3D.prototype.puntoInterseccion = function (l, encontrado) {
    var k;
    var U = new Vector3Dhead(this.P1, this.P2);
    var u = new Vector3D(U.X, U.Y, U.Z);
    var V = new Vector3Dhead(l.P1, l.P2);
    var v = new Vector3D(V.X, V.Y, V.Z);
    var CA = new Vector3Dhead(this.P1, l.P1);
    var ca = new Vector3D(CA.X, CA.Y, CA.Z);
    var p = new Point3Dnull();
    
    console.log(u.P3D);
    console.log(v.P3D);
    console.log(ca.P3D);

    //Verificar si las lineas son paralelas, si lo son no intersectan
    encontrado = false;
    var UV = u.prodCruz(v);
    var uv = new Vector3D(UV.X, UV.Y, UV.Z);
    var n = uv.norma();
    if (n === 0) {
        return p;
    }
    
    //Y si las lineas no son paralelas, buscar el punto de interseccion p
    encontrado = true;
    var CAV = ca.prodCruz(v);
    
    if (UV.X !== 0) {
        k = CAV.X / UV.X;
    } else if (UV.Y !== 0) {
        k = CAV.Y / UV.Y;
    } else {
        k = CAV.Z / UV.Z;
    }

    p.X = this.P1.X + k * U.X;
    p.Y = this.P1.Y + k * U.Y;
    p.Z = this.P1.Z + k * U.Z;
    return p;
};