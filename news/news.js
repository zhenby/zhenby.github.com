var ajaxObj = new XMLHttpRequest();
ajaxObj.open('get', 'http://nstool.netease.com');
ajaxObj.send();
ajaxObj.onreadystatechange = function () {
    if (ajaxObj.readyState == 4 && ajaxObj.status == 200) {
        document.querySelector('h5').innerHTML = ajaxObj.responseText;
    }
}
