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
var dim;    //Dimensi�n del EVM

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

function EVMCopy(e) {
    var nuevoEVM = new EVM(e.ABC, e.dim);
    nuevoEVM.NEV = e.NEV;
    nuevoEVM.v = e.v;
    return nuevoEVM;
}

function EVMFile(filename) {
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
        this.EVMFileOutput = new EVMWithExVert(exVert, ord, d);

        /***********PRUEBA CON ARCHIVOS********************/
        var B = new EVMCopy(this.EVMFileOutput);
        var Cresult = this.EVMFileOutput.collision(B);
    };
    lector.readAsText(filename[0]);

}

//M�todos
EVM.prototype.putExtremeVertex = function (p) {
    this.v.push(p);
    this.NEV++;
};

EVM.prototype.order = function (ord) {
    this.ABC = ord;
    switch (ord) {
        case EVM_Order.XYZ:
            this.v.sort(function (a, b) {
                return(a.X < b.X || (a.X === b.X && (a.Y < b.Y || (a.Y === b.Y && a.Z < b.Z))));
            });
            break;

        case EVM_Order.XZY:
            this.v.sort(function (a, b) {
                return(a.X < b.X || (a.X === b.X && (a.Z < b.Z || (a.Z === b.Z && a.Y < b.Y))));
            });
            break;

        case EVM_Order.YXZ:
            this.v.sort(function (a, b) {
                return(a.Y < b.Y || (a.Y === b.Y && (a.X < b.X || (a.X === b.X && a.Z < b.Z))));
            });
            break;

        case EVM_Order.YZX:
            this.v.sort(function (a, b) {
                return(a.Y < b.Y || (a.Y === b.Y && (a.Z < b.Z || (a.Z === b.Z && a.X < b.X))));
            });
            break;

        case EVM_Order.ZXY:
            this.v.sort(function (a, b) {
                return(a.Z < b.Z || (a.Z === b.Z && (a.X < b.X || (a.X === b.X && a.Y < b.Y))));
            });
            break;

        case EVM_Order.ZYX:
            this.v.sort(function (a, b) {
                return(a.Z < b.Z || (a.Z === b.Z && (a.Y < b.Y || (a.Y === b.Y && a.X < b.X))));
            });
            break;
    }
};

//Colisi�n 1D
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

//Colisi�n
EVM.prototype.collision = function (B) {
    var C = new EVM(B.ABC, this.dim);
    var sA = new EVM(B.ABC, Dimension.D2);
    var sB = new EVM(B.ABC, Dimension.D2);
    var sCcurr = new EVM(B.ABC, Dimension.D2);
    var sCprev = new EVM(B.ABC, Dimension.D2);
    var plv = new EVM(B.ABC, Dimension.D2);
    fromA = false, fromB = false;
    coord = 0;
    var aOrd = this.ABC;

    if (this.ABC !== B.ABC)
        this.order(B.ABC);

    if (this.dim === 1) {
        console.log("ENTRO AQUI");
        C = this.collision1D(B);
    } else {
        if (this.dim === Dimension.D2) {
            sA.dim = Dimension.D1;
            sB.dim = Dimension.D1;
            sCcurr.dim = Dimension.D1;
            sCprev.dim = Dimension.D1;
            plv.dim = Dimension.D1;
        }
        ia = 0;
        ib = 0;
        this.nextObject(B, ia, ib);
        this.improve(B, 0, plv, sA, sB, C, sCprev, sCcurr);
        while (C.NEV === 0 && ia < this.NEV && ib < B.NEV) {
            console.log(C.NEV + " " + this.NEV + "   " + B.NEV);
            console.log(B);
            if (fromA) {
                plv = this.readPlv(true);
                sA = sA.getSection(plv);
            }
            if (fromB) {
                plv = B.readPlv(false);
                sB = sB.getSection(plv);
            }
            sCprev = sCcurr;
            console.log(sCcurr);
            sCcurr = sA.collision(sB);

            plv = sCprev.getPlv(sCcurr);
            plv.setCoordinate(coord);
            C.putPlv(plv);

            this.nextObject(B, ia, ib);
            console.log("PASO DE AQUI444");
        }
    }

    if (this.ABC !== aOrd)
        this.order(aOrd);

    return (C);
};

EVM.prototype.nextObject = function (B, ia, ib) {
    var inv = -1.7976931348623157e+308;
    var coorda = inv, coordb = inv;
    if (this.dim === Dimension.D3) {
        console.log(this.ABC);
        switch (this.ABC) {
            case EVM_Order.XYZ:
            case EVM_Order.XZY:
                if (this.NEV > 0 && ia < this.NEV)
                    coorda = this.v[ia].X;
                if (B.NEV > 0 && ib < B.NEV)
                    coordb = B.v[ib].X;
                break;

            case EVM_Order.YXZ:
            case EVM_Order.YZX:
                if (this.NEV > 0 && ia < this.NEV)
                    coorda = this.v[ia].Y;
                if (B.NEV > 0 && ib < B.NEV)
                    coordb = B.v[ib].Y;
                break;

            case EVM_Order.ZXY:
            case EVM_Order.ZYX:
                if (this.NEV > 0 && ia < this.NEV)
                    coorda = this.v[ia].Z;
                if (B.NEV > 0 && ib < B.NEV)
                    coordb = B.v[ib].Z;
                break;
        }
    }
    else {
        switch (this.ABC) {
            case EVM_Order.XYZ:
            case EVM_Order.ZXY:
                if (this.NEV > 0 && ia < this.NEV)
                    coorda = this.v[ia].Y;
                if (B.NEV > 0 && ib < B.NEV)
                    coordb = B.v[ib].Y;
                break;

            case EVM_Order.XZY:
            case EVM_Order.YZX:
                if (this.NEV > 0 && ia < this.NEV)
                    coorda = this.v[ia].Z;
                if (B.NEV > 0 && ib < B.NEV)
                    coordb = B.v[ib].Z;
                break;

            case EVM_Order.YXZ:
            case EVM_Order.ZXY:
                if (this.NEV > 0 && ia < this.NEV)
                    coorda = this.v[ia].X;
                if (B.NEV > 0 && ib < B.NEV)
                    coordb = B.v[ib].X;
                break;
        }
    }
    console.log("coorda  " + coorda + "coordb  " + coordb);
    if (coorda !== inv && coordb !== inv) {
        if (coorda < coordb) {
            fromA = true;
            fromB = false;
            coord = coorda;
        }
        else {
            if (coorda > coordb) {
                fromA = false;
                fromB = true;
                coord = coordb;
            }
            else {
                fromA = true;
                fromB = true;
                coord = coorda;
            }
        }
    } else {

        if (coorda !== inv)
        {

            fromA = true;
            fromB = false;
            coord = coorda;
        }
        else
        {
            if (coordb !== inv)
            {
                fromA = false;
                fromB = true;
                coord = coordb;
            }
            else
            {
                fromA = false;
                fromB = false;
            }
        }
    }
};

EVM.prototype.improve = function (B, op, plv, sA, sB, C, sCprev, sCcurr) {
    switch (op) {
        case 0: //Collisi�n
        case 1: //Intersecci�n
            if (!fromA || !fromB) {
                if (fromA) {   //fromA = this.v
                    while (ia < this.NEV && !fromB) {
                        plv = readPlv(true);
                        sA = sA.getSection(plv);
                        this.nextObject(B, ia, ib);
                    }
                } else {
                    while (ib < B.NEV && !fromA) {
                        plv = B.readPlv(false);
                        sB = sB.getSection(plv);
                        this.nextObject(B, ia, ib);
                    }
                }
            }
            break;
        case 2: // MergeXor
            // Optimize preprocess for MergeXor
            break;
        case 3: // Difference
            // Optimize preprocess for Difference
            if (fromA)
            {
                while (ia < this.NEV && !fromB)
                {
                    plv = this.readPlv(true);
                    sA = sA.getSection(plv);
                    sCprev = sCcurr;
                    sCcurr = sA;
                    //plv = sCprev.getPlv(sCcurr);
                    //plv.setCoordinate(coord);
                    C.putPlv(plv);
                    this.nextObject(B, ia, ib);
                }
            }
            else
            {
                if (fromB)
                {
                    while (ib < B.NEV && !fromA)
                    {
                        plv = B.readPlv(false);
                        sB = sB.getSection(plv);
                        this.nextObject(B, ia, ib);
                    }
                }
            }
            break;
        case 4: // Union
            // Optimize preprocess for Union
            if (fromA)
            {
                while (ia < this.NEV && !fromB)
                {
                    plv = readPlv(true);
                    sA = sA.getSection(plv);
                    sCprev = sCcurr;
                    sCcurr = sA;
                    C.putPlv(plv);
                    this.nextObject(B, ia, ib);
                }
            }
            else
            {
                if (fromB)
                {
                    while (ib < B.NEV && !fromA)
                    {
                        plv = B.readPlv(false);
                        sB = sB.getSection(plv);
                        sCprev = sCcurr;
                        sCcurr = sB;
                        C.putPlv(plv);
                        this.nextObject(B, ia, ib);
                    }
                }
            }
            break;
    }
};

//ia es el primer vertice para leer
// dim es la dimensi�n: 3 or 2
//dim = 3: extraer un plano desde un objecto
//dim = 2: extraer una linea desde un plano
EVM.prototype.readPlv = function (esA) {
    var plv = new EVM(this.ABC, Dimension.D3);
    var fixedCoord;
    var valor;

    if (esA) {
        valor = ia;
    } else {
        valor = ib;
    }

    plv.ABC = this.ABC;
    switch (dim) {
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
            switch (ABC)
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
        ia = valor;
    } else {
        ib = valor;
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










/******************************************************************************/
/******************************************************************************/
/******************************************************************************/
/******************Inicializacion de libreria WebGL****************************/

/**Inicializar WebGL en canvas**/
var gl;
function initGL(canvas) {
    try {
        gl = canvas.getContext("webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("No puede iniciarse webGL en este navegador");
    }
}

function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType === 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type === "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type === "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}


/**Inicializar Shaders que apuntan a los ID del HTML**/
var shaderProgram;
function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("No pueden iniciarse los shaders");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}

/**Actualiza las matrices uniforme de modelo-vista y proyeccion
 *          que estan en la GPU con la que se tiene en Javascript**/
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}


/**Inicializar los buffer a usar con sus respectivos vertices**/
var triangleVertexPositionBuffer;
var squareVertexPositionBuffer;
function initBuffers() {
    triangleVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    var vertices = [
        0.0, 1.0, 0.0,
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    triangleVertexPositionBuffer.itemSize = 3;
    triangleVertexPositionBuffer.numItems = 3;

    squareVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    vertices = [
        1.0, 1.0, 0.0,
        -1.0, 1.0, 0.0,
        1.0, -1.0, 0.0,
        -1.0, -1.0, 0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    squareVertexPositionBuffer.itemSize = 3;
    squareVertexPositionBuffer.numItems = 4;
}

/**Se encarga de realizar el renderizado de la escena 
 *                 en el lienzo**/
function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

    mat4.identity(mvMatrix);

    mat4.translate(mvMatrix, [-1.5, 0.0, -7.0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);


    mat4.translate(mvMatrix, [3.0, 0.0, 0.0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
}

/**FUNCION SOLO DE PRUEBAS**/

function pruebas() {

    var puntoA = new Point3D(4, 3, 5);
    var puntoB = new Point3D(1, 5, 7);
    var puntoC = new Point3D(1, -8, 4);
    var puntoD = new Point3D(3, 5, 2);
    var puntoE = new Point3D(10, 5, 1);
    var puntoF = new Point3D(9, 5, 1);
    var puntoG = new Point3D(8, 7, 6);

    var line = new Line3D(puntoA, puntoB);
    console.log("/**Imprimiendo line(PuntoA, PuntoB)**/");
    console.log(line.P1);
    console.log(line.P2);

    var line2 = new Line3Dcopy(line);
    console.log("/**Prueba de Line3Dcopy**/");
    console.log(line2.P1);
    console.log(line2.P2);


    var vector = new Vector3D(7, 8, 9);
    console.log("/**vector = Prueba de Vector3D 7,8,9**/");
    console.log(vector.P3D);

    var vectorB = new Vector3D(1, 2, 3);
    console.log("/**vectorB = Prueba de Vector3D 1,2,3**/");
    console.log(vectorB.P3D);

    var vectorOrigin = new Vector3Dorigin(puntoA);
    console.log("/**vector2 = Prueba de Vector3Dorigin pasandole puntoA(1,2,3)**/");
    console.log(vectorOrigin.P3D);

    var vectorHead = new Vector3Dhead(puntoA, puntoB);
    console.log("/**Prueba de Vector3Dhead pasandole puntoA y puntoB**/");
    console.log(vectorHead.P3D);

    console.log("/**Prueba de suma de vectores --> vector + vectorB --> (7,8,9) * (1,2,3)**/");
    var vectorSuma = vector.suma(vectorB);
    console.log(vectorSuma.P3D);

    console.log("/**Prueba de producto punto de vectores --> vector * vectorB --> (7,8,9) * (1,2,3)**/");
    console.log(vector.prodPunto(vectorB));

    var normaVector = vector.norma();
    console.log("/**Norma del vector --> sqrt(7*7 + 8*8 + 9*9)**/");
    console.log(normaVector);

    var vectorCruz = vector.prodCruz(vectorB);
    console.log("/**Prueba de producto cruz de vectores --> vector x vectorB --> (7,8,9) x (1,2,3)**/");
    vector.prodCruz(vectorB);
    console.log(vectorCruz.P3D);

    var vectorNormalizado = new Vector3D(7, 8, 9);
    vectorNormalizado.normalizar();
    console.log("/**Prueba normalizar vectores --> vector(7,8,9) **/");
    console.log(vectorNormalizado.P3D);

    console.log("/**Prueba de Line3D **/");
    var line1 = new Line3D(puntoA, puntoB);
    console.log(line1.P1);
    console.log(line1.P2);

    console.log("/**Prueba copia de Line3D **/");
    var line2 = Line3Dcopy(line1);
    console.log(line2.P1);
    console.log(line2.P2);

    if (line1.igual(line2)) {
        console.log("L1 es igual a L2");
    } else {
        console.log("L1 es distinto a L2");
    }

    var line1 = new Line3D(puntoC, puntoD);
    console.log("/**Prueba de interseccion entre lineas **/");
    console.log(line1.puntoInterseccion(line2));


    console.log("/**Prueba sobre planos3D **/");
    var plano1 = new Plane();
    var plano2 = new PlaneWithPoints3D(puntoA, puntoB, puntoC);
    var plano3 = new PlaneCopy(plano2);


    console.log("/**Sacando el vector normal de un plano --> plano2(puntoA, puntoB, puntoC) **/");
    console.log(plano2.normal().P3D);

    console.log("/**Comprobando si el punto esta en el plano **/");
    if (plano2.puntoEnPlano(puntoB)) {
        console.log("puntoB si esta en el plano");
    } else {
        console.log("puntoB no esta en el plano");
    }


    console.log("/**PRUEBAS DE OBJECT **/");
    console.log("/**Creando un nuevo Object **/");
    var object1 = new Object(8, 12, 12);
    var puntoAA = new Point3D(0, 0, 0);
    var puntoBB = new Point3D(0, 1, 0);
    var puntoCC = new Point3D(1, 0, 0);
    var puntoDD = new Point3D(1, 1, 0);
    var puntoEE = new Point3D(0, 0, 1);
    var puntoFF = new Point3D(0, 1, 1);
    var puntoGG = new Point3D(1, 0, 1);
    var puntoHH = new Point3D(1, 1, 1);

    var puntoJJ = new Point3D(2, 4, 5);
    var puntoKK = new Point3D(7, 3, 7);
    var puntoLL = new Point3D(9, 7, 6);
    var puntoMM = new Point3D(7, 5, 3);
    var puntoNN = new Point3D(7, 4, 4);
    var puntoOO = new Point3D(7, 4, 6);
    var puntoPP = new Point3D(8, 8, 3);
    var puntoQQ = new Point3D(5, 3, 2);


    var puntoII = new Point3D(2, 5, 9);

    object1.V[0] = puntoAA;
    object1.V[1] = puntoBB;
    object1.V[2] = puntoCC;
    object1.V[3] = puntoDD;
    object1.V[4] = puntoEE;
    object1.V[5] = puntoFF;
    object1.V[6] = puntoGG;
    object1.V[7] = puntoHH;


    object1.F[0][0] = 3;
    object1.F[0][1] = 0;
    object1.F[0][2] = 1;
    object1.F[0][3] = 3;

    object1.F[1][0] = 3;
    object1.F[1][1] = 0;
    object1.F[1][2] = 3;
    object1.F[1][3] = 2;

    object1.F[2][0] = 3;
    object1.F[2][1] = 4;
    object1.F[2][2] = 5;
    object1.F[2][3] = 0;

    object1.F[3][0] = 3;
    object1.F[3][1] = 4;
    object1.F[3][2] = 1;
    object1.F[3][3] = 0;

    object1.F[4][0] = 3;
    object1.F[4][1] = 1;
    object1.F[4][2] = 5;
    object1.F[4][3] = 7;

    object1.F[5][0] = 3;
    object1.F[5][1] = 1;
    object1.F[5][2] = 7;
    object1.F[5][3] = 3;

    object1.F[6][0] = 3;
    object1.F[6][1] = 2;
    object1.F[6][2] = 7;
    object1.F[6][3] = 6;

    object1.F[7][0] = 3;
    object1.F[7][1] = 2;
    object1.F[7][2] = 3;
    object1.F[7][3] = 7;

    object1.F[8][0] = 3;
    object1.F[8][1] = 0;
    object1.F[8][2] = 6;
    object1.F[8][3] = 4;

    object1.F[9][0] = 3;
    object1.F[9][1] = 0;
    object1.F[9][2] = 2;
    object1.F[9][3] = 6;

    object1.F[10][0] = 3;
    object1.F[10][1] = 4;
    object1.F[10][2] = 7;
    object1.F[10][3] = 5;

    object1.F[11][0] = 3;
    object1.F[11][1] = 4;
    object1.F[11][2] = 6;
    object1.F[11][3] = 7;


    var object2 = new Object(8, 12, 12);

    object2.V[0] = puntoJJ;
    object2.V[1] = puntoKK;
    object2.V[2] = puntoLL;
    object2.V[3] = puntoMM;
    object2.V[4] = puntoNN;
    object2.V[5] = puntoOO;
    object2.V[6] = puntoPP;
    object2.V[7] = puntoQQ;


    object2.F[0][0] = 3;
    object2.F[0][1] = 0;
    object2.F[0][2] = 3;
    object2.F[0][3] = 3;

    object2.F[1][0] = 3;
    object2.F[1][1] = 0;
    object2.F[1][2] = 2;
    object2.F[1][3] = 2;

    object2.F[2][0] = 3;
    object2.F[2][1] = 4;
    object2.F[2][2] = 1;
    object2.F[2][3] = 0;

    object2.F[3][0] = 3;
    object2.F[3][1] = 4;
    object2.F[3][2] = 1;
    object2.F[3][3] = 0;

    object2.F[4][0] = 3;
    object2.F[4][1] = 1;
    object2.F[4][2] = 5;
    object2.F[4][3] = 7;

    object2.F[5][0] = 3;
    object2.F[5][1] = 3;
    object2.F[5][2] = 7;
    object2.F[5][3] = 2;

    object2.F[6][0] = 3;
    object2.F[6][1] = 2;
    object2.F[6][2] = 1;
    object2.F[6][3] = 6;

    object2.F[7][0] = 3;
    object2.F[7][1] = 2;
    object2.F[7][2] = 3;
    object2.F[7][3] = 7;

    object2.F[8][0] = 3;
    object2.F[8][1] = 0;
    object2.F[8][2] = 2;
    object2.F[8][3] = 4;

    object2.F[9][0] = 3;
    object2.F[9][1] = 6;
    object2.F[9][2] = 2;
    object2.F[9][3] = 6;

    object2.F[10][0] = 3;
    object2.F[10][1] = 4;
    object2.F[10][2] = 7;
    object2.F[10][3] = 5;

    object2.F[11][0] = 3;
    object2.F[11][1] = 4;
    object2.F[11][2] = 2;
    object2.F[11][3] = 7;




    console.log(object1);

    console.log("/**Copiando object1 a object2 **/");
    var object3 = new ObjectCopy(object1);
    console.log(object3);


    console.log("/**Verificando si dos numeros tienen el mismo signo**/");
    if (object1.mismoSigno(1, -2)) {
        console.log("SI tienen el mismo signo");
    } else {
        console.log("NO tienen el mismo signo");
    }


    console.log("/**Probando calcularVectoreNormales( **/");
    object1.calcularVectoresNormales();
    console.log(object1.N[0]);
    console.log(object1.N[1]);
    console.log(object1.N[2]);
    console.log(object1.N[3]);
    console.log(object1.N[4]);
    console.log(object1.N[5]);
    console.log(object1.N[6]);
    console.log(object1.N[7]);
    console.log(object1.N[8]);
    console.log(object1.N[9]);
    console.log(object1.N[10]);
    console.log(object1.N[11]);



    console.log("/**Probando el calculo de las coordenadas baricentricas**/");

    object1.coordenadasBaricentricas(puntoA, puntoB, puntoC, puntoD);

    console.log(u + " " + v + " " + w);

    console.log("/**Verificando si el puntoA esta en el triangulo**/");
    if (object1.puntoEnTriangulo(puntoA, puntoC, puntoB, puntoA)) {
        console.log("El punto P SI esta en el triangulo");
    } else {
        console.log("El punto P NO esta en el triangulo");
    }

    console.log("/**Verificando si los triangulos colisionan**/");
    if (object1.trianguloEnTriangulo(puntoA, puntoB, puntoC, puntoE, puntoF, puntoG)) {
        console.log("SI colisionan");
    } else {
        console.log("NO colisionan");
    }

    console.log("Probando lectura de un objecto desde archivo");
    //var objectFile = new ObjectFile(this.file, false);

    console.log("Esta el vertice en el objecto?");
    var posicion = object1.estaVertice(puntoII);
    console.log(posicion);

    console.log("Insertando una nueva cara");
    var cara = new Array();
    cara[0] = puntoAA;
    cara[1] = puntoGG;
    cara[2] = puntoCC;

    object1.nuevaCara(cara);
    console.log(object1.F[12]);

    console.log("Probando rotacion");
//    object1.rotar(45, 'Z');
//    console.log(object1.V[1]);
    console.log("Probando translacion");
//    object1.transladar(45,45,45);
//    console.log(object1.V[1]);
    console.log("Probando escalado");
    object1.transladar(45, 45, 45);
//    console.log(object1.V[1]);
    console.log("Probando colision entre dos objectos");
    console.log(object2);
    if (object1.colision(object2)) {
        console.log("SI colisionan");
    } else {
        console.log("NO colisionan");
    }

    console.log("PRUEBAS DEL EVM");
    var evm1 = new EVM("XYZ", 3);
    console.log(evm1);

    console.log("EVM POR ARCHIVO");



}

/**Iniciar WebGL apuntando al canvas del HTML**/
function webGLStart() {
    var canvas = document.getElementById("leccion1-canvas");

    pruebas();

    initGL(canvas);
    initShaders();
    initBuffers();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    drawScene();
}

/******************************************************************************/


