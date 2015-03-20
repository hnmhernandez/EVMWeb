/* Representacion de un Punto 3D en el espacio
 * Autor: Harold N. Montenegro H.
 */

//Atributos
var X, Y, Z;

//Constructor
function Point3D(x, y, z) {
    this.X = x;
    this.Y = y;
    this.Z = z;
}

function Point3Dcopy(p) {
    var punto = new Point3D(p.X, p.Y, p.Z);
    return punto;
}
//Metodos
Point3D.prototype.esIgual = function(v){
    if(this.X === v.X && this.Y == v.Y && this.Z == v.Z){
        return true;
    }else{
        return false;
    }
}

/* Rotar un vertice a lo largo de X */
Point3D.prototype.rotateOnX = function (angle) {
    this.Y = Math.cos(angle) * this.Y - Math.sin(angle) * this.Z;
    this.Z = Math.sin(angle) * this.Y + Math.cos(angle) * this.Z;
};

/* Rotar un vertice a lo largo de Y */
Point3D.prototype.rotateOnY = function (angle) {
    this.X = Math.cos(angle) * this.X + Math.sin(angle) * this.Z;
    this.Z = Math.cos(angle) * this.Z - Math.sin(angle) * this.X;
};

/* Rotar un vertice a lo largo de Z */
Point3D.prototype.rotateOnZ = function (angle) {
    this.X = Math.cos(angle) * this.X - Math.sin(angle) * this.Y;
    this.Y = Math.sin(angle) * this.X + Math.cos(angle) * this.Y;
};

/*Translacion de un vertice*/
Point3D.prototype.translate = function (tx, ty, tz) {
    this.X = this.X + tx;
    this.Y = this.Y + ty;
    this.Z = this.Z + tz;
};

/*Escalado de un vertice*/
Point3D.prototype.scale = function (sx, sy, sz) {
    this.X = this.X * sx;
    this.Y = this.Y * sy;
    this.Z = this.Z * sz;
};
