/*
 /*
 * Libreria para la representacion de objetos volumetricos usando el modelo EVM.
 * Dependencias: Point3D.js, Line3D.js, Object.js
 *
 * Autor: Harold N. Montenegro H.
 */

//Atributos
var EVM_Order = {XYZ: 1, XZY: 2, YXZ: 3, YZX: 4, ZXY: 5, ZYX: 6};
var Dimension = {D1: 1, D2: 2, D3: 3};

var NEV;    //Numero de vertices extremos
var v;      //Vectores de vertices extremos
var ABC;    //ABC_sort
var dim;    //Dimension del EVM

var EVMFileOutput;

//Constructores
function EVM(ord, d) {
    this.NEV = 0;
    this.v = new Array();
    this.ABC = ord;
    this.dim = d;
}

function EVMWithExVert(exVert, ord, d) {
    var nuevoEVM = new EVM(ord, d);
    nuevoEVM.v = exVert;
    nuevoEVM.ABC = ord;
    nuevoEVM.dim = d;
    nuevoEVM.NEV = exVert.length;
    if (nuevoEVM.NEV > 1) {
        nuevoEVM.order(nuevoEVM.ABC);
    }
    return nuevoEVM;
}

function EVMCopy(e){
    var nuevoEVM = JSON.parse(JSON.stringify(e));
    copiarMetodos(nuevoEVM, e);
    return nuevoEVM;
}

function copiarMetodos(dest, src) {
    var p;
    for (p in src) {
        if (src.hasOwnProperty(p) && !dest.hasOwnProperty(p)) {
            dest[p] = src[p];
        }
    }
    dest.__proto__ = src.__proto__;
}

function EVMFile(filename, callback) {
    var evmResult = new EVM(1, 3);
    var lector = new FileReader();

    var i, n, order, vertex, verticesArray;

    var exVert = new Array();
    var ord;
    var d;

    lector.onload = function (e) {
        var contenido = e.target.result;
        d = Dimension.D3;
        contenido = contenido.split("\n");
        n = contenido[0].split(" ")[1];
        order = contenido[0].split(" ")[3];
        if (order === "XYZ" || order === "xyz") {
            ord = EVM_Order.XYZ;
        } else if (order === "XZY" || order === "xzy") {
            ord = EVM_Order.XZY;
        } else if (order === "YXZ" || order === "yxz") {
            ord = EVM_Order.YXZ;
        } else if (order === "YZX" || order === "yzx") {
            ord = EVM_Order.YZX;
        } else if (order === "ZXY" || order === "ZXY") {
            ord = EVM_Order.ZXY;
        } else if (order === "ZYX" || order === "zyx") {
            ord = EVM_Order.ZYX;
        } else {
            ord = EVM_Order.XYZ;
        }
        for (i = 0; i < n; i++) {
            verticesArray = contenido[i + 2].split(" ");
            vertex = new Point3D(parseFloat(verticesArray[0]), parseFloat(verticesArray[1]), parseFloat(verticesArray[2]));
            exVert.push(vertex);
        }

        evmResult = new EVMWithExVert(exVert, ord, d);
        if (callback) {
            callback.call(this, evmResult);
        }
    };
    lector.readAsText(filename[0]);
}


//Metodos
EVM.prototype.putExtremeVertex = function (p) {
    this.v.push(p);
    this.NEV++;
};

EVM.prototype.order = function (ord) {
    this.ABC = ord;
    switch (ord) {
        case EVM_Order.XYZ:
            this.v.sort(function (a, b) {
                return (a.X < b.X || (a.X === b.X && (a.Y < b.Y || (a.Y === b.Y && a.Z < b.Z))))? -1 : 0;
            });
            break;

        case EVM_Order.XZY:
            this.v.sort(function (a, b) {
                return(a.X < b.X || (a.X === b.X && (a.Z < b.Z || (a.Z === b.Z && a.Y < b.Y))))? -1 : 0;
            });
            break;

        case EVM_Order.YXZ:
            this.v.sort(function (a, b) {
                return(a.Y < b.Y || (a.Y === b.Y && (a.X < b.X || (a.X === b.X && a.Z < b.Z))))? -1 : 0;
            });
            break;

        case EVM_Order.YZX:
            this.v.sort(function (a, b) {
                return(a.Y < b.Y || (a.Y === b.Y && (a.Z < b.Z || (a.Z === b.Z && a.X < b.X))))? -1 : 0;
            });
            break;

        case EVM_Order.ZXY:
            this.v.sort(function (a, b) {
                return(a.Z < b.Z || (a.Z === b.Z && (a.X < b.X || (a.X === b.X && a.Y < b.Y))))? -1 : 0;
            });
            break;

        case EVM_Order.ZYX:
            this.v.sort(function (a, b) {
                return(a.Z < b.Z || (a.Z === b.Z && (a.Y < b.Y || (a.Y === b.Y && a.X < b.X))))? -1 : 0;
            });
            break;
    }
};

//Colision 1D
EVM.prototype.collision1D = function (B) {
    var C = new EVM(B.ABC, this.dim);
    var ia = 0, ib = 0;
    var aOrd = this.ABC;

    if (this.ABC !== B.ABC)
        this.order(B.ABC);

    while (C.NEV === 0 && ia < this.NEV && ib < B.NEV) {
        switch (this.ABC) {
            case EVM_Order.YZX:
            case EVM_Order.ZYX:
                if (this.v[ia].X > B.v[ib].X) {
                    if (ia % 2 === 1) {
                        if (this.v[ia - 1].X < B.v[ib].X)
                            C.putExtremeVertex(B.v[ib]);
                        ib++;
                    }
                }
                else
                {
                    if (this.v[ia].X < B.v[ib].X)
                    {
                        // Search if A in line ending in B
                        if (ib % 2 === 1)
                            if (B.v[ib - 1].X < this.v[ia].X)
                                C.putExtremeVertex(this.v[ia]);
                        ia++;
                    }
                    else
                    {
                        // A = B
                        if ((ia % 2 === 0 && ib % 2 === 0) || (ia % 2 === 1 && ib % 2 === 1))
                            C.putExtremeVertex(this.v[ia]);
                        ia++;
                        ib++;
                    }
                }
                break;
            case EVM_Order.XZY:
            case EVM_Order.ZXY:
                if (this.v[ia].Y > B.v[ib].Y)
                {
                    // Search if B in line ending in A
                    if (ia % 2 === 1)
                        if (this.v[ia - 1].Y < B.v[ib].Y)
                            C.putExtremeVertex(B.v[ib]);
                    ib++;
                }
                else
                {
                    if (this.v[ia].Y < B.v[ib].Y)
                    {
                        // Search if A in line ending in B
                        if (ib % 2 === 1)
                            if (B.v[ib - 1].Y < this.v[ia].Y)
                                C.putExtremeVertex(this.v[ia]);
                        ia++;
                    }
                    else
                    {
                        // A = B
                        if ((ia % 2 === 0 && ib % 2 === 0) || (ia % 2 === 1 && ib % 2 === 1))
                            C.putExtremeVertex(this.v[ia]);
                        ia++;
                        ib++;
                    }
                }
                break;
            case EVM_Order.XYZ:
            case EVM_Order.YXZ:
                if (this.v[ia].Z > B.v[ib].Z)
                {
                    // Search if B in line ending in A
                    if (ia % 2 === 1)
                        if (this.v[ia - 1].Z < B.v[ib].Z)
                            C.putExtremeVertex(B.v[ib]);
                    ib++;
                }
                else
                {
                    if (this.v[ia].Z < B.v[ib].Z)
                    {
                        // Search if A in line ending in B
                        if (ib % 2 === 1)
                            if (B.v[ib - 1].Z < this.v[ia].Z)
                                C.putExtremeVertex(this.v[ia]);
                        ia++;
                    }
                    else
                    {
                        // A = B
                        if ((ia % 2 === 0 && ib % 2 === 0) || (ia % 2 === 1 && ib % 2 === 1))
                            C.putExtremeVertex(this.v[ia]);
                        ia++;
                        ib++;
                    }
                }
                break;
        }
    }

    // Return A to its original order
    if (this.ABC !== aOrd)
        order(aOrd);
    return(C);
};

//Colision
EVM.prototype.collision = function (B) {
    var C = new EVM(B.ABC, this.dim);
    var sA = new EVM(B.ABC, Dimension.D2);
    var sB = new EVM(B.ABC, Dimension.D2);
    var sCcurr = new EVM(B.ABC, Dimension.D2);
    var sCprev = new EVM(B.ABC, Dimension.D2);
    var plv = new EVM(B.ABC, Dimension.D2);
    var aOrd = this.ABC;

    var extra = new objExtra();

    if (this.ABC !== B.ABC)
        this.order(B.ABC);

    if (this.dim === 1) {
        C = this.collision1D(B);
    } else {
        if (this.dim === Dimension.D2) {
            sA.dim = Dimension.D1;
            sB.dim = Dimension.D1;
            sCcurr.dim = Dimension.D1;
            sCprev.dim = Dimension.D1;
            plv.dim = Dimension.D1;
        }
        extra.ia = 0;
        extra.ib = 0;
        this.nextObject(B, extra);
        this.improve(B, 0, plv, sA, sB, C, sCprev, sCcurr, extra);
        while (C.NEV === 0 && extra.ia < this.NEV && extra.ib < B.NEV) {
            if (extra.fromA) {
                plv = this.readPlv(true , extra);
                sA = sA.getSection(plv);
            }
            if (extra.fromB) {
                plv = B.readPlv(false, extra);
                sB = sB.getSection(plv);
            }
            sCprev = sCcurr;
            sCcurr = sA.collision(sB);

            plv = sCprev.getPlv(sCcurr);
            plv.setCoordinate(extra.coord);
            C.putPlv(plv);

            this.nextObject(B, extra);
        }
    }

    if (this.ABC !== aOrd)
        this.order(aOrd);

    return (C);
};

//Union 1D
EVM.prototype.union1D = function (B) {
    var C = new EVM(B.ABC, this.dim);
    var ia = 0, ib = 0;
    var aOrd = this.ABC;

    if (this.ABC !== B.ABC)
        this.order(B.ABC);

    while (ia < this.NEV && ib < B.NEV) {
        switch (this.ABC) {
            case EVM_Order.YZX:
            case EVM_Order.ZYX:
                if (this.v[ia].X > B.v[ib].X) {
                    //Buscar si B no esta dentro del final de la linea en A
                    if (ia % 2 === 0)
                        C.putExtremeVertex(B.v[ib]);
                    ib++;
                } else {
                    if (this.v[ia].X < B.v[ib].X) {
                        //Buscar si A no esta dentro del final de la linea en B
                        if (ib % 2 === 0)
                            C.putExtremeVertex(this.v[ia]);
                        ia++;
                    } else {
                        // A=B
                        if ((ia % 2 === 0 && ib % 2 === 0) || (ia % 2 === 1 && ib % 2 === 1))
                            C.putExtremeVertex(this.v[ia]);
                        ia++;
                        ib++;
                    }
                }
                break;

            case EVM_Order.XZY:
            case EVM_Order.ZXY:
                if (this.v[ia].Y > B.v[ib].Y) {
                    //Buscar si B no esta dentro del final de la linea en A
                    if (ia % 2 === 0)
                        C.putExtremeVertex(B.v[ib]);
                    ib++;
                } else {
                    if (this.v[ia].Y < B.v[ib].Y) {
                        //Buscar si A no esta dentro del final de la linea en B
                        if (ib % 2 === 0)
                            C.putExtremeVertex(this.v[ia]);
                        ia++;
                    } else {
                        // A=B
                        if ((ia % 2 === 0 && ib % 2 === 0) || (ia % 2 === 1 && ib % 2 === 1))
                            C.putExtremeVertex(this.v[ia]);
                        ia++;
                        ib++;
                    }
                }
                break;

            case EVM_Order.XYZ:
            case EVM_Order.YXZ:
                if (this.v[ia].Z > B.v[ib].Z) {
                    //Buscar si B no esta dentro del final de la linea en A
                    if (ia % 2 === 0)
                        C.putExtremeVertex(B.v[ib]);
                    ib++;
                } else {
                    if (this.v[ia].Z < B.v[ib].Z) {
                        //Buscar si A no esta dentro del final de la linea en B
                        if (ib % 2 === 0)
                            C.putExtremeVertex(this.v[ia]);
                        ia++;
                    } else {
                        // A=B
                        if ((ia % 2 === 0 && ib % 2 === 0) || (ia % 2 === 1 && ib % 2 === 1))
                            C.putExtremeVertex(this.v[ia]);
                        ia++;
                        ib++;
                    }
                }
                break;
        }
    }

    while (ia < this.NEV) {
        C.putExtremeVertex(this.v[ia]);
        ia++;
    }

    while (ib < B.NEV) {
        C.putExtremeVertex(B.v[ib]);
        ib++;
    }

    //Return A to its original order
    if (this.ABC !== aOrd)
        this.order(aOrd);

    return C;
};

//Interseccion 1D
EVM.prototype.intersection1D = function (B) {
    var C = new EVM(B.ABC, this.dim);
    var ia = 0, ib = 0;
    var aOrd = this.ABC;

    // A, B and C share order
    if (this.ABC !== B.ABC)
        this.order(B.ABC);

    while (ia < this.NEV && ib < B.NEV)
    {
        switch (this.ABC)
        {
            case EVM_Order.YZX:
            case EVM_Order.ZYX:
                if (this.v[ia].X > B.v[ib].X)
                {
                    // Search if B in line ending in A
                    if (ia % 2 === 1)
                        if (this.v[ia - 1].X < B.v[ib].X)
                            C.putExtremeVertex(B.v[ib]);
                    ib++;
                }
                else
                {
                    if (this.v[ia].X < B.v[ib].X)
                    {
                        // Search if A in line ending in B
                        if (ib % 2 === 1)
                            if (B.v[ib - 1].X < this.v[ia].X)
                                C.putExtremeVertex(this.v[ia]);
                        ia++;
                    }
                    else
                    {
                        // A = B
                        if ((ia % 2 === 0 && ib % 2 === 0) || (ia % 2 === 1 && ib % 2 === 1))
                            C.putExtremeVertex(this.v[ia]);
                        ia++;
                        ib++;
                    }
                }
                break;
            case EVM_Order.XZY:
            case EVM_Order.ZXY:
                if (this.v[ia].Y > B.v[ib].Y)
                {
                    // Search if B in line ending in A
                    if (ia % 2 === 1)
                        if (this.v[ia - 1].Y < B.v[ib].Y)
                            C.putExtremeVertex(B.v[ib]);
                    ib++;
                }
                else
                {
                    if (this.v[ia].Y < B.v[ib].Y)
                    {
                        // Search if A in line ending in B
                        if (ib % 2 === 1)
                            if (B.v[ib - 1].Y < this.v[ia].Y)
                                C.putExtremeVertex(this.v[ia]);
                        ia++;
                    }
                    else
                    {
                        // A = B
                        if ((ia % 2 === 0 && ib % 2 === 0) || (ia % 2 === 1 && ib % 2 === 1))
                            C.putExtremeVertex(this.v[ia]);
                        ia++;
                        ib++;
                    }
                }
                break;
            case EVM_Order.XYZ:
            case EVM_Order.YXZ:
                if (this.v[ia].Z > B.v[ib].Z)
                {
                    // Search if B in line ending in A
                    if (ia % 2 === 1)
                        if (this.v[ia - 1].Z < B.v[ib].Z)
                            C.putExtremeVertex(B.v[ib]);
                    ib++;
                }
                else
                {
                    if (this.v[ia].Z < B.v[ib].Z)
                    {
                        // Search if A in line ending in B
                        if (ib % 2 === 1)
                            if (B.v[ib - 1].Z < this.v[ia].Z)
                                C.putExtremeVertex(this.v[ia]);
                        ia++;
                    }
                    else
                    {
                        // A = B
                        if ((ia % 2 === 0 && ib % 2 === 0) || (ia % 2 === 1 && ib % 2 === 1))
                            C.putExtremeVertex(this.v[ia]);
                        ia++;
                        ib++;
                    }
                }
                break;
        }
    }

    // Return A to its original order
    if (this.ABC !== aOrd)
        this.order(aOrd);

    return(C);
};

//MergeXOR 3D
EVM.prototype.mergeXOR3D = function (B)
{
    var C = new EVM(B.ABC, this.dim);
    var ia = 0, ib = 0, aob;
    var aOrd = this.ABC;

    // A, B and C share order
    if (this.ABC !== B.ABC)
        this.order(B.ABC);

    while (ia < this.NEV && ib < B.NEV)
    {
        switch (this.ABC)
        {
            case EVM_Order.XYZ:
                if (this.v[ia].X < B.v[ib].X)
                    aob = 1;
                else
                {
                    if (this.v[ia].X > B.v[ib].X)
                        aob = 2;
                    else
                    {
                        if (this.v[ia].Y < B.v[ib].Y)
                            aob = 1;
                        else
                        {
                            if (this.v[ia].Y > B.v[ib].Y)
                                aob = 2;
                            else
                            {
                                if (this.v[ia].Z < B.v[ib].Z)
                                    aob = 1;
                                else
                                {
                                    if (this.v[ia].Z > B.v[ib].Z)
                                        aob = 2;
                                    else
                                        aob = 3;
                                }
                            }
                        }
                    }
                }
                break;
            case EVM_Order.XZY:
                if (this.v[ia].X < B.v[ib].X)
                    aob = 1;
                else
                {
                    if (this.v[ia].X > B.v[ib].X)
                        aob = 2;
                    else
                    {
                        if (this.v[ia].Z < B.v[ib].Z)
                            aob = 1;
                        else
                        {
                            if (this.v[ia].Z > B.v[ib].Z)
                                aob = 2;
                            else
                            {
                                if (this.v[ia].Y < B.v[ib].Y)
                                    aob = 1;
                                else
                                {
                                    if (this.v[ia].Y > B.v[ib].Y)
                                        aob = 2;
                                    else
                                        aob = 3;
                                }
                            }
                        }
                    }
                }
                break;
            case EVM_Order.YXZ:
                if (this.v[ia].Y < B.v[ib].Y)
                    aob = 1;
                else
                {
                    if (this.v[ia].Y > B.v[ib].Y)
                        aob = 2;
                    else
                    {
                        if (this.v[ia].X < B.v[ib].X)
                            aob = 1;
                        else
                        {
                            if (this.v[ia].X > B.v[ib].X)
                                aob = 2;
                            else
                            {
                                if (this.v[ia].Z < B.v[ib].Z)
                                    aob = 1;
                                else
                                {
                                    if (this.v[ia].Z > B.v[ib].Z)
                                        aob = 2;
                                    else
                                        aob = 3;
                                }
                            }
                        }
                    }
                }
                break;
            case EVM_Order.YZX:
                if (this.v[ia].Y < B.v[ib].Y)
                    aob = 1;
                else
                {
                    if (this.v[ia].Y > B.v[ib].Y)
                        aob = 2;
                    else
                    {
                        if (this.v[ia].Z < B.v[ib].Z)
                            aob = 1;
                        else
                        {
                            if (this.v[ia].Z > B.v[ib].Z)
                                aob = 2;
                            else
                            {
                                if (this.v[ia].X < B.v[ib].X)
                                    aob = 1;
                                else
                                {
                                    if (this.v[ia].X > B.v[ib].X)
                                        aob = 2;
                                    else
                                        aob = 3;
                                }
                            }
                        }
                    }
                }
                break;
            case EVM_Order.ZXY:
                if (this.v[ia].Z < B.v[ib].Z)
                    aob = 1;
                else
                {
                    if (this.v[ia].Z > B.v[ib].Z)
                        aob = 2;
                    else
                    {
                        if (this.v[ia].X < B.v[ib].X)
                            aob = 1;
                        else
                        {
                            if (this.v[ia].X > B.v[ib].X)
                                aob = 2;
                            else
                            {
                                if (this.v[ia].Y < B.v[ib].Y)
                                    aob = 1;
                                else
                                {
                                    if (this.v[ia].Y > B.v[ib].Y)
                                        aob = 2;
                                    else
                                        aob = 3;
                                }
                            }
                        }
                    }
                }
                break;
            case EVM_Order.ZYX:
                if (this.v[ia].Z < B.v[ib].Z)
                    aob = 1;
                else
                {
                    if (this.v[ia].Z > B.v[ib].Z)
                        aob = 2;
                    else
                    {
                        if (this.v[ia].Y < B.v[ib].Y)
                            aob = 1;
                        else
                        {
                            if (this.v[ia].Y > B.v[ib].Y)
                                aob = 2;
                            else
                            {
                                if (this.v[ia].X < B.v[ib].X)
                                    aob = 1;
                                else
                                {
                                    if (this.v[ia].X > B.v[ib].X)
                                        aob = 2;
                                    else
                                        aob = 3;
                                }
                            }
                        }
                    }
                }
                break;
        }

        switch (aob)
        {
            case 1:
                C.putExtremeVertex(this.v[ia]);
                ia++;
                break;
            case 2:
                C.putExtremeVertex(B.v[ib]);
                ib++;
                break;
            case 3:
                ia++;
                ib++;
                break;
        }
    }
    while (ia < this.NEV)
    {
        C.putExtremeVertex(this.v[ia]);
        ia++;
    }
    while (ib < B.NEV)
    {
        C.putExtremeVertex(B.v[ib]);
        ib++;
    }

    // Return A to its original order
    if (this.ABC !== aOrd)
        this.order(aOrd);

    return(C);
};

EVM.prototype.mergeXOR = function (B)
{
    var C = new EVM(this.ABC, this.dim);
    if (this.dim === B.dim)
    {
        switch (this.dim)
        {
            case Dimension.D1:
                C = this.mergeXOR1D(B);
                break;
            case Dimension.D2:
                C = this.mergeXOR2D(B);
                break;
            case Dimension.D3:
                C = this.mergeXOR3D(B);
                break;
        }
    }
    else
    {
        console.log("Error: The dimensions of A and B do not match.");
    }
    return(C);
};

EVM.prototype.difference1D = function (B)
{
    var C = new EVM(B.ABC, this.dim);
    var ia = 0, ib = 0, aob;
    var aOrd = this.ABC;

    // A, B and C share order
    if (this.ABC !== B.ABC)
        this.order(B.ABC);

    while (ia < this.NEV && ib < B.NEV)
    {
        switch (this.ABC)
        {
            case EVM_Order.YZX:
            case EVM_Order.ZYX:
                if (this.v[ia].X < B.v[ib].X)
                    aob = 1;
                else
                    if (this.v[ia].X > B.v[ib].X)
                        aob = 2;
                else
                    aob = 3;
                break;
            case EVM_Order.XZY:
            case EVM_Order.ZXY:
                if (this.v[ia].Y < B.v[ib].Y)
                    aob = 1;
                else
                    if (this.v[ia].Y > B.v[ib].Y)
                        aob = 2;
                else
                    aob = 3;
                break;
            case EVM_Order.XYZ:
            case EVM_Order.YXZ:
                if (this.v[ia].Z < B.v[ib].Z)
                    aob = 1;
                else
                    if (this.v[ia].Z > B.v[ib].Z)
                        aob = 2;
                else
                    aob = 3;
                break;
        }
        switch (aob)
        {
            case 1:
                if (ib % 2 === 0) // B beginning line
                    C.putExtremeVertex(this.v[ia]);
                ia++;
                break;
            case 2:
                if (ia % 2 === 1) // A ending line
                {
                    switch (this.ABC)
                    {
                        case EVM_Order.XYZ:
                        case EVM_Order.YXZ:
                            if (this.v[ia - 1].Z < B.v[ib].Z) // B in line
                                C.putExtremeVertex(B.v[ib]);
                            break;
                        case EVM_Order.XZY:
                        case EVM_Order.ZXY:
                            if (this.v[ia - 1].Y < B.v[ib].Y) // B in line
                                C.putExtremeVertex(B.v[ib]);
                            break;
                        case EVM_Order.YZX:
                        case EVM_Order.ZYX:
                            if (this.v[ia - 1].X < B.v[ib].X) // B in line
                                C.putExtremeVertex(B.v[ib]);
                            break;
                    }
                }
                ib++;
                break;
            case 3:
                if (ia % 2 === 0)     // A beginning line
                {
                    if (ib % 2 === 1) // B ending line
                        C.putExtremeVertex(this.v[ia]);
                }
                else // A ending line
                {
                    if (ib % 2 === 0) // B beginning line
                        C.putExtremeVertex(this.v[ia]);
                }
                ia++;
                ib++;
                break;
        }
    }
    while (ia < this.NEV)
    {
        C.putExtremeVertex(this.v[ia]);
        ia++;
    }

    // Return A to its original order
    if (this.ABC !== aOrd)
        this.order(aOrd);

    return(C);
};

EVM.prototype.nextObject = function (B, extra) {
    var inv = -1.7976931348623157e+308;
    var coorda = inv, coordb = inv;
    if (this.dim === Dimension.D3) {
        switch (this.ABC) {
            case EVM_Order.XYZ:
            case EVM_Order.XZY:
                if (this.NEV > 0 && extra.ia < this.NEV)
                    coorda = this.v[extra.ia].X;
                if (B.NEV > 0 && extra.ib < B.NEV)
                    coordb = B.v[extra.ib].X;
                break;

            case EVM_Order.YXZ:
            case EVM_Order.YZX:
                if (this.NEV > 0 && extra.ia < this.NEV)
                    coorda = this.v[extra.ia].Y;
                if (B.NEV > 0 && extra.ib < B.NEV)
                    coordb = B.v[extra.ib].Y;
                break;

            case EVM_Order.ZXY:
            case EVM_Order.ZYX:
                if (this.NEV > 0 && extra.ia < this.NEV)
                    coorda = this.v[extra.ia].Z;
                if (B.NEV > 0 && extra.ib < B.NEV)
                    coordb = B.v[extra.ib].Z;
                break;
        }
    }
    else {  //Buscando lineas dentro de la coordenada B
        switch (this.ABC) {
            case EVM_Order.XYZ:
            case EVM_Order.ZYX:
                if (this.NEV > 0 && extra.ia < this.NEV)
                    coorda = this.v[extra.ia].Y;
                if (B.NEV > 0 && extra.ib < B.NEV)
                    coordb = B.v[extra.ib].Y;
                break;

            case EVM_Order.XZY:
            case EVM_Order.YZX:
                if (this.NEV > 0 && extra.ia < this.NEV)
                    coorda = this.v[extra.ia].Z;
                if (B.NEV > 0 && extra.ib < B.NEV)
                    coordb = B.v[extra.ib].Z;
                break;

            case EVM_Order.YXZ:
            case EVM_Order.ZXY:
                if (this.NEV > 0 && extra.ia < this.NEV)
                    coorda = this.v[extra.ia].X;
                if (B.NEV > 0 && extra.ib < B.NEV)
                    coordb = B.v[extra.ib].X;
                break;
        }
    }
    if (coorda !== inv && coordb !== inv) {
        if (coorda < coordb) {
            extra.fromA = true;
            extra.fromB = false;
            extra.coord = coorda;
        }
        else {
            if (coorda > coordb) {
                extra.fromA = false;
                extra.fromB = true;
                extra.coord = coordb;
            }
            else {
                extra.fromA = true;
                extra.fromB = true;
                extra.coord = coorda;
            }
        }
    } else {

        if (coorda !== inv)
        {
            extra.fromA = true;
            extra.fromB = false;
            extra.coord = coorda;
        }
        else
        {
            if (coordb !== inv)
            {
                extra.fromA = false;
                extra.fromB = true;
                extra.coord = coordb;
            }
            else
            {
                extra.fromA = false;
                extra.fromB = false;
            }
        }
    }

    //console.log("fromA " + extra.fromA + " fromB " + extra.fromB + "  coord " + extra.coord);
};

EVM.prototype.improve = function (B, op, plv, sA, sB, C, sCprev, sCcurr, extra) {
    switch (op) {
        case 0: //Collision
        case 1: //Interseccion
            if (!extra.fromA || !extra.fromB) {
                if (extra.fromA) {   //fromA = this.v
                    while (extra.ia < this.NEV && !extra.fromB) {
                        plv = this.readPlv(true ,extra);
                        sA = sA.getSection(plv);
                        this.nextObject(B, extra);
                    }
                } else {    //fromB = this.v
                    while (extra.ib < B.NEV && !extra.fromA) {
                        plv = B.readPlv(false ,extra);
                        sB = sB.getSection(plv);
                        this.nextObject(B, extra);
                    }
                }
            }
            break;
        case 2: // MergeXor
            // Optimize preprocess for MergeXor
            break;
        case 3: // Difference
            // Optimize preprocess for Difference
            if (extra.fromA)
            {
                while (extra.ia < this.NEV && !extra.fromB)
                {
                    plv = this.readPlv(true ,extra);
                    sA = sA.getSection(plv);
                    sCprev = sCcurr;
                    sCcurr = sA;
                    C.putPlv(plv);
                    this.nextObject(B, extra);
                }
            }
            else
            {
                if (extra.fromB)
                {
                    while (extra.ib < B.NEV && !extra.fromA)
                    {
                        plv = B.readPlv(false,extra);
                        sB = sB.getSection(plv);
                        this.nextObject(B, extra);
                    }
                }
            }
            break;
        case 4: // Union
            // Optimize preprocess for Union
            if (extra.fromA)
            {
                while (extra.ia < this.NEV && !extra.fromB)
                {
                    plv = this.readPlv(true,extra);
                    sA = sA.getSection(plv);
                    sCprev = sCcurr;
                    sCcurr = sA;
                    C.putPlv(plv);
                    this.nextObject(B, extra);
                }
            }
            else
            {
                if (extra.fromB)
                {
                    while (extra.ib < B.NEV && !extra.fromA)
                    {
                        plv = B.readPlv(false,extra);
                        sB = sB.getSection(plv);
                        sCprev = sCcurr;
                        sCcurr = sB;
                        C.putPlv(plv);
                        this.nextObject(B, extra);
                    }
                }
            }
            break;
    }
};

//ia es el primer vertice para leer
// dim es la dimension: 3 or 2
//dim = 3: extraer un plano desde un objecto
//dim = 2: extraer una linea desde un plano
EVM.prototype.readPlv = function (esA, extra) {
    var plv = new EVM(1, 3);
    var fixedCoord;
    var valor;

    if (esA) {
        valor = extra.ia;
    } else {
        valor = extra.ib;
    }

    plv.ABC = this.ABC;
    switch (this.dim) {
        case Dimension.D3:
            plv.dim = Dimension.D2;
            switch (this.ABC) {
                case EVM_Order.XYZ:
                case EVM_Order.XZY:
                    fixedCoord = this.v[valor].X;
                    while (valor < this.NEV && this.v[valor].X === fixedCoord) {
                        plv.putExtremeVertex(this.v[valor]);
                        valor++;
                    }
                    break;

                case EVM_Order.YXZ:
                case EVM_Order.YZX:
                    fixedCoord = this.v[valor].Y;
                    while (valor < this.NEV && this.v[valor].Y === fixedCoord) {
                        plv.putExtremeVertex(this.v[valor]);
                        valor++;
                    }
                    break;

                case EVM_Order.ZXY:
                case EVM_Order.ZYX:
                    fixedCoord = this.v[valor].Z;
                    while (valor < this.NEV && this.v[valor].Z === fixedCoord) {
                        plv.putExtremeVertex(this.v[valor]);
                        valor++;
                    }
                    break;
            }
            break;

        case Dimension.D2:
            plv.dim = Dimension.D1;
            switch (this.ABC)
            {
                case EVM_Order.YXZ:
                case EVM_Order.ZXY:
                    fixedCoord = this.v[valor].X;
                    while (valor < this.NEV && this.v[valor].X === fixedCoord)
                    {
                        plv.putExtremeVertex(this.v[valor]);
                        valor++;
                    }
                    break;
                case EVM_Order.XYZ:
                case EVM_Order.ZYX:
                    fixedCoord = this.v[valor].Y;
                    while (valor < this.NEV && this.v[valor].Y === fixedCoord)
                    {
                        plv.putExtremeVertex(this.v[valor]);
                        valor++;
                    }
                    break;
                case EVM_Order.XZY:
                case EVM_Order.YZX:
                    fixedCoord = this.v[valor].Z;
                    while (valor < this.NEV && this.v[valor].Z === fixedCoord)
                    {
                        plv.putExtremeVertex(this.v[valor]);
                        valor++;
                    }
                    break;
            }
            break;
    }

    if (esA) {
        extra.ia = valor;
    } else {
        extra.ib = valor;
    }

    return (plv);
};

EVM.prototype.getPlv = function (S_i)
{
    var plv_i = new EVM(this.ABC, this.dim);
    if (this.dim === Dimension.D2)
    {
        plv_i = this.mergeXOR2D(S_i);
    }
    else
    {
        plv_i = this.mergeXOR1D(S_i);
    }
    return(plv_i);
};

EVM.prototype.getSection = function (plv_i) {
    var S_i = new EVM(this.ABC, this.dim);
    if (this.dim === Dimension.D2) {
        S_i = this.mergeXOR2D(plv_i);
    } else {
        S_i = this.mergeXOR1D(plv_i);
    }
    return (S_i);
};

EVM.prototype.mergeXOR1D = function (B)
{
    var C = new EVM(B.ABC, this.dim);
    var ia = 0, ib = 0, aob;
    var aOrd = this.ABC;

    // A, B and C share order
    if (this.ABC !== B.ABC)
        this.order(B.ABC);

    while (ia < this.NEV && ib < B.NEV)
    {
        switch (this.ABC)
        {
            case EVM_Order.XYZ:
            case EVM_Order.YXZ:
                if (this.v[ia].Z < B.v[ib].Z)
                {
                    aob = 1;
                }
                else
                {
                    if (this.v[ia].Z > B.v[ib].Z)
                        aob = 2;
                    else
                        aob = 3;
                }
                break;
            case EVM_Order.XZY:
            case EVM_Order.ZXY:
                if (this.v[ia].Y < B.v[ib].Y)
                {
                    aob = 1;
                }
                else
                {
                    if (this.v[ia].Y > B.v[ib].Y)
                        aob = 2;
                    else
                        aob = 3;
                }
                break;
            case EVM_Order.YZX:
            case EVM_Order.ZYX:
                if (this.v[ia].X < B.v[ib].X)
                {
                    aob = 1;
                }
                else
                {
                    if (this.v[ia].X > B.v[ib].X)
                        aob = 2;
                    else
                        aob = 3;
                }
                break;
        }
        switch (aob)
        {
            case 1:
                C.putExtremeVertex(this.v[ia]);
                ia++;
                break;
            case 2:
                C.putExtremeVertex(B.v[ib]);
                ib++;
                break;
            case 3:
                ia++;
                ib++;
                break;
        }
    }
    while (ia < this.NEV)
    {
        C.putExtremeVertex(this.v[ia]);
        ia++;
    }
    while (ib < B.NEV)
    {
        C.putExtremeVertex(B.v[ib]);
        ib++;
    }

    // Return A to its original order
    if (this.ABC !== aOrd)
        this.order(aOrd);

    return(C);
};

EVM.prototype.mergeXOR2D = function (B) {
    var C = new EVM(B.ABC, this.dim);
    var ia = 0, ib = 0, aob;
    var aOrd = this.ABC;

    if (this.ABC !== B.ABC)
        this.order(B.ABC);

    while (ia < this.NEV && ib < B.NEV)
    {
        switch (this.ABC)
        {
            case EVM_Order.XYZ:
                if (this.v[ia].Y < B.v[ib].Y)
                    aob = 1;
                else
                {
                    if (this.v[ia].Y > B.v[ib].Y)
                        aob = 2;
                    else
                    {
                        if (this.v[ia].Z === B.v[ib].Z)
                            aob = 3;
                        else
                            aob = 4;
                    }
                }
                break;
            case EVM_Order.XZY:
                if (this.v[ia].Z < B.v[ib].Z)
                    aob = 1;
                else
                {
                    if (this.v[ia].Z > B.v[ib].Z)
                        aob = 2;
                    else
                    {
                        if (this.v[ia].Y === B.v[ib].Y)
                            aob = 3;
                        else
                            aob = 4;
                    }
                }
                break;
            case EVM_Order.YXZ:
                if (this.v[ia].X < B.v[ib].X)
                    aob = 1;
                else
                {
                    if (this.v[ia].X > B.v[ib].X)
                        aob = 2;
                    else
                    {
                        if (this.v[ia].Z === B.v[ib].Z)
                            aob = 3;
                        else
                            aob = 4;
                    }
                }
                break;
            case EVM_Order.YZX:
                if (this.v[ia].Z < B.v[ib].Z)
                    aob = 1;
                else
                {
                    if (this.v[ia].Z > B.v[ib].Z)
                        aob = 2;
                    else
                    {
                        if (this.v[ia].X === B.v[ib].X)
                            aob = 3;
                        else
                            aob = 4;
                    }
                }
                break;
            case EVM_Order.ZXY: // ZXY
                if (this.v[ia].X < B.v[ib].X)
                    aob = 1;
                else
                {
                    if (v[ia].X > B.v[ib].X)
                        aob = 2;
                    else
                    {
                        if (v[ia].Y === B.v[ib].Y)
                            aob = 3;
                        else
                            aob = 4;
                    }
                }
                break;
            case EVM_Order.ZYX: // ZYX
                if (v[ia].Y < B.v[ib].Y)
                    aob = 1;
                else
                {
                    if (v[ia].Y > B.v[ib].Y)
                        aob = 2;
                    else
                    {
                        if (v[ia].X === B.v[ib].X)
                            aob = 3;
                        else
                            aob = 4;
                    }
                }
                break;
        }
        switch (aob)
        {
            case 1:
                C.putExtremeVertex(this.v[ia]);
                ia++;
                break;
            case 2:
                C.putExtremeVertex(B.v[ib]);
                ib++;
                break;
            case 3:
                ia++;
                ib++;
                break;
            case 4:
                switch (this.ABC)
                {
                    case EVM_Order.YZX:
                    case EVM_Order.ZYX:
                        if (this.v[ia].X < B.v[ib].X)
                        {
                            C.putExtremeVertex(this.v[ia]);
                            ia++;
                        }
                        else
                        {
                            C.putExtremeVertex(B.v[ib]);
                            ib++;
                        }
                        break;
                    case EVM_Order.XZY:
                    case EVM_Order.ZXY:
                        if (this.v[ia].Y < B.v[ib].Y)
                        {
                            C.putExtremeVertex(this.v[ia]);
                            ia++;
                        }
                        else
                        {
                            C.putExtremeVertex(B.v[ib]);
                            ib++;
                        }
                        break;
                    case EVM_Order.XYZ:
                    case EVM_Order.YXZ:
                        if (this.v[ia].Z < B.v[ib].Z)
                        {
                            C.putExtremeVertex(this.v[ia]);
                            ia++;
                        }
                        else
                        {
                            C.putExtremeVertex(B.v[ib]);
                            ib++;
                        }
                        break;
                }
                break;
        }
    }
    while (ia < this.NEV)
    {
        C.putExtremeVertex(this.v[ia]);
        ia++;
    }
    while (ib < B.NEV)
    {
        C.putExtremeVertex(B.v[ib]);
        ib++;
    }

    // Return A to its original order
    if (this.ABC !== aOrd)
        order(aOrd);

    return(C);
};

EVM.prototype.setCoordinate = function (coord) {
    var i;
    switch (this.dim) {
        case Dimension.D2:
            switch (this.ABC) {
                case EVM_Order.XYZ:
                case EVM_Order.XZY:
                    for (i = 0; i < this.NEV; i++) {
                        this.v[i].X = coord;
                    }
                    break;

                case EVM_Order.YXZ:
                case EVM_Order.YZX:
                    for (i = 0; i < this.NEV; i++) {
                        this.v[i].Y = coord;
                    }
                    break;

                case EVM_Order.ZXY:
                case EVM_Order.ZYX:
                    for (i = 0; i < this.NEV; i++) {
                        this.v[i].Z = coord;
                    }
                    break;
            }
            break;

        case Dimension.D1:
            switch (this.ABC)
            {
                case EVM_Order.YXZ:
                case EVM_Order.ZXY:
                    for (i = 0; i < this.NEV; i++)
                        this.v[i].X = coord;
                    break;
                case EVM_Order.XYZ:
                case EVM_Order.ZYX:
                    for (i = 0; i < this.NEV; i++)
                        this.v[i].Y = coord;
                    break;
                case EVM_Order.XZY:
                case EVM_Order.YZX:
                    for (i = 0; i < this.NEV; i++)
                        this.v[i].Z = coord;
                    break;
            }
            break;
    }
};

EVM.prototype.putPlv = function (plv) {
    for (var i = 0; i < plv.NEV; i++) {
        this.putExtremeVertex(plv.v[i]);
    }
};

// tipo
// 1 = Intersection
// 2 = MergeXOR
// 3 = Difference
// 4 = Union

var fromA;
var fromB;
var coord;
var ia;
var ib;

function objExtra() {
    this.fromA = null;
    this.fromB = null;
    this.coord = null;
    this.ia = null;
    this.ib = null;
}

EVM.prototype.operation = function (B, op)
{
    var C = new EVM(B.ABC, this.dim);
    var sA = new EVM(B.ABC, Dimension.D2);
    var sB = new EVM(B.ABC, Dimension.D2);
    var sCcurr = new EVM(B.ABC, Dimension.D2);
    var sCprev = new EVM(B.ABC, Dimension.D2);
    var plv = new EVM(B.ABC, Dimension.D2);
    var aOrd = this.ABC;
    var extra = new objExtra();

    // A, B and C share order
    if (this.ABC !== B.ABC){
        this.order(B.ABC);
    }

    if (this.dim === Dimension.D1)
    {
        switch (op)
        {
            case 1:
                C = this.intersection1D(B);
                break;
            case 2:
                C = this.mergeXOR1D(B);
                break;
            case 3:
                C = this.difference1D(B);
                break;
            case 4:
                C = this.union1D(B);
                break;
        }
    }
    else
    {
        if (this.dim === Dimension.D2)
        {
            sA.dim = Dimension.D1;
            sB.dim = Dimension.D1;
            sCcurr.dim = Dimension.D1;
            sCprev.dim = Dimension.D1;
            plv.dim = Dimension.D1;
        }
        extra.ia = 0;
        extra.ib = 0;
        this.nextObject(B, extra);
        this.improve(B, op, plv, sA, sB, C, sCprev, sCcurr, extra);

        while (extra.ia < this.NEV && extra.ib < B.NEV)
        {
            if (extra.fromA)
            {
                plv = new EVMCopy(this.readPlv(true, extra));
                sA = new EVMCopy(sA.getSection(plv));
            }
            if (extra.fromB)
            {
                plv = new EVMCopy(B.readPlv(false, extra));
                sB = new EVMCopy(sB.getSection(plv));
            }
            sCprev = sCcurr;

            if (op !== 2) {
                sCcurr = new EVMCopy(sA.operation(sB, op));
            } // Recursive call
            else // mergeXor
            {
                if (this.dim === Dimension.D3)
                    sCcurr = new EVMCopy(sA.mergeXOR2D(sB));
                else
                    sCcurr = new EVMCopy(sA.mergeXOR1D(sB));
            }

            plv = new EVMCopy(sCprev.getPlv(sCcurr));
            plv.setCoordinate(extra.coord);
            C.putPlv(plv);

            this.nextObject(B, extra);
        }

        switch (op)
        {
            case 3:
                while (extra.ia < this.NEV)
                {
                    plv = new EVMCopy(this.readPlv(true, extra));
                    C.putPlv(plv);
                }
                break;
            case 2:
            case 4:
                while (extra.ia < this.NEV)
                {
                    plv = new EVMCopy(this.readPlv(true, extra));
                    C.putPlv(plv);
                }
                while (extra.ib < B.NEV)
                {
                    plv = new EVMCopy(B.readPlv(false, extra));
                    C.putPlv(plv);
                }
                break;
        }
    }

    // Return A to its original order
    if (this.ABC !== aOrd)
        this.order(aOrd);

    return(C);
};


// Deteccion de colision entre EVMs
EVM.prototype.collide = function (B)
{
    var C = new EVM(B.ABC, this.dim);
    C = this.collision(B);
    return(C.NEV !== 0);
};

// Retorna la union entre EVMs
EVM.prototype.unite = function (B)
{
    if (this.dim === B.dim) {
        return(this.operation(B, 4));
    }
    else {
        console.log("Error: The dimensions of A and B do not match.");
        var C = new EVM(this.ABC, this.dim);
        return(C);
    }
};

// Retorna la interseccion entre EVMs 3D
EVM.prototype.intersection = function (B)
{
    if (this.dim === B.dim) {
        return(this.operation(B, 1));
    }
    else {
        console.log("Error: The dimensions of A and B do not match.");
        var C = new EVM(this.ABC, this.dim);
        return(C);
    }
};

// Returns difference between 3D EVMs
EVM.prototype.difference = function (B)
{
    if (this.dim === B.dim) {
        return(this.operation(B, 3));
    }
    else {
        console.log("Error: The dimensions of A and B do not match.");
        var C = new EVM(this.ABC, this.dim);
        return(C);
    }
};

// Translada todos los vertices de un EVM
// Entrada:
//   - tx: translacion en x
//   - ty: translacion en y
//   - tz: translacion en z
EVM.prototype.translate = function (tx, ty, tz)
{
    var i;
    for (i = 0; i < this.NEV; i++){
        this.v[i].translate(tx, ty, tz);
    }
};

// Agrega un vector de bordes para pares de EVM que representan un borde
EVM.prototype.addEdges = function (edges, dir)
{
    var i;
    var pA = new Point3D(0, 0, 0);
    var pB = new Point3D(0, 0, 0);
    var line = new Line3D(pA, pB);
    if (dir)
    {
        i = 0;
        while (i < this.NEV)
        {
            line.P1 = this.v[i];
            line.P2 = this.v[i + 1];
            edges.push(line);
            i = i + 2;
        }
    }
    else
    {
        i = this.NEV - 1;
        while (i >= 0)
        {
            line.P1 = this.v[i];
            line.P2 = this.v[i - 1];
            edges.push(line);
            i = i - 2;
        }
    }
};

// Order as a face the vector of edges
EVM.prototype.orderEdges = function (edges)
{
    var i, j, dira, dirb, band, ini;
    var aux = new Line3Dnull();

    ini = 0; // First edge of face
    i = ini;
    while (i < edges.length)
    {
        // Direction of A edge
        if (edges[i].P1.X !== edges[i].P2.X)
            dira = 1;
        else
            if (edges[i].P1.Y !== edges[i].P2.Y)
                dira = 2;
        else
            dira = 3;

        j = i + 1;
        band = 0;
        while (!band && j < edges.length)
        {
            // Direction of B edge
            if (edges[j].P1.X !== edges[j].P2.X)
                dirb = 1;
            else
                if (edges[j].P1.Y !== edges[j].P2.Y)
                    dirb = 2;
            else
                dirb = 3;

            // Must change direction and P2 of edge i is equal to P1 of edge j
            //
            //    Edge i       Edge j
            // P1 ------ P2 P1 ------ P2
            if ((dira !== dirb) && (edges[i].P2 === edges[j].P1))
            {
                band = 1;
                if (j !== i + 1)
                {
                    // Swap
                    aux = edges[i + 1];
                    edges[i + 1] = edges[j];
                    edges[j] = aux;
                }

                // Last edge to form face
                // P2 of edge i+1 is equal to P1 of edge ini (first edge of face)
                // Edge i+1    Edge ini
                // P1 ----- P2 P1 ----- P2
                if (edges[i + 1].P2 === edges[ini].P1)
                {
                    i++;
                    ini = i + 1;
                }
            }
            j++;
        }
        i++;
    }
};

// Convert a concave 2D EVM face in a set of convex 2D EVM faces
EVM.prototype.tesselateFace = function ()
{
    var tfaces = new Array();
    var tface = new EVM(this.ABC, Dimension.D2);
    var plv = new EVM(this.ABC, Dimension.D1);
    var Si = new EVM(this.ABC, Dimension.D1);
    var Sj = new EVM(this.ABC, Dimension.D1);
    var Sjc = new EVM(this.ABC, Dimension.D1);
    var i, j, k;
    var point = new Point3D(0, 0, 0);
    var fixed1, fixed2;

    if (this.dim === Dimension.D2)
    {
        i = 0;
        while (i < this.NEV)
        {
            switch (this.ABC)
            {
                case EVM_Order.YXZ:
                case EVM_Order.ZXY:
                    fixed1 = this.v[i].X;
                    plv = this.readPlv(i);
                    fixed2 = this.v[i].X;
                    break;
                case EVM_Order.XYZ:
                case EVM_Order.ZYX:
                    fixed1 = this.v[i].Y;
                    plv = this.readPlv(i);
                    fixed2 = this.v[i].Y;
                    break;
                case EVM_Order.XZY:
                case EVM_Order.YZX:
                    fixed1 = this.v[i].Z;
                    plv = this.readPlv(i);
                    fixed2 = this.v[i].Z;
                    break;
            }

            Sj = Si.getSection(plv);

            if (Sj.NEV !== 0) // The section is not empty
            {
                Sj.setCoordinate(fixed1);
                Sjc = Sj;
                Sjc.setCoordinate(fixed2);

                j = 0;
                while (j < Sj.NEV)
                {
                    tface.putExtremeVertex(Sj.v[j]);    // Point a
                    tface.putExtremeVertex(Sj.v[j + 1]);  // Point d
                    tface.putExtremeVertex(Sjc.v[j]);   // Point b
                    tface.putExtremeVertex(Sjc.v[j + 1]); // Point c

                    tfaces.push(tface);
                    tface = new EVM(this.ABC, Dimension.D2);
                    j = j + 2;
                }
                Si = Sjc;
            }
        }
    }
    else
        console.log("Error: Can't tesselate 1D or 3D EVMs.");
    return(tfaces);
};

// Static
// From a vector of faces (vector of edges that form faces) insert faces in obj
// tess: 0 = no tess, 1 = triangles, 2 = squares
EVM.prototype.insertFacesInObject = function (obj, faces, dir, tess)
{
    // If   faces is 1-2, 2-3, 3-4, 4-1, 5-6, 6-7, 7-8, 8-5:
    // 
    //  4---3   8---7
    //  |   |   |   |
    //  1---2   5---6
    //
    // then face  is 1 2 3 4 first and 5 6 7 8 second.
    //
    // If there's a face with > 4 points, there's a tesselation process:
    //
    //                  4--3
    //    4--3          |  |
    //    |  |          5--2'
    // 6--5  |  -->  6-----2'
    // |     |       |     |
    // 1-----2       1-----2
    //
    var i, j, ini;
    var face = new EVM(EVM_Order.XYZ, Dimension.D2);
    var tfaces = new Array();
    var edges = new Array();
    var objFaceEdges = new Array();
    var objFace = new Array();
    var ACB;
    var evPerFace = 4;

    if (tess === 1)
        evPerFace = 3;

    ini = 0;
    i = 0;
    while (i < faces.length)
    {
        // Extract Face
        do
        {
            face.putExtremeVertex(faces[i].P1);
            i++;
        } while (faces[i - 1].P2 !== faces[ini].P1);
        ini = i;

        // Verify number of vertices on face
        if (evPerFace > 0 && face.NEV > evPerFace) // Need tesselation
        {
            // Verify order and act accordingly
            if (face.v[0].X === face.v[1].X && face.v[1].X === face.v[2].X)
            {
                face.order(EVM_Order.XYZ);     // Plane in X
                ACB = EVM_Order.XZY;
            }
            else
            {
                if (face.v[0].Y === face.v[1].Y && face.v[1].Y === face.v[2].Y)
                {
                    face.order(EVM_Order.YZX); // Plane in Y
                    ACB = EVM_Order.YXZ;
                }
                else
                {
                    face.order(EVM_Order.ZXY); // Plane in Z
                    ACB = EVM_Order.ZYX;
                }
            }
            // Obtain set of EVM faces and insert in obj
            tfaces = face.tesselateFace();
            for (j = 0; j < tfaces.length; j++)
            {
                // Detect direction (Calculate objFace vector of lines)
                edges = tfaces[j].computeEdges1D(dir);
                objFaceEdges.splice(objFaceEdges.length, 0, edges);
                tfaces[j].order(ACB);
                edges = tfaces[j].computeEdges1D(!dir);
                objFaceEdges.splice(objFaceEdges.length, 0, edges);
                this.orderEdges(objFaceEdges);
                // Insert in order
                if (tess === 1)
                {
                    // Obtain and insert objFace (Triangle 1) in obj
                    objFace.push(objFaceEdges[0].P1);
                    objFace.push(objFaceEdges[1].P1);
                    objFace.push(objFaceEdges[2].P1);
                    obj.face(objFace);
                    objFace.splice(0);
                    // Obtain and insert objFace (Triangle 2) in obj
                    objFace.push(objFaceEdges[0].P1);
                    objFace.push(objFaceEdges[2].P1);
                    objFace.push(objFaceEdges[3].P1);
                    obj.face(objFace);
                }
                else
                {
                    // Obtain and insert objFace in obj
                    objFace.push(objFaceEdges[0].P1);
                    objFace.push(objFaceEdges[1].P1);
                    objFace.push(objFaceEdges[2].P1);
                    objFace.push(objFaceEdges[3].P1);
                    obj.face(objFace);
                }
                // Erase
                objFaceEdges.splice(0);
                objFace.splice(0);
            }
        }
        else
        {
            obj.nuevaCara(face.v);
        }
        face = new EVM(EVM_Order.XYZ, Dimension.D2);
    }
};

// Compute the vector of edges with their directions to form faces
EVM.prototype.computeEdges1D = function (dir)
{
    var edges = new Array();
    var Si = new EVM(this.ABC, Dimension.D1);
    var Sj = new EVM(this.ABC, Dimension.D1);
    var plv = new EVM(this.ABC, Dimension.D1);
    var FD = new EVM(this.ABC, Dimension.D1);
    var BD = new EVM(this.ABC, Dimension.D1);
    var fixedCoord;
    ib = 0;
    while (ib < this.NEV)
    {
        switch (this.ABC)
        {
            case EVM_Order.YXZ:
            case EVM_Order.ZXY:
                fixedCoord = this.v[ib].X;
                break;
            case EVM_Order.XYZ:
            case EVM_Order.ZYX:
                fixedCoord = this.v[ib].Y;
                break;
            case EVM_Order.XZY:
            case EVM_Order.YZX:
                fixedCoord = this.v[ib].Z;
                break;
        }
        // dim = 2 is the actual dimension of the EVM to process
        // readPlv will read a 1D-plv from the 2D-EVM where B is fixed
        plv = this.readPlv(false);
        Sj = Si.mergeXOR1D(plv);
        // dim = 1 is the dimension of Sj
        // setCoordinate will set B as fixedCoord
        //Si.setCoordinate(fixedCoord, 1);
        Sj.setCoordinate(fixedCoord);

        FD = Si.difference1D(Sj);
        BD = Sj.difference1D(Si);

        FD.setCoordinate(fixedCoord);
        BD.setCoordinate(fixedCoord);

        // Aqui hay que agregar los edges en la dirección correcta
        FD.addEdges(edges, dir);
        BD.addEdges(edges, !dir);
        // --------

        Si = Sj;
    }
    return(edges);
};


// Compute the faces of an obj pointing to direction dir from an EVM
// tess: 0 = no tess, 1 = triangles, 2 = squares
EVM.prototype.computeFaces2D = function (obj, dir, tess)
{
    var Si = new EVM(this.ABC, Dimension.D2);
    var Sj = new EVM(this.ABC, Dimension.D2);
    var plv = new EVM(this.ABC, Dimension.D2);
    var FD = new EVM(this.ABC, Dimension.D2);
    var BD = new EVM(this.ABC, Dimension.D2);
    var fixedCoord;
    var ACB;
    var edges = new Array();
    var facesFD = new Array();
    var facesBD = new Array();// 
    // Ordered Faces

    switch (this.ABC)
    {
        case EVM_Order.XYZ:
            ACB = EVM_Order.XZY;
            break;
        case EVM_Order.XZY:
            ACB = EVM_Order.XYZ;
            break;
        case EVM_Order.YXZ:
            ACB = EVM_Order.YZX;
            break;
        case EVM_Order.YZX:
            ACB = EVM_Order.YXZ;
            break;
        case EVM_Order.ZXY:
            ACB = EVM_Order.ZYX;
            break;
        case EVM_Order.ZYX:
            ACB = EVM_Order.ZXY;
            break;
    }

    ib = 0;

    while (ib < this.NEV)
    {
        switch (this.ABC)
        {
            case EVM_Order.XYZ:
            case EVM_Order.XZY:
                fixedCoord = this.v[ib].X;
                break;
            case EVM_Order.YXZ:
            case EVM_Order.YZX:
                fixedCoord = this.v[ib].Y;
                break;
            case EVM_Order.ZXY:
            case EVM_Order.ZYX:
                fixedCoord = this.v[ib].Z;
                break;
        }
        // Read plv
        plv = this.readPlv(false);
        Sj = Si.mergeXOR2D(plv);
        Si.setCoordinate(fixedCoord);
        Sj.setCoordinate(fixedCoord);

        FD = Si.difference(Sj);
        BD = Sj.difference(Si);
        FD.setCoordinate(fixedCoord);
        BD.setCoordinate(fixedCoord);

        if (FD.NEV > 0)
        {
            // Already in ABC order
            edges = FD.computeEdges1D(dir);
            for (var i = 0; i < edges.length; i++)
                facesFD.push(edges[i]);

            FD.order(ACB);
            edges = FD.computeEdges1D(!dir);
            for (var i = 0; i < edges.length; i++)
                facesFD.push(edges[i]);
            this.orderEdges(facesFD);
            this.insertFacesInObject(obj, facesFD, dir, tess);
        }
        if (BD.NEV > 0)
        {
            // Already in ABC order
            edges = BD.computeEdges1D(!dir);
            for (var i = 0; i < edges.length; i++)
                facesBD.push(edges[i]);
            BD.order(ACB);
            edges = BD.computeEdges1D(dir);
            for (var i = 0; i < edges.length; i++)
                facesBD.push(edges[i]);
            this.orderEdges(facesBD);
            this.insertFacesInObject(obj, facesBD, !dir, tess);
        }
        facesFD.splice(0);
        facesBD.splice(0);

        Si = Sj;
    }
};

EVM.prototype.getObject = function (tess)
{
    var dir = true;
    var obj = new Object(1, 1, 0);
    var ord = this.ABC; // Original order on EVM

    this.order(EVM_Order.XYZ);
    this.computeFaces2D(obj, dir, tess);
    this.order(EVM_Order.YZX);
    this.computeFaces2D(obj, dir, tess);
    this.order(EVM_Order.ZXY);
    this.computeFaces2D(obj, dir, tess);

    this.order(ord);          // Return EVM to original order

    return(obj);
};

EVM.prototype.getObjectSlice = function (tess, fixed)
{
    var dir = true;
    var obj;
    var ord = this.ABC; // Original order on EVM

    switch (fixed)
    {
        case 'x':
        case 'X':
            this.order(EVM_Order.XYZ);
            this.computeFaces2D(obj, dir, tess);
            break;
        case 'y':
        case 'Y':
            this.order(EVM_Order.YZX);
            this.computeFaces2D(obj, dir, tess);
            break;
        case 'z':
        case 'Z':
            this.order(EVM_Order.ZXY);
            this.computeFaces2D(obj, dir, tess);
            break;
        default:
            this.order(EVM_Order.XYZ);
            this.computeFaces2D(obj, dir, tess);
    }

    this.order(ord);          // Return EVM to original order

    return(obj);
};

EVM.prototype.minPoint = function ()
{
    var i;
    var p = new Point3D(0, 0, 0);
    for (i = 0; i < this.NEV; i++)
    {
        if (this.v[i].X < p.X || (this.v[i].X === p.X && (this.v[i].Y < p.Y || (this.v[i].Y === p.Y && this.v[i].Z < p.Z))))
            p = this.v[i];
    }
    return(p);
};

EVM.prototype.maxPoint = function ()
{
    var i;
    var p = new Point3D(0, 0, 0);
    for (i = 0; i < this.NEV; i++)
    {
        if (this.v[i].X > p.X || (this.v[i].X === p.X && (this.v[i].Y > p.Y || (this.v[i].Y === p.Y && this.v[i].Z > p.Z))))
            p = this.v[i];
    }
    return(p);
};
