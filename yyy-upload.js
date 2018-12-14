(function ($) {
    $.fn.extend({
        imgUpload: function (options) {
            var opts = $.extend({}, defaluts, options);

            //本地预览
            function preview(opt) {
                // opt:
                // {
                //     fileData,
                //     previewBox,
                //     fileEle
                // }

                if (typeof opt.fileData !== 'undefined') {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        opt.previewBox.html('<img src="' + e.target.result + '" class="yyy-preview-img" />');
                    };
                    reader.readAsDataURL(opt.fileData);
                } else {
                    var file = opt.fileEle[0];
                    if ((file.files && file.files[0])) {
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            opt.previewBox.html('<img src="' + e.target.result + '" class="yyy-preview-img" />');
                        };
                        reader.readAsDataURL(file.files[0]);
                    } else {
                        //兼容IE6~IE9
                        opt.previewBox.html(
                            '<div class="yyy-preview-img" style="filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale,src=\'' +
                            file.value +
                            "'\"></div>"
                        );
                    }
                }
            }

            //上传图片数据
            function uploadData(opt) {

                // opt:
                // {
                //     method, // 'form / formdata'
                //     fileEle, // 'form 方式必填'
                //     containerEle, // 'form 方式必填'
                //     fileData, 
                //     succCb,
                //     failCb
                // }

                if (opt.method === 'form') {
                    var tempForm = $('<form id="yyy-temp-form" name="yyy-temp-form" method="POST"  enctype="multipart/form-data"></form>');
                    $('body').append(tempForm);

                    tempForm.append(opt.fileEle).ajaxSubmit({
                        url: opts.url,
                        type: "POST",
                        timeout: 3000,
                        success: function (data) {
                            //将文件放回原位
                            if (typeof opt.succCb !== 'undefined') {
                                opt.succCb(data)
                            }
                            opt.fileEle.appendTo(opt.containerEle);
                            tempForm.remove();
                        },
                        error: function (err) {
                            if (typeof opt.failCb !== 'undefined') {
                                opt.failCb(err)
                            }
                            opt.fileEle.appendTo(opt.containerEle);
                            tempForm.remove();
                        }
                    });

                } else if (opt.method === 'formdata') {
                    var formData = new FormData();
                    formData.append('pic', opt.fileData);

                    $.ajax({
                        url: opts.url,
                        type: 'POST',
                        data: formData,
                        contentType: false,
                        processData: false,
                        success: function (data) {
                            if (typeof opt.succCb !== 'undefined') {
                                opt.succCb(data)
                            }
                        },
                        error: function (err) {
                            if (typeof opt.failCb !== 'undefined') {
                                opt.failCb(err)
                            }
                        }
                    })
                }
            }

            //重置input
            function resetIpt(fileEle, containerEle) {
                var resetForm = $('<form id="yyy-reset-form" name="yyy-reset-form" method="POST"  enctype="multipart/form-data"></form>');
                $('body').append(resetForm);
                resetForm.append(fileEle);
                resetForm[0].reset();
                fileEle.appendTo(containerEle);
                resetForm.remove();
            }

            //验证图片大小
            function oversize(file, maxSize) {
                var fileSize = file.size;
                return (maxSize === 0) || (maxSize !== 0 && fileSize / 1024 <= maxSize) ? false : true;
            }

            //检测图片类型
            function imgType(fileEle, allowType, isData) {
                isData = isData || false;
                var suffix = isData ? fileEle.name.split('.')[1] : fileEle.val().split('.')[1];
                return allowType.indexOf(suffix) === -1 ? false : true;
            }

            //消息与界面控制
            function infoControll(hideEles, showEles,  tipEles, tipText) {

                hideEles.forEach(function (ele) {
                    ele.addClass('yyy-hide');
                })

                showEles.forEach(function (ele) {
                    ele.removeClass('yyy-hide');
                })

                if (tipEles && tipEles.length > 0) {
                    tipEles.html(tipText || "");
                }
            }

            return this.each(function () {

                var $this = $(this);

                $this.html(
                    '<label class="yyy-ipt-label"><input type="file" accept="image/*" name="pic" class="yyy-img-ipt"></label>' +
                    '<div class="yyy-preview-box"><img src="" class="yyy-preview-img"></div>' +
                    '<div class="yyy-btn-group">' +
                    '<div class="yyy-btn-del yyy-hide"></div>' +
                    '<div class="yyy-btn-upload yyy-hide"></div>' +
                    '<div class="yyy-btn-retry yyy-hide"></div>' +
                    '</div>' +
                    '<div class="yyy-tip-load yyy-hide">' +
                    '<div class="yyy-loader">Loading...</div>' +
                    '</div>' +
                    '<div class="yyy-tip-info"></div>');

                var $imgIpt = $this.find('.yyy-img-ipt');
                var $iptLabel = $this.find('.yyy-ipt-label');
                var $previewBox = $this.find('.yyy-preview-box');

                var $btnDel = $this.find('.yyy-btn-del');
                var $btnRetry = $this.find('.yyy-btn-retry');
                var $btnUpload = $this.find('.yyy-btn-upload');
                var $tipLoad = $this.find('.yyy-tip-load');

                var $tipInfo = $this.find('.yyy-tip-info');

                var UINone = [];
                var UIAll = [$btnDel, $btnRetry, $btnUpload, $tipLoad];
                var UISucc = [$btnDel];
                var UIFail = [$btnDel, $btnRetry];
                var UIUploading = [$btnDel, $tipLoad];
                var UIPreview = [$btnDel, $btnUpload];
                var UIError = [$btnDel];

                var isDrag = false;
                var fileData = '';

                $imgIpt.on('change', function () {

                    isDrag = false;
                    fileData = '';

                    //预览
                    preview({
                        fileEle: $imgIpt,
                        previewBox: $previewBox
                    });

                    //隐藏UI
                    infoControll(UIAll, UINone, $tipInfo, "");

                    //是否未选文件
                    if ($imgIpt.val() === '') return;

                    //检验图片大小
                    if (opts.oversize !== 0) {
                        if (oversize($imgIpt[0].files[0], opts.maxSize)) {
                            infoControll(UIAll, UIError, $tipInfo, "图片太大");
                            return;
                        };
                    }

                    //检验图片类型
                    if (!imgType($imgIpt, opts.imgType)) {
                        infoControll(UIAll, UIError, $tipInfo, "图片格式不正确");
                        return;
                    }

                    //是否自动上传
                    if (opts.immediatelyUpload) {
                        $btnUpload.trigger('click');
                    } else {
                        infoControll(UIAll, UIPreview);
                    }
                });


                //方式：拖拽文件，ie10+可用
                if (opts.allowDrag && window.FileReader) {

                    $iptLabel.on('dragover', function (e) {
                        e.preventDefault();
                        $this.addClass('yyy-file-in');
                    })

                    $iptLabel.on('dragleave', function (e) {
                        e.preventDefault();
                        $this.removeClass('yyy-file-in');
                    })

                    $iptLabel.on('drop', function (e) {
                        e.stopPropagation();
                        e.preventDefault();

                        isDrag = true;
                        fileData = e.originalEvent.dataTransfer.files[0];

                        //预览
                        preview({
                            fileData: fileData,
                            previewBox: $previewBox
                        })

                        $this.removeClass('yyy-file-in');

                        //检验图片大小
                        if (opts.oversize !== 0 && fileData) {
                            if (oversize(fileData, opts.maxSize)) {
                                infoControll(UIAll, UIError, $tipInfo, "图片太大");
                                return;
                            };
                        }

                        //检验图片类型
                        if (!imgType(fileData, opts.imgType, true)) {
                            infoControll(UIAll, UIError, $tipInfo, "图片格式不正确");
                            return;
                        }


                        if (opts.immediatelyUpload) {

                            $btnUpload.trigger('click');

                        } else {
                            infoControll(UIPreview, UIAll);
                        }
                    })
                } else {
                    $imgIpt.on('drop', function (e) {
                        e.preventDefault();
                    });
                }


                //删除图片
                $btnDel.on('click', function () {
                    $this.find('.yyy-preview-img').attr('src', '').css('filter', '');
                    resetIpt($imgIpt, $iptLabel);
                    isDrag = false;
                    fileData = '';
                    infoControll(UIAll, UINone, $tipInfo, "");
                })

                //点击上传
                $btnUpload.on('click', function () {
                    infoControll(UIAll, UIUploading, $tipInfo, "");

                    //自定义：上传前检验
                    if (!opts.beforeUpload($imgIpt)) {
                        infoControll(UIAll, UIPreview, $tipInfo, "发生异常");
                        return;
                    };

                    var uploadOpt = {
                        succCb: function (data) {
                            infoControll(UIAll, UISucc, $tipInfo, "上传成功");
                            //自定义回调函数
                            opts.succCb(data);
                        },
                        failCb: function (err) {
                            infoControll(UIAll, UIFail, $tipInfo, "上传失败，请重试");
                            //自定义回调函数
                            opts.failCb(err);
                        }
                    }

                    //上传方式选择
                    if (isDrag && fileData !== '') {
                        uploadOpt.method = 'formdata';
                        uploadOpt.fileData = fileData;
                        uploadData(uploadOpt);
                    } else {
                        uploadOpt.method = 'form';
                        uploadOpt.fileEle = $imgIpt;
                        uploadOpt.containerEle = $iptLabel;
                        uploadData(uploadOpt);
                    }
                });

                //重试
                $btnRetry.on('click', function () {
                    $btnUpload.trigger('click');
                });

            });
        }
    });

    var defaluts = {
        immediatelyUpload: false, //是否立即上传
        url: '', //上传地址
        maxSize: '', //ie10+
        imgType: ['gif', 'jpeg', 'jpg', 'png', 'bmp'], //允许上传的图片类型
        allowDrag: false, //允许拖拽上传, ie10+
        beforeUpload: function (fileEle) {
            return true;
        }, //上传前操作
        succCb: function (data) {}, //上传成功后回调
        failCb: function (err) {} //上传失败后回调
    };
})(jQuery);