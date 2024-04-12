;(function(root) {
  const doc = root.document;
  const { on, addClass, removeClass } = tools;
  let uidIndex = 0;
  const ul = doc.querySelector('.upload-list');

  const ajaxUpload = function(option) {
    if (!root.XMLHttpRequest) {
      return;
    }
    const xhr = new XMLHttpRequest();
    if (xhr.upload) {
      xhr.upload.onprogress = function(e) {
        if (e.lengthComputable) {
          e.percent = parseInt((e.loaded / e.total) * 100);
          option.onProgress(e);
        }
      };
    }
    const formData = new FormData();
    formData.append(option.filename, option.file);

    xhr.onerror = function(e) {
      option.onError(e);
    };

    xhr.onload = function() {
      const status = xhr.status;
      if (status < 200 || status >= 300) {
        return option.onError({code: status, msg: '上传失败'});
      }
      option.onSuccess(xhr.responseText || xhr.response);
    };

    xhr.open('post', option.action, true);
    xhr.send(formData);
    return xhr;
  };

  const Upload = function() {
    this.filesList = [];
    this.upload = null;
    this.imgViewDOM = null;
    this.input = null;
    this.limit = 3;
    this.reqs = {};
    this.init();
  };

  Upload.prototype = {
    init: function() {
      const upload = doc.querySelector('.upload');
      this.upload = upload.children[1];
      this.imgViewDOM = upload.children[0];
      this.input = this.upload.children[1];
      this.on();
    },
    on: function() {
      const that = this;
      on(this.upload, {
        'click': function() {
          // 处理file选择相同文件只能选择一次的情况，保证每次都可以选择文件
          that.input.value = null;
          that.input.click();
        }
      });
      on(this.input, {
        'change': function(e) {
          let files = e.target.files;
          if (!files.length) return;
          [...files].forEach(item => {
            const file = {
              raw: item
            };
            // 创建指向选择的file对象的URL
            file.url = URL.createObjectURL(item);
            that.beforeUpload(file);
          });
        }
      })
    },
    createImageViewer: function(file) {
      const liNode = doc.createElement('li');
      liNode.className = 'item';
      liNode.innerHTML = `
        <img class="img" src="${file.url}" alt="image" />
      `;
      file.image = liNode;
      ul.appendChild(liNode);
    },
    beforeUpload: function(file) {
      // 限制大小、格式、数目，都可以在此处理
      this.createImageViewer(file);
      this.postUpload(file);
    },
    postUpload: function(file) {
      const { uid } = file;
      const option = {
        file: file.raw,
        filename: file.raw.name,
        action: 'http://jquery-file-upload.appspot.com/',
        onProgress: e => {
          this.progress(e, file);
        },
        onSuccess: res => {
          this.filesList.push(file);
          this.success(res, file);
          delete this.reqs[file.uid];
        },
        onError: err => {
          this.error(err, file);
          delete this.reqs[file.uid];
        }
      };
      const res = ajaxUpload(option);
      this.reqs[file.uid] = res;
    },
    progress: function(e) {
      console.log(e.percent);
    },
    success: function(res, file) {
      console.log(res);
    },
    error: function(err, file) {
      this.imgViewDOM.removeChild(file.image);
    }
  };

  new Upload();

})(window);