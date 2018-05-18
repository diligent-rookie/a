(function flexible (window, document) {
    // 通过dpr设置缩放比，实现布局视口大小
    var scale = 1 / devicePixelRatio;
    document.querySelector('meta[name="viewport"]').setAttribute('content','initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no');

    var docEl = document.documentElement;
    var dpr = window.devicePixelRatio || 1;

    // adjust body font size(避免了使用media设置字体效果)
  // function setBodyFontSize () {
  //       if (document.body) {
  //           document.body.style.fontSize = (12 * dpr) + 'px';
  //       }
  //       else {
  //           document.addEventListener('DOMContentLoaded', setBodyFontSize);
  //       }
  //   }
  //   setBodyFontSize();
    // set 1rem=viewWidth / 10  设置了页面的htmlFontsize;
    function setRemUnit () {
        var rem = docEl.clientWidth / 10;
        docEl.style.fontSize = rem + 'px'
    }

    setRemUnit();

    // reset rem unit on page resize
    window.addEventListener('resize', setRemUnit);
    window.addEventListener('pageshow', function (e) {
        if (e.persisted) {
            setRemUnit();
        }
    })

    // detect 0.5px supports
    if (dpr >= 2) {
        var fakeBody = document.createElement('body');
        var testElement = document.createElement('div');
        testElement.style.border = '.5px solid transparent';
        fakeBody.appendChild(testElement);
        docEl.appendChild(fakeBody);
        if (testElement.offsetHeight === 1) {
            docEl.classList.add('hairlines');
        }
        docEl.removeChild(fakeBody);
    }
}(window, document));