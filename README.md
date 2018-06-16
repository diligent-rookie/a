## 移动端适配方案总结
### 共同点：
* 都能适配所有的手机设备，对于pad，网易与淘宝都会跳转到pc页面，不再使用触屏版的页面
* 都需要动态设置html的font-size
* 布局时各元素的尺寸值都是根据设计稿标注的尺寸计算出来，由于html的font-size是动态调整的，所以能够做到不同分辨率下页面布局呈现等比变化
* 容器元素的font-size都不用rem，需要额外地对font-size做媒介查询
* 都能应用于尺寸不同的设计稿，只要按以上总结的方法去用就可以了


### 不同点
* 淘宝的设计稿是基于750的横向分辨率，网易的设计稿是基于640的横向分辨率，还要强调的是，虽然设计稿不同，但是最终的结果是一致的，设计稿的尺寸一个公司设计人员的工作标准，每个公司不一样而已
* 淘宝还需要动态设置viewport的scale，网易不用
* 最重要的区别就是：网易的做法，rem值很好计算，淘宝的做法肯定得用计算器才能用好了 。不过要是你使用了less和sass这样的css处理器，就好办多了

**之所以不使用百分比布局，因为如果出现千套盒子，那么百分比布局就出现问题了，因为百分比的参考系是父元素，所以我们如果在子盒子里面定义10%的宽度，指的是父盒子而不是window.innerWidth的10%，而vw的代码维护性不如上述这套方案，且兼容性也不如rem好**
**附我在学习过程中看到的两篇不错文章介绍：https://www.cnblogs.com/axl234/p/5156956.html和https://funteas.com/topic/5a45b09634db6205187af9ce**

**************
## 移动端1px问题总结：
### 产生1px变粗的原因：
为什么移动端css里面写了1px, 实际看起来比1px粗. 其实原因很好理解:这2个’px’的含义是不一样的. 移动端html的header总会有一句<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">这句话定义了本页面的viewport的宽度为设备宽度,初始缩放值和最大缩放值都为1,并禁止了用户缩放. viewport通俗的讲是浏览器上可用来显示页面的区域, 这个区域是可能比屏幕大的.根据这篇文章http://www.cnblogs.com/2050/p/3877280.html的分析, 手机存在一个能完美适配的理想viewport, 分辨率相差很大的手机的理想viewport的宽度可能是一样的, 这样做的目的是为了保证同样的css在不同屏幕下的显示效果是一致的, 上面的meta实际上是设置了ideal viewport的宽度.以实际举例: iphone3和iphone4的屏幕宽度分别是320px,640px, 但是它们的ideal viewport的宽度都是320px, 设置了设备宽度后, 320px宽的元素都能100%的填充满屏幕宽. 不同手机的ideal viewport宽度是不一样的, 常见的有320px, 360px, 384px. iphone系列的这个值在6之前都是320px, 控制viewport的好处就在于一套css可以适配多个机型.看懂的人应该已经明白 1px变粗的原因了, viewport的设置和屏幕物理分辨率是按比例而不是相同的. 移动端window对象有个devicePixelRatio属性, 它表示设备物理像素和css像素的比例, 在retina屏的iphone手机上, 这个值为2或3, css里写的1px长度映射到物理像素上就有2px或3px那么长.
### 解决方案：
* 用小数来写px值：
IOS8下已经支持带小数的px值, media query对应devicePixelRatio有个查询值-webkit-min-device-pixel-ratio, css可以写成这样,如果使用less/sass的话只是加了1句mixin
>```css
>.border { border: 1px solid #999 }
>@media screen and (-webkit-min-device-pixel-ratio: 2) {
>   .border { border: 0.5px solid #999 }
>}
>@media screen and (-webkit-min-device-pixel-ratio: 3) {
>    .border { border: 0.333333px solid #999 }
>}
>```
**缺点: 安卓与低版本IOS不适用, 这个或许是未来的标准写法, 现在不做指望**
* border-image:将图片9宫格等分填充border-image, 这样元素的4个边框宽度都只有1px
>```css
>@media screen and (-webkit-min-device-pixel-ratio: 2){ 
>    .border{ 
>        border: 1px solid transparent;
>        border-image: url(border.gif) 2 repeat;
>    }
>}
>```
图片可以用gif, png, base64多种格式, 以上是上下左右四条边框的写法, 需要单一边框只要定义单一边框的border, 代码比较直观.
**缺点: 对于圆角样式, 将图片放大修改成圆角也能满足需求, 但这样无形中增加了border的宽度存在多种边框颜色或者更改的时候麻烦**
* background渐变：背景渐变, 渐变在透明色和边框色中间分割, frozenUI用的就是这种方法, 借用它的上边框写法:
>```css
>@media screen and (-webkit-min-device-pixel-ratio: 2){
>    .ui-border-t {
>        background-position: left top;
>        background-image: -webkit-gradient(linear,left bottom,left top,color-stop(0.5,transparent),color-stop(0.5,#e0e0e0),to(#e0e0e0));
>    }
>}
>```
**缺点: 代码量大, 而且需要针对不同边框结构, frozenUI就定义9种基本样式而且这只是背景, 这样做出来的边框实际是在原本的border空间内部的, 如果元素背景色有变化的样式, 边框线也会消失.最后不能适应圆角样式**

* :before, :after与transform:之前说的frozenUI的圆角边框就是采用这种方式, 构建1个伪元素, 将它的长宽放大到2倍, 边框宽度设置为1px, 再以transform缩放到50%.
>```css
>.radius-border{
>    position: relative;
>}
>@media screen and (-webkit-min-device-pixel-ratio: 2){
>    .radius-border:before{
>        content: "";
>        pointer-events: none; /* 防止点击触发 */
>        box-sizing: border-box;
>        position: absolute;
>        width: 200%;
>        height: 200%;
>        left: 0;
>        top: 0;
>        border-radius: 8px;
>        border:1px solid #999;
>        -webkit-transform(scale(0.5));
>        -webkit-transform-origin: 0 0;
>        transform(scale(0.5));
>        transform-origin: 0 0;
>    }
>}
>```
**需要注意<input type="button">是没有:before, :after伪元素的.优点: 其实不止是圆角, 其他的边框也可以这样做出来.缺点: 代码量也很大, 占据了伪元素, 容易引起冲突**
* flexible.js:这是淘宝移动端采取的方案, github的地址:https://github.com/amfe/lib-flexible. 前面已经说过1px变粗的原因就在于一刀切的设置viewport宽度, 如果能把viewport宽度设置为实际的设备物理宽度, css里的1px不就等于实际1px长了么. flexible.js就是这样干的.
  * <meta name=”viewport”>里面的scale值指的是对ideal viewport的缩放, flexible.js检测到IOS机型, 会算出scale = 1/devicePixelRatio, 然后设置viewport
  >```css
  >metaEl = doc.createElement('meta');
  >metaEl.setAttribute('name', 'viewport');
  >metaEl.setAttribute('content', 'initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-     scalable=no');
  >```
  * devicePixelRatio=2时输出meta如下, 这样viewport与ideal viewport的比是0.5, 也就与设备物理像素一致
  >```css
  ><meta name="viewport" content="initial-scale=0.5, maximum-scale=0.5, minimum-scale=0.5, user-scalable=no">
  >```
  * 另外html元素上的font-size会被设置为屏幕宽的1/10, 这样css可以以rem为基础长度单位进行改写, 比如rem是28px, 原先的7px就是0.25rem. border的宽度能直接写1px.
  >```javascript
  >function refreshRem() {
  >  var width = docEl.getBoundingClientRect().width;
  >  if (width / dpr > 540) { //大于540px可以不认为是手机屏
  >      width = 540 * dpr;
  >  }
  >  var rem = width / 10; 
  >  docEl.style.fontSize = rem + 'px';
  >  flexible.rem = win.rem = rem;
  >}
  >```
