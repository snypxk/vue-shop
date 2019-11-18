<template>
  <div>
    <!-- Breadcrumb面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Card 卡片视图区域 -->
    <el-card>
      <!-- 头部的提示区 -->
      <el-alert title="添加商品信息" type="info" show-icon :closable="false" center></el-alert>
      <!-- steps步骤条区域 -->
      <!-- 
        === Steps Attributes ===
        space: [说明]每个 step 的间距，不填写将自适应间距。支持百分比。[类型]number / string
        active: [说明]设置当前激活步骤 [类型]number [默认值]0
        align-center: [说明]进行居中对齐 [类型]boolean [默认值]false
        process-status: [说明]设置当前步骤的状态 [类型]string [可选值]wait/process/finish/error/success[默认值]process
        finish-status: [说明]设置结束步骤的状态 [类型]string [可选值]wait/process/finish/error/success[默认值]finish
      -->
      <!-- :active="activeIndex - 0" 目的: 把 activeIndex 转换成数字类型-->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        style="height: 200px;"
        align-center
      >
        <!-- 
          === Step Attributes ===
          title: 标题  [类型]string
          description: 描述性文字 [类型]string
          icon: 图标 [类型]传入 icon 的 class 全名来自定义 icon，也支持 slot 方式写入 [类型]string
          status: 设置当前步骤的状态，不设置则根据 steps 确定状态 [类型]wait/process/finish/error/success
        -->
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 用表单包裹 Tab区 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <!-- Tab栏区域: 字符串用单引号括起来 -->
        <!-- 
          === Tabs Attributes ===
          参数		      说明				                类型		      可选值			        默认值
          value/v-model	绑定值，选中选项卡的 name	   string		      —			            第一个选项卡的 name
          type		      风格类型			              string		card/border-card	      —
          closable	    标签是否可关闭			        boolean	    	  — 			          false
          addable		    标签是否可增加			        boolean	      	—		          	  false
          editable	    标签是否同时可增加和关闭   	 boolean		     —			           false
          tab-position	选项卡所在位置			        string		top/right/bottom/left	  top
          stretch		    标签的宽度是否自撑开	    	 boolean	       —	      		     false
          before-leave	切换标签之前的钩子，      	 Function(activeName, oldActiveName)	—   	—
                        若返回 false 或者
                        返回 Promise 且被 reject，则阻止切换。
        -->
        <!-- 
          === Tabs Events ===
          @tab-click:	tab被选中时触发	  [回调参数]被选中的标签 tab 实例
        -->
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <!-- tab-position="left"  <==>  :tab-position="'left'" -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number" min="0" style="width: 150px;"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number" min="0" style="width: 150px;"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number" min="0" style="width: 150px;"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- cascader级联选择器: 选择商品分类参数 -->
              <!-- Cascader 级联选择器:
                v-model: 选中项绑定值
                options: 可选项数据源，键名可通过 Props 属性配置
                change: 当选中节点变化时触发,返回选中节点的值
                clearable: 可清空
              -->
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cascaderProps"
                clearable
                @change="handleCascaderChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的Item项: 商品的动态参数 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb, index) in item.attr_vals" :key="index" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <!-- 渲染表单的Item项: 商品的静态属性 -->
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 
              === Attribute ===
              <<参数>>	               <<说明>>	                                        <<类型>>	                       <<可选值>>  	<<默认值>>
              action	            必选参数，上传的地址                      	            string                              —	         —
              headers	            设置上传的请求头部	                                    object                            	—	         —
              multiple	          是否支持多选文件	                                      boolean	                            —        	 —
              data	              上传时附带的额外参数                                  	object	                            —	         —
              name	              上传的文件字段名	                                      string	                            —	        file
              with-credentials	  支持发送 cookie 凭证信息	                              boolean	                            —	        false
              show-file-list    	是否显示已上传文件列表	                                 boolean                           	—	        true
              drag	              是否启用拖拽上传	                                      boolean	                            —	        false
              accept	            接受上传的文件类型                            	        string                            	—	          —
                              （thumbnail-mode 模式下此参数[accept]无效）
              on-preview        	点击文件列表中已上传的文件时的钩子	                     function(file)	                      —	         —
              on-remove	          文件列表移除文件时的钩子	                              function(file, fileList)           	 —      	  —
              on-success       	  文件上传成功时的钩子                              	    function(response, file, fileList)	 —	        —
              on-error	          文件上传失败时的钩子                                  	function(err, file, fileList)        —        	—
              on-progress	        文件上传时的钩子	                                      function(event, file, fileList)      —	        —
              on-change	          文件状态改变时的钩子，添加文件、上传成功          	      function(file, fileList)	           —        	—
                                  和上传失败时都会被调用
              before-upload      	上传文件之前的钩子，参数为上传的文件，                  	function(file)	                     —        	—
                                  若返回 false 或者返回 Promise 且被 reject，则停止上传。
              before-remove     	删除文件之前的钩子，参数为上传的文件和文件列表，           function(file, fileList)            	—	          —
                                  若返回 false 或者返回 Promise 且被 reject，则停止删除。	
              list-type	          文件列表的类型	                                        string	              text/picture/picture-card	   text
              auto-upload	        是否在选取文件后立即进行上传	                            boolean                           	—	            true
              file-list	          上传的文件列表, 例如:                                    array	                             —	           []
                                  [{name: 'food.jpg', url:
                                   'https://xxx.cdn.com/xxx.jpg'}]	
              http-request      	覆盖默认的上传行为，可以自定义上传的实现                 	 function	                           —	           —
              disabled	          是否禁用	                                              boolean	                            —	            false
              limit	              最大允许上传个数	                                       number                              —	           —
              on-exceed	          文件超出个数限制时的钩子                                  function(files, fileList)	          —	            —
            -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <!-- '商品内容' 需要安装 运行依赖: vue-quill-editor 富文本编辑器 -->
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- '添加商品'按钮: 完成所有商品信息填写操作后 -->
            <el-button type="primary" class="margin-top-with-quil-editor" @click="addConfirm">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 对话框区域 -->
    <!-- 图片预览对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="priviewPath" alt class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
// 导入运行依赖[lodash 需要安装]: 深拷贝
import _ from 'lodash'

export default {
  data() {
    return {
      // Steps和Tabs中当前激活步骤/面板的索引,[默认]0
      activeIndex: '0',
      // 添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // goods_cat: 以为','分割的'分类ID'[cat_id]列表
        goods_cat: [],
        // 上传的图片临时路径（数组）
        pics: [],
        // 商品详情介绍
        goods_introduce: '',
        // 商品的参数（数组），包含 `动态参数` 和 `静态属性`
        /* eg: "attrs":[ { "attr_id":15, "attr_value":"ddd" }, {  "attr_id":15, "attr_value":"eee" } ] */
        attrs: []
      },
      // 添加商品的表单数据验证规则对象
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 商品分类数据列表
      cateList: [],
      // Cascader 级联选择器- props属性配置
      cascaderProps: {
        // 次级菜单的展开方式: click / hover
        expandTrigger: 'hover',
        // value: 指定 选项的值 为 选项对象[cateList]的某个属性值[string]
        value: 'cat_id',
        // label: 指定 选项标签 为 选项对象的某个属性值[string]
        label: 'cat_name',
        // children: 指定 选项的子选项 为 选项对象的某个属性值
        children: 'children',
        // 让父子节点有关联，不能选择任意一级选项,只能选择没有子结点的选项[第三项]
        checkStrictly: false
      },
      // 商品'动态参数'列表数据: 在 tabClicked() 中初始化
      manyTableData: [],
      // 商品'静态属性'列表数据: 在 tabClicked() 中初始化
      onlyTableData: [],
      // 商品图片上传的URL地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      /* 本项目中除登录接口以外,其他的所有请求均是需要权限才能访问的,
         即访问除登录接外其他接口需要在请求头设置: Authorization: token
         这个token是:
         在登录时存入的: window.sessionStorage.setItem('token', res.data.token),
         因为在图片上传中封装的AJAX中,发送请求时并没有为我们在请求头
         中设置token值,因此会发生访问后台接口失败.
         解决: el-upload 的一个属性: headers 可以用它来设置我们需要的请求头参数
      */
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览图片的URL地址: 在 handlePreview() 中初始化
      priviewPath: '',
      // 控制'图片预览对话框'的展示与关闭, 默认[false]
      previewVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // ===== 获取所有'商品分类'数据 =====
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败')
      }
      this.cateList = res.data
      // console.log(this.cateList)
    },
    // ===== 当商品的所属分类 级联选择器的值发行改变时,执行: =====
    handleCascaderChange() {
      // 先判断选中的是否是第三级分类
      if (this.addForm.goods_cat.length !== 3) {
        // 不是第三级就重置 this.addForm.goods_cat
        this.addForm.goods_cat = []
      }
    },
    // ===== 当Tabs 标签页发生改变时,执行: =====
    beforeTabLeave(activeName, oldActiveName) {
      // console.log('即将离开的标签页的name属性值: ' + oldActiveName)
      // console.log('即将进入的标签页的name属性值: ' + activeName)
      /* 根据所要求的条件,决定是否离开旧标签页面和进入新标签页面
         为什么一定要选择goods_cat[商品所属分类]才允许往下填入数据,而如果商品名称这些即使暂时不填也可以往下?
         解析: 往下的标签页面中使用到: 商品参数 ,商品参数必须是根据 [商品所属分类] 才能查询 */
      if (this.activeIndex === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类!')
        return false
      }
    },
    // ===== 当Tabs 标签页tab被选中时,执行: =====
    async tabClicked() {
      // console.log(this.activeIndex)
      if (this.activeIndex === '1') {
        // 访问的是'商品参数'[动态参数]面板
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: 'many' } }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品动态参数列表数据失败')
        }
        // console.log(res.data)
        // 一个动态参数对应一个以空格分割的整体字符串值[attr_vals],需要将其分开
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
        console.log(this.manyTableData)
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: 'only' } }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品静态属性列表数据失败')
        }
        // 一个静态属性对应一个值,所以不用分割成字符串
        this.onlyTableData = res.data
        // console.log(this.onlyTableData)
      }
    },
    // *************** 图片文件上传相关的处理函数 START ***************
    // ===== 点击文件列表中已上传的文件时的钩子: 处理图片预览效果 =====
    handlePreview(file) {
      this.priviewPath = file.response.data.url
      this.previewVisible = true
    },
    // ===== 文件列表移除文件时的钩子: 处理移除图片的操作 =====
    handleRemove() {},
    // ===== 文件上传成功时的钩子: 文件上传成功后[已经传到服务器],此时需要根据返回的数据response[包含图片的路径]来赋给该商品的数据表字段中的'路径字段' =====
    /* function(response, file, fileList) */
    handleSuccess(response) {
      // console.log(response)
      // 1.拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      // 2.将图片信息对象 push 到 pics 数组中
      this.addForm.pics.push(picInfo)
      // console.log(this.addForm)
    },
    // **************** 图片文件上传相关的处理函数 END ****************
    // ===== 点击'添加按钮'后, 把添加的商品真正持久化到数据库 =====
    addConfirm() {
      // 验证表单填写是否完成
      this.$refs.addFormRef.validate(async valid => {
        // 填写未完成则提示并返回
        if (!valid) {
          return this.$message.error('请把数据项填写完整')
        }
        // 填写完成则把商品持久化到数据库
        /* 几个特殊的参数:
        本表单中定义的 goods_cat 是一个数组: 需要用逗号将将拼接成一个字符串才能提交到数据库
            goods_cat    | 以为','分割的分类列表
        本表单中使用`动态参数`时,先把 attr_vals用空格将其分割变成了一个数组来使用: 需要将其拼加字符串才能提交到数据库
            attrs        | 商品的参数（数组），包含 `动态参数` 和 `静态属性`    
        */
        /* 这里要对addForm进行一次深拷贝:
          原因:
            当你执行: this.addFormRef.goods_cat = this.addFormRef.goods_cat.join(',')时
            因为 Cascader 级联选择器 只能通过 v-model="addForm.goods_cat" 来双向绑定一个数据,
            其要求 addForm.goods_cat 必须 是一个数组,所以当你把其转换成一个字符串时其会报错.
          解决: 对addForm进行一次深拷贝, 用拷贝的副本来保存到数据库即可
        */
        // 深拷贝: lodash.cloneDeep(obj)[需要安装运行依赖lodash]
        const addFormCopy = _.cloneDeep(this.addForm)
        // console.log(addFormCopy)
        addFormCopy.goods_cat = addFormCopy.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        addFormCopy.attrs = this.addForm.attrs
        // console.log(addFormCopy)
        // 发起请求：添加商品[注意： 商品名称必须是唯一的]
        const { data: res } = await this.$http.post('goods', addFormCopy)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败')
        }
        this.$message.success('添加商品成功')
        // 编程式导航回到商品列表
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    // ===== 获取三级分类的ID =====
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  // top right bottom left
  margin: 0 10px 0 0 !important;
}

.previewImg {
  width: 100%;
}

.margin-top-with-quil-editor {
  margin-top: 15px;
}
</style>
