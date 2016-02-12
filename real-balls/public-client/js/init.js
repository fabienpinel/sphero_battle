function fitHeight() {
    var divHeight = 0;
    var totalHeight = 0;
    var i;

    var toGetSize = document.getElementsByClassName('power');
    for(i = 0; i < toGetSize.length; i++) {
        divHeight = toGetSize[i].offsetHeight;
    }

    var toFitSize = document.getElementsByClassName('selectable');
    for(i = 0; i < toFitSize.length; i++) {
        toFitSize[i].style.height = divHeight + "px";
    }

    var calcBodyHeight = document.getElementsByTagName('body');
    for(i = 0; i < calcBodyHeight.length; i++) {
        totalHeight = calcBodyHeight[i].offsetHeight;
    }

    var calcHeadHeight = document.getElementById('head').offsetHeight;
    console.log(calcHeadHeight);
    var otherWillFit = totalHeight - calcHeadHeight;
    console.log(otherWillFit);

    var toFitSizeOther = document.getElementsByClassName('other');
    for(i = 0; i < toFitSizeOther.length; i++) {
        toFitSizeOther[i].style.height = otherWillFit +"px";
    }
}