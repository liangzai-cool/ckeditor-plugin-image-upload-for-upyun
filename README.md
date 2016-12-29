# ckeditor-plugin-image-upload-for-upyun
![又拍云](https://raw.githubusercontent.com/liangzai-cool/ckeditor-plugin-image-upload-for-upyun/master/icons/image.png)

# Website
 http://xueliang.org/

# Demo
 https://liangzai-cool.github.io/ckeditor-plugin-image-upload-for-upyun/

# Introduce
基于CKEDITOR默认内置的 [Image](http://ckeditor.com/addon/image) 插件修改而来，本着尽量少修改代码的原则，只添加了上传到 [又拍云](http://upyun.com) 功能，未修改 image 插件的任何代码逻辑，上传使用了又拍云官方提供的 SDK [`js-multipart-upload`](https://github.com/upyun/js-multipart-upload))。

本插件提供了配置项，可以在修改源码的情况使用本插件。

引入依赖文件：
```
<script src="https://cdnjs.cloudflare.com/ajax/libs/ckeditor/4.6.1/ckeditor.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/async/2.1.4/async.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/spark-md5/3.0.0/spark-md5.min.js"></script>
<script src="https://rawgit.com/liangzai-cool/js-multipart-upload/master/lib/upyun-mu.js"></script>
```

添加上传配置信息：
```
CKEDITOR.config.imageuploadforupyun = {
    protocol: 'http://',                                           // 选填，上传时使用的HTTP协议，默认值是所在页面的协议
    host: 'b0.upaiyun.com',                                        // 选填，上传地址，默认值为 'b0.upaiyun.com'
    
    // 以下配置信息来自 `js-multipart-upload`，详细介绍请移步至 https://github.com/upyun/js-multipart-upload 或者http://docs.upyun.com/api/form_api/
    bucket_name: 'upyun-form',                                     // 必填，文件上传到的服务
    form_api_secret: 'IRoTyNc75husfQD24cq0bNmRSDI=',               // 必填，表单 API
    expiration: parseInt((new Date().getTime() + 3600000) / 1000), // 选填，上传请求过期时间，单位为秒，默认值为parseInt((new Date().getTime() + 3600000) / 1000)
    
}
```

引入插件到CKEDITOR中：
```
var pluginName = 'imageuploadforupyun';

// 将插件注册到CKEDITOR上，并指明插件的根目录位置（CKEDITOR并不会加载该插件）。
// 第二个参数可以是插件根目录的绝对位置，也直接以 `/` 开头，或者相对位置，只要保证最终解析的位置正确即可
// 这一步写法有多种，这里使用了最简便和最好理解的写法
// 更多写法参考官方文档：http://docs.ckeditor.com/#!/api/CKEDITOR.resourceManager-method-addExternal
// 若插件被放置在 `ckeditor/plugins/` 下，这一步可以不写
// CKEDITOR默认认为 `ckeditor/plugins/yourpluginname/` 是你编写的插件的根目录
CKEDITOR.plugins.addExternal(pluginName, 'https://rawgit.com/liangzai-cool' + location.pathname + 'master/');

// 让CKEDITOR加载并引入插件，若有多个插件，需用逗号分隔
CKEDITOR.config.extraPlugins = pluginName;

// 因为本插件是基于image插件修改而来，保留了image插件已有的功能，故此处需要禁用image插件，以免造成重复
CKEDITOR.config.removePlugins = 'image';
```

也可以直接修改本插件源码，以便进行更多配置，比如文件名生成策略等，关键代码看[这里](https://github.com/liangzai-cool/ckeditor-plugin-image-upload-for-upyun/blob/master/dialogs/imageuploadforupyun.js#L1078-L1113)。
