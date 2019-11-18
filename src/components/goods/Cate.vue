<template>
  <!-- 本Vue程序需要使用依赖: table-with-tree-grid 2019/11/13-->
  <div>
    <!-- Breadcrumb面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Card 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格区域: 这里使用 vue-table-with-tree-grid 插件注册的全局组件: tree-table
        说明:
        :data            [说明]表格各行的数据     	[类型]Array    
        :columns	       [说明]表格各列的配置	      [类型]Array      
        :selection-type	 [说明]是否为多选类型表格	  [类型]Boolean {简言之: 是否需要复选框}
        :expand-type     [说明]是否为展开行类型表格 [类型]Boolean
        :show-index	     [说明]是否显示数据索引     [类型]Boolean
        index-text	     [说明]数据索引名称	        [类型]String    [默认]'序号'
        :border	         [说明]是否显示纵向边框     [类型]Boolean    [默认]'false'
      -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        index-text="#"
        :border="true"
        class="treeTable"
      >
        <!-- '是否有效'自定义模板 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen;"
          ></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>
        <!-- '排序'自定义模板 -->
        <template slot="order" slot-scope="scope">
          <el-tag type="primary" size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- '操作'自定义模板 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditDialog(scope.row.cat_id)"
          >编辑</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteCategoryById(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 对话框区域 -->
    <!-- '添加分类对话框' -->
    <el-dialog title="添加分类" :visible.sync="addDialogVisible" width="50%" @close="addHandleClose">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addForm.cat_name"></el-input>
        </el-form-item>
        <!-- 注意：因为分类总共有3级，因此父级分类只能是在一级、二级中选择, cat_pid的值只能是0或1 -->
        <el-form-item label="父级分类：" label-width="100px">
          <!-- Cascader 级联选择器
            v-model: 选中项绑定值
            options: 可选项数据源，键名可通过 Props 属性配置
            change: 当选中节点变化时触发,返回选中节点的值
            clearable: 可清空
          -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            clearable
            placeholder="请选择父级分类"
            @change="handleParentCateChange"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addConfirm">确 定</el-button>
      </span>
    </el-dialog>

    <!-- '编辑分类对话框' -->
    <el-dialog title="添加分类" :visible.sync="editDialogVisible" width="50%" @close="editHandleClose">
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="分类名称: " prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
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
      // 指定查询条件的对象
      queryInfo: {
        // [1,2,3]  【可选参数】值：1，2，3 分别表示显示一层二层三层分类列表
        type: 3,
        // 当前页码值 【可选参数】如果不传递，则默认获取所有分类
        pagenum: 1,
        // 每页显示多少条数据【可选参数】
        pagesize: 5
      },
      // 商品分类的数据列表, 默认为空
      cateList: [],
      // 总数据条数, 默认0
      total: 0,
      // vue-table-with-tree-grid: 指定列信息 [属性:columns]
      /*
        属性	        说明	                    类型	         默认值
        label	      列标题名称	                String  	     ''
        prop	      对应列内容的属性名	         String	        ''
        align	      对应列内容的对齐方式，       String	        'left'
                    可选值有 'center', 'right'	
        headerAlign	对应列标题的对齐方式，       String	        'left'
                    可选值有 'center', 'right'	
        width	      列宽度	                [String, Number]	 'auto'
        minWidth	  列最小宽度	             [String, Number]	 '80px'
        type	      列类型，                    String         ''
                    可选值有 'template'
                    (自定义列模板)	   
        template	  列类型为 'template'         String	       ''
                    (自定义列模板) 时，      
                    对应的作用域插槽（它可以获取到 row, rowIndex, column, columnIndex）名称	
      */
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 将当前列定义为模板列
          type: 'template',
          // 当前这一列使用的模板名称[前提是已经将这一列定义为模板列,即 type: 'template']
          template: 'isok'
        },
        {
          label: '排序',
          // 将当前列定义为模板列
          type: 'template',
          // 当前这一列使用的模板名称[前提是已经将这一列定义为模板列,即 type: 'template']
          template: 'order'
        },
        {
          label: '操作',
          // 将当前列定义为模板列
          type: 'template',
          // 当前这一列使用的模板名称[前提是已经将这一列定义为模板列,即 type: 'template']
          template: 'opt'
        }
      ],
      // 控制'添加分类对话框'的展示与关闭
      addDialogVisible: false,
      // 添加分类的表单数据对象: 在 selectedKeys 改变时便更新addForm
      addForm: {
        // 分类父 ID | 不能为空，如果要添加1级分类，则父分类Id应该设置为  `0`
        cat_pid: 0,
        // 分类名称  | 不能为空
        cat_name: '',
        // 分类层级  | 不能为空，`0`表示一级分类[默认]；`1`表示二级分类；`2`表示三级分类
        cat_level: 0
      },
      // 添加分类的表单数据验证规则对象
      addFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类数据列表对象
      parentCateList: [],
      // Cascader 的props对应的配置选项对象
      cascaderProps: {
        // 次级菜单的展开方式: click / hover
        expandTrigger: 'hover',
        // value: 指定 选项的值 为 选项对象的某个属性值[string]
        value: 'cat_id',
        // label: 指定 选项标签 为 选项对象的某个属性值[string]
        label: 'cat_name',
        // children: 指定 选项的子选项 为 选项对象的某个属性值
        children: 'children',
        // 让父子节点取消关联，选择任意一级选项
        checkStrictly: true
      },
      // Cascader 中被选中的父级分类ID [为什么是一个数组?]
      // 原因: 添加的分类 是三级分类时,此时其父级分类有两个[一级和二级],要用数组保存
      selectedKeys: [],
      // =============== 编辑操作 ===============
      // 控制'编辑分类对话框'的展示与关闭
      editDialogVisible: false,
      // 要被编辑的 分类信息对象, 在展示'编辑分类对话框'时根据ID获取后初始化
      editForm: {}
      // =============== 删除操作 ===============
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // ===== 获取商品分类的数据列表 =====
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败')
      }
      // 把获取到的数据保存到cateList
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // =============== 添加操作 ===============
    // ===== 监听 pagesize 改变 =====
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      // 重新获取分类列数数据
      this.getCateList()
    },
    // ===== 监听 pagenum 改变 =====
    handleCurrentChange(newPagenum) {
      this.queryInfo.pagenum = newPagenum
      // 重新获取分类列数数据
      this.getCateList()
    },
    // ===== 点击'添加分类'按钮, 展示'添加分类对话框' =====
    showAddDialog() {
      // 先获取父级分类列表数据
      this.getParentCateList()
      // 展示对话框
      this.addDialogVisible = true
    },
    // ===== 关闭'添加分类对话框'后[特别是应对用户点输入了内容后击取消的情况], 执行相关的操作 =====
    addHandleClose() {
      // 把 addFormRef引用的输入框内容重新设置为空
      this.$refs.addFormRef.resetFields()
      // 重新设置 selectedKeys 为空
      this.selectedKeys = []
      // 还原'添加表单的addForm'数据
      this.addForm.cat_level = 0
      this.addForm.cat_pid = 0
    },
    // ===== 在'添加分类对话框'的下拉父级分类下拉列表中使用:获取一级和二级分类列表数据 =====
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类列表失败')
      }
      // 把获取到的数据保存到cateList
      this.parentCateList = res.data
      // console.log(this.parentCateList)
    },
    // ===== 选中的父节点 发生改变时: 更新被选中的节点值selectedKeys 和 addForm  =====
    handleParentCateChange() {
      // console.log(this.selectedKeys)
      // 如果 selectedKeys 数组中的长度大于0,证明选择了某个父级分类, 此时要更新 addForm
      if (this.selectedKeys.length > 0) {
        // 父级分类的ID
        /* 如果选择的父类是二级分类,此时selectedKeys有两个值,
           第一个值是一级父类的ID,第二个值是二级父类的ID,
           只需要选择最后一级作为该分类的父类即可.
           即取数组的最后一个值即可.
        */
        this.addForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值: 等级的值有[0,1,2]三个值,
        /* 显然, 如果不选择父级分类,此时 this.selectedKeys.length = 0, 代表为一级分类,
           如果选择一级分类作为父级分类,此时 this.selectedKeys.length = 1,代表二级分类,
           如果选择二级分类作为父级分类,此时 this.selectedKeys.length = 2,代表三级分类,
           由此可看出, 新添加的该商品分类 的等级 对应的就是 selectedKeys的长度
        */
        this.addForm.cat_level = this.selectedKeys.length
      }
    },
    // ===== 点击'添加分类对话框'的确定按钮,把新增的分类数据持久化 =====
    async addConfirm() {
      // console.log(this.addForm)
      const { data: res } = await this.$http.post('categories', this.addForm)
      if (res.meta.status !== 201) {
        return this.$message.error('添加分类失败')
      }
      // 重新获取分类列表数据
      this.getCateList()
      // 关闭'添加分类对话框'
      this.addDialogVisible = false
      // 提示添加成功
      this.$message.success('添加分类成功')
    },
    // =============== 编辑操作 ===============
    async showEditDialog(catId) {
      // 查询要被编辑的分类
      const { data: res } = await this.$http.get('categories/' + catId)
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类失败')
      }
      this.editForm = res.data
      // console.log(this.editForm)
      // 展示'编辑分类对话框'
      this.editDialogVisible = true
    },
    // ===== 关闭'编辑分类对话框'后, 执行相关的操作 =====
    editHandleClose() {
      // 重置编辑分类的表单
      this.$refs.editFormRef.resetFields()
    },
    // ===== 点击'编辑分类对话框'的确定按钮,把修改的分类数据持久化 =====
    async editConfirm() {
      this.$refs.editFormRef.validate(async valid => {
        // console.log(valid)
        // 如果验证不通过,返回
        if (!valid) return
        // 验证通过,则发起修改分类的网络请求
        const { data: res } = await this.$http.put(
          'categories/' + this.editForm.cat_id,
          {
            cat_name: this.editForm.cat_name
          }
        )
        if (res.meta.status !== 200) {
          this.$message.error('修改分类失败')
        }
        this.$message.success('修改分类成功')
        // 添加分类后,关闭'编辑分类对话框''
        this.editDialogVisible = false
        // 刷新分类数据列表: 重新获取数据
        this.getCateList()
      })
    },
    // =============== 删除操作 ===============
    async deleteCategoryById(catId) {
      const confirmResult = await this.$confirm(
        '此操作将删除该分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 如果确认删除,则返回值为 'confirm'
      // 如果取消删除,则返回值为 'cacel'
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      // 确认删除: 执行删除操作
      const { data: res } = await this.$http.delete('categories/' + catId)
      // 删除不成功
      if (res.meta.status !== 200) {
        return this.$message.error('删除分类失败')
      }
      // 删除成功
      this.$message.success('删除分类成功')
      // 更新用户列表
      this.getCateList()
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 10px;
}

.el-cascader {
  width: 100%;
}
</style>
