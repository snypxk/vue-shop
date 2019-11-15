<template>
  <div>
    <!-- Breadcrumb面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 头部的警告区 -->
      <el-alert title="注意: 只允许为第三级分类设置相关参数" type="warning" show-icon :closable="true"></el-alert>
      <!-- 选择商品分类的区域 -->
      <el-row class="to_isolated_with_alert">
        <el-col>
          <span>选择商品分类:</span>
          <!-- 选择商品分类的级联选择框: Cascader 级联选择器 -->
          <!-- Cascader 级联选择器
            v-model: 选中项绑定值
            options: 可选项数据源，键名可通过 Props 属性配置
            change: 当选中节点变化时触发,返回选中节点的值
            clearable: 可清空
          -->
          <el-cascader
            v-model="selectedKeys"
            :options="cateList"
            :props="cascaderProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- Tabs 标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加'动态参数'的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- '添加参数'的按钮 -->
          <el-button
            class="add_params_btn"
            type="primary"
            size="mini"
            :disabled="idBtnDisabled"
            @click="addDialogVisible = true"
          >添加参数</el-button>
          <!-- 展示已有的'动态参数'的表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开列: 用于展示 attributes 的 attr_vals属性值 -->
            <!-- 注意: 数据库返回的 attr_vals 的值是 一个以空格隔开各子字符串的 字符串,
                因此要在获取attr_vals 后,要先用空格作为分割符,将其分割成一个个子字符串,
                分割的结果是一个数组, 重新赋给 attr_vals, 此时 attr_vals变成了一个数组.
                此操作在 getParamsData() 中完成
            -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <!-- 数据库返回的 scope.row.attr_vals 原先是一个以空格隔开各
                标签的字符串,经过 getParamsData()后变成了一个数组-->
                <el-tag
                  class="el-tag-attr_vals"
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleTagsClose(index, scope.row)"
                >{{item}}</el-tag>

                <!-- 添加新的Tag -->
                <!-- 
                  @keyup.enter.native: 按键盘上有'Enter'时触发事件
                  
                  说明: scope.row.inputVisible
                        inputVisible 这个值 不是 scope.row 原本就具有的,
                        inputVisible属性是在 getParamsData()中绑定才有的.
                        同理,inputValue属性也是在 getParamsData()中绑定才有的.
                    添加该属性的原因:
                        为每一个参数[动态参数/静态属性]都添加一个 'inputVisible''inputValue',
                        来控制每一个参数的添加按钮和输入值, 这样可以使参数与参数之间的添加事件
                        不会互相影响.
                  el-input 与 el-button 通过scope.row.inputVisible来切换显示:
                    开始时是 显示'el-button',当点击'el-button'后, 在 @click="showInput(scope.row)"
                  中使得 row.inputVisible = true ,并让'el-input'自动获取焦点, 显示 'el-input',
                  只要用户让'el-input'失去焦点 或 按下 'Enter',就执行 handleInputConfirm(scope.row),
                  在此方法中,根据用户输入来执行对应的操作,并重新显示 'el-button'
                -->
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeAtrributeById(scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加'静态属性'的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- '添加属性'的按钮 -->
          <el-button
            class="add_params_btn"
            type="primary"
            size="mini"
            :disabled="idBtnDisabled"
            @click="addDialogVisible = true"
          >添加属性</el-button>
          <!-- 展示已有的'静态属性'的表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <!-- 数据库返回的 scope.row.attr_vals 原先是一个以空格隔开各
                标签的字符串,经过 getParamsData()后变成了一个数组-->
                <el-tag
                  class="el-tag-attr_vals"
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleTagsClose(index, scope.row)"
                >{{item}}</el-tag>

                <!-- 添加新的Tag -->
                <!-- 
                  @keyup.enter.native: 按键盘上有'Enter'时触发事件
                  
                  说明: scope.row.inputVisible
                        inputVisible 这个值 不是 scope.row 原本就具有的,
                        inputVisible属性是在 getParamsData()中绑定才有的.
                        同理,inputValue属性也是在 getParamsData()中绑定才有的.
                    添加该属性的原因:
                        为每一个参数[动态参数/静态属性]都添加一个 'inputVisible''inputValue',
                        来控制每一个参数的添加按钮和输入值, 这样可以使参数与参数之间的添加事件
                        不会互相影响.
                  el-input 与 el-button 通过scope.row.inputVisible来切换显示:
                    开始时是 显示'el-button',当点击'el-button'后, 在 @click="showInput(scope.row)"
                  中使得 row.inputVisible = true ,并让'el-input'自动获取焦点, 显示 'el-input',
                  只要用户让'el-input'失去焦点 或 按下 'Enter',就执行 handleInputConfirm(scope.row),
                  在此方法中,根据用户输入来执行对应的操作,并重新显示 'el-button'
                -->
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeAtrributeById(scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数的对话框: 添加'动态参数' 或 '静态属性'都共用这个对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addConfirm">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑参数的对话框 -->
    <!-- close-on-click-modal : 是否可以通过点击 modal 关闭 Dialog(默认true) -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      :close-on-click-modal="false"
      @close="editDialogClosed"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有的商品分类列表
      cateList: [],
      // Cascader 中被选中的分类ID
      selectedKeys: [],
      // Cascader 级联选择器- props属性配置
      cascaderProps: {
        // 次级菜单的展开方式: click / hover
        expandTrigger: 'hover',
        // value: 指定 选项的值 为 选项对象的某个属性值[string]
        value: 'cat_id',
        // label: 指定 选项标签 为 选项对象的某个属性值[string]
        label: 'cat_name',
        // children: 指定 选项的子选项 为 选项对象的某个属性值
        children: 'children',
        // 让父子节点不取消关联，不能选择任意一级选项,只能选择没有子结点的选项
        checkStrictly: false
      },
      // Tabs 标签页中 被激活的页签[通过name来绑定,默认是'first']
      // sel | [only,many] | 不能为空,通过 only 或 many 来获取分类静态参数还是动态参数
      activeName: 'many',
      // 存储'动态参数'列表的数组,在 handleChange()中初始化
      manyTableData: [],
      // 存储'静态属性'列表的数组,在 handleChange()中初始化
      onlyTableData: [],
      // 控制'添加参数的对话框'的展开与关闭
      addDialogVisible: false,
      // 添加[动态参数/静态属性]的表单数据对象
      addForm: {
        attr_name: ''
      },
      // 添加[动态参数/静态属性]的表单数规则验证对象
      addFormRules: {
        attr_name: [
          {
            required: true,
            message: '请输入名称',
            trigger: 'blur'
          }
        ]
      },
      // 控制'编辑参数的对话框'的展开与关闭
      editDialogVisible: false,
      // 修改[动态参数/静态属性]的表单数据对象, 在showEditDialog()中初始化
      editForm: {},
      // 修改[动态参数/静态属性]的表单数规则验证对象
      editFormRules: {
        attr_name: [
          {
            required: true,
            message: '请输入名称',
            trigger: 'blur'
          }
        ]
      },
      // 控制按钮与文本框的切换显示
      inputVisible: false,
      // 文本框中输入的内容
      inputValue: ''
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // ===== 获取所有的商品分类列表 =====
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败')
      }
      this.cateList = res.data
      // console.log(this.cateList)
    },
    // ===== 当在级联框中选择了某分类[选择的分类发生变化],执行: =====
    handleChange() {
      this.getParamsData()
    },
    // ===== Tabs 标签页中点击事件处理函数 =====
    handleTabClick() {
      // console.log(this.activeName)
      this.getParamsData()
    },
    // ===== 获取'动态参数' 或 '静态属性': 只要 所选的的三级分类发生改变 或 标签页发生切换 就执行 =====
    async getParamsData() {
      // 在 Cate.vue中已经知道 selectedKeys数组的长度正好代表被选中选项的层级
      // 如果选中的不是第三级分类
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // console.log(this.selectedKeys)
      // 根据所选的三级分类的ID 和 当前所处的面板,获取对应分类的动态参数和静态属性
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        { params: { sel: this.activeName } }
      )
      var descripStr = this.cateId === 'many' ? '动态参数' : '静态属性'
      if (res.meta.status !== 200) {
        return this.$message.error('获取' + descripStr + '失败')
      }
      // ----------------- 处理 attr_vals 的相关方法 -----------------
      // 用空格作为分割符,将其分割成一个个子字符串,分割的结果是一个数组,重新赋给 item.attr_vals
      res.data.forEach(item => {
        // 空字符串的分割结果是一个包含空元素的数组[有一个元素,元素值为空],
        // 此时要去掉: 不应该对空字符串也进行分割, 直接赋给空数组[没有元素]即可
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本框的显示与隐藏[默认'隐藏']
        item.inputVisible = false
        // 文本框中输入的值
        item.inputValue = ''
      })
      // ----------------- 处理 attr_vals 的相关方法 END-----------------
      // console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // ===== 关闭'添加参数的对话框'后,执行 =====
    addDialogClosed() {
      // 重置'添加参数的对话框'的表单数据对象
      this.$refs.addFormRef.resetFields()
    },
    // ===== 点击'添加参数的对话框'的确认按钮后,执行 =====
    addConfirm() {
      this.$refs.addFormRef.validate(async valid => {
        // 如果'添加表单'addForm 不通过 数据验证规则,返回
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        // 添加失败
        if (res.meta.status !== 201) {
          return this.$message.error('添加' + this.titleText + '失败')
        }
        // 添加成功
        this.$message.success('添加' + this.titleText + '成功')
        // 关闭'添加参数的对话框'
        this.addDialogVisible = false
        // 刷新参数数据
        this.getParamsData()
      })
    },
    // ===== 点击'编辑'按钮时,展示'编辑参数的对话框',并初始化 editForm =====
    // attributes: 被编辑的参数对象
    async showEditDialog(attributes) {
      this.attrId = attributes.attr_id
      console.log(this.attrId)
      // 根据参数ID查询参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attributes.attr_id}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取' + this.titleText + '失败')
      }
      this.editForm = res.data
      // 获取成功,展示'编辑参数的对话框'
      this.editDialogVisible = true
    },
    // ===== 关闭'编辑参数的对话框'后,执行 =====
    editDialogClosed() {
      // 重置'编辑参数的对话框'的表单数据对象
      this.$refs.editFormRef.resetFields()
    },
    // ===== 点击'编辑参数的对话框'的确认按钮后,执行 =====
    editConfirm() {
      this.$refs.editFormRef.validate(async valid => {
        // 如果'添加表单'addForm 不通过 数据验证规则,返回
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        )
        // 添加失败
        if (res.meta.status !== 200) {
          return this.$message.error('修改' + this.titleText + '失败')
        }
        // 添加成功
        this.$message.success('修改' + this.titleText + '成功')
        // 关闭'添加参数的对话框'
        this.editDialogVisible = false
        // 刷新参数数据
        this.getParamsData()
      })
    },
    // ===== 点击'删除'的按钮后,执行: 根据 attr_id删除参数[动态参数/静态属性]] =====
    async removeAtrributeById(attributes) {
      // 弹框访问用户是否删除MessageBox
      const confirmResult = await this.$confirm(
        '此操作将删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 如果确认删除,则返回值为 'confirm'
      // 如果取消删除,则返回值为 'cacel'
      console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      // 确认删除: 执行删除操作
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attributes.attr_id}`
      )
      // 删除不成功
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败')
      }
      // 删除成功
      this.$message.success('删除参数成功')
      // 更新参数列表
      this.getParamsData()
    },
    // --------------- 处理 attr_vals 的相关方法/函数 ---------------
    //  ===== 把'移除'或 '添加' 标签的结果持久化到数据库 =====
    async saveAttrVals(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          // 要把attr_vals重新用空格拼接成字符串再持久化
          attr_vals: row.attr_vals.join(' ')
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数属性失败')
      }
      this.$message.success('修改参数属性成功')
    },
    // ===== 点击'移除'标签后,执行: 删除标签 =====
    /* index: 是被删除标签对应的下标索引, row: 是 attribute对象 */
    handleTagsClose(index, row) {
      // 删除下标索引为index的标签元素
      row.attr_vals.splice(index, 1)
      // 把结果持久化到数据库[该保存过程同 handleInputConfirm(row) 中的保存过程]:
      this.saveAttrVals(row)
    },
    // ===== '输入文本框'失去焦点 或 按下 'Enter',执行: =====
    /* 根据用户输入内容处理是否添加 '新标签': attr_vals */
    handleInputConfirm(row) {
      // 文本框的输入内容非法[为空]
      if (row.inputValue.trim().length === 0) {
        // 重置文本框输入内容为空
        row.inputValue = ''
        // 隐藏文本框
        row.inputVisible = false
        // 输入的内容非法,不做处理,直接返回
        return
      }
      // 如果没有 return,则对输入的内容作后续处理
      // 把文本框的内容存入数组 attr_vals[此时页面会发生更新]
      row.attr_vals.push(row.inputValue.trim())
      // 重置文本框输入内容为空
      row.inputValue = ''
      // 隐藏文本框
      row.inputVisible = false
      // 把数据持久化到数据库
      this.saveAttrVals(row)
    },
    // 点击按钮,展示文本框
    showInput(row) {
      row.inputVisible = true
      // $nextTick( ) 作用: 当页面被重新渲染完毕后,才会执行 指定的回调函数
      this.$nextTick(_ => {
        // 让文本框自动获得焦点
        /* 为什么要把 '让文本框自动获得焦点'的功能函数放在 函数$nextTick() 中?
          解析: 当点击 '+ New Tag' 按钮时, 会执行: showInput(),
                第一句: row.inputVisible = true
                    此时页面发生变化要重新渲染: 即将要隐藏 '+ New Tag' 按钮, 显示 '文本输入框'
                此时,如果执行: 
                    this.$refs.saveTagInput.$refs.input.focus()
                会发生错误.
                错误原因:
                    页面还没有渲染完毕,引用 saveTagInput 指向的输入框还没有渲染出来,
                    换言之,即是页面上根本 还没有出现 引用-saveTagInput, 你调用不存在
                    的东西肯定出错.
                因此:
                    必须保证页面已经渲染完成后,再执行:
                       this.$refs.saveTagInput.$refs.input.focus()
                    也就是,把上句作为 $nextTick()的回调函数即可.
        */
        this.$refs.saveTagInput.$refs.input.focus()
      })
    }
    // --------------- 处理 attr_vals 的相关方法/函数 END ---------------
  },
  // 计算属性
  computed: {
    // ===== 如果'添加按钮'被禁用,则返回 true, 否则返回 false =====
    idBtnDisabled() {
      // 如果选择的分类不是三级分类,则禁用
      if (this.selectedKeys.length !== 3) {
        return true
      }
      return false
    },
    // ===== 获取当前选中的三级分类ID =====
    cateId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      return null
    },
    // ===== 动态计算'添加参数的对话框'的标题 =====
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.to_isolated_with_alert {
  margin-top: 15px;
  span {
    margin-right: 10px;
  }
}

.add_params_btn {
  margin-bottom: 10px;
}

.el-tag-attr_vals {
  margin-right: 15px;
  margin-bottom: 15px;
}

.input-new-tag {
  width: 150px;
}

.el-input__inner {
  width: 300px !important;
}
</style>
