$('.yyy-upload-box').imgUpload({
    immediatelyUpload: true,
    url: 'http://localhost:3333/upload',
    maxSize: 0,
    imgType: ['png', 'jpg'],
    allowDrag: true
});
