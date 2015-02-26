/* Representacion de un Punto 3D en el espacio
 * Autor: Harold N. Montenegro H.
 */

//Atributos
var X, Y, Z;

//Constructor
function point3D(x, y, z) {
    this.X = x;
    this.Y = y;
    this.Z = z;
}

//Metodos

/* Rotar un vertice a lo largo de X */
point3D.prototype.rotateOnX = function (angle) {
    this.Y = Math.cos(angle) * this.Y - Math.sin(angle) * this.Z;
    this.Z = Math.sin(angle) * this.Y + Math.cos(angle) * this.Z;
};

/* Rotar un vertice a lo largo de Y */
point3D.prototype.rotateOnY = function (angle) {
    this.X = Math.cos(angle) * this.X + Math.sin(angle) * this.Z;
    this.Z = Math.cos(angle) * this.Z - Math.sin(angle) * this.X;
};

/* Rotar un vertice a lo largo de Z */
point3D.prototype.rotateOnZ = function (angle) {
    this.X = Math.cos(angle) * this.X - Math.sin(angle) * this.Y;
    this.Y = Math.sin(angle) * this.X + Math.cos(angle) * this.Y;
};

/*Translacion de un vertice*/
point3D.prototype.translate = function (tx, ty, tz) {
    this.X = this.X + tx;
    this.Y = this.Y + ty;
    this.Z = this.Z + tz;
};

/*Escalado de un vertice*/
point3D.prototype.scale = function (sx, sy, sz) {
    this.X = this.X * sx;
    this.Y = this.Y * sy;
    this.Z = this.Z * sz;
};
