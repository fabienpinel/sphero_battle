function fromEulerToXYZ(x, y, z, teta, phi, psi) {

    var xToReturn =
        (( (Math.cos(psi) * Math.cos(phi)) - (Math.sin(psi) * Math.cos(teta) * Math.sin(phi)) ) * x)
        + (( (Math.cos(psi) * Math.sin(phi)) + (Math.sin(psi) * Math.cos(teta) * Math.cos(phi)) ) * y)
        + (( Math.sin(psi) * Math.sin(teta) ) * z);

    var yToReturn =
        (( - (Math.sin(psi) * Math.cos(phi)) - (Math.cos(psi) * Math.cos(teta) * Math.sin(phi)) ) * x)
        + (( - (Math.sin(psi) * Math.sin(phi)) + (Math.cos(psi) * Math.cos(teta) * Math.cos(phi)) ) * y)
        + (( Math.cos(psi) * Math.sin(teta) ) * z);

    var zToReturn =
        ((Math.sin(teta) * Math.sin(phi)) * x)
        + (( - Math.sin(teta) * Math.cos(phi)) * y)
        + ( Math.cos(teta) * z);

    return {
        x: xToReturn,
        y: yToReturn,
        z: zToReturn
    }

}