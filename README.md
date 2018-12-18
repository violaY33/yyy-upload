# yyy-upload

jquery图片上传插件，兼容IE9+。支持拖拽上传、图片类型、大小等设置。[查看在线演示](https://violay33.github.io/yyy-upload/demo.html)。

![效果演示](https://s1.ax1x.com/2018/12/18/F0zO0S.gif)





## 用法

1. 引入必要文件
    
    ```html
    <!-- jquery -->
    <script src="https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js"></script>
    <!-- jquery.form.js -->
    <script src="https://cdn.bootcss.com/jquery.form/4.2.2/jquery.form.min.js"></script>
    <!-- yyy-upload -->
    <script src="yyy-upload.min.js"></script>
    <link rel="stylesheet" href="yyy-upload.min.css">
    ```

2. 基本用法

    ```html
    <div class="yyy-upload-box"></div>
    ```

    ```js
    $('.yyy-upload-box').imgUpload({
        immediatelyUpload: true,
        url: '/upload',
        maxSize: 0,
        imgType: ['png', 'jpg'],
        allowDrag: true
    });
    ```


## 参数

| 参数 | 说明 | 类型 | 默认值 |
|:---|:---|:---|:---|
|immediatelyUpload|是否立即上传|boolean|false|
|url|图片上传地址|string||
|maxSize|图片最大尺寸显示（0则表示无限制，仅ie10+）|number|0|
|imgType|允许上传的图片类型|array|['gif', 'jpeg', 'jpg', 'png', 'bmp']|
|allowDrag|是否允许拖拽上传（仅ie10+）|boolean|false|
|beforeUpload|上传前操作，`return false` 则停止上传，参数为图片表单元素|function|function(fileEle){return true}|
|succCb|上传成功后回调，参数为服务器返回的data|function|function (data) {}|
|failCb|上传失败后回调，参数为上传失败错误对象|function|function (err) {}|



