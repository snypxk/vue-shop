<template>
  <div>
    <!-- Breadcrumb面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button class="addrolebtn" type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <!-- 
        border: 给表格列增加分割线
        stripe: 隔行变色
      -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- el-row: 把每一行分成24列 -->
            <!-- :class="['bdbottom', i === 0 ? 'bdtop' : '']" 
                表示给每一行加一个下底线, 如果是第一行, 再加一个上底线
            -->
            <el-row
              :class="['bdbottom', i === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(firstRight, i) in scope.row.children"
              :key="firstRight.id"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag
                  type="primary"
                  closable
                  @close="removeRightById(scope.row, firstRight.id)"
                >{{firstRight.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环 嵌套渲染二级权限 -->
                <el-row
                  :class="[j === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(secondRight, j) in firstRight.children "
                  :key="secondRight.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, secondRight.id)"
                    >{{secondRight.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 通过for循环渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      v-for="thirdRight in secondRight.children "
                      :key="thirdRight.id"
                      type="warning"
                      closable
                      @close="removeRightById(scope.row, thirdRight.id)"
                    >{{thirdRight.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>{{scope.row}}</pre>该标签可以格式化JSON字符串再输出 -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!-- 编辑按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditRoleDialog(scope.row)"
            >编辑</el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeRoleById(scope.row.id)"
            >删除</el-button>
            <!-- 分配权限按钮: scope.row 代表当前行数据 -->
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色的对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible"
      width="50%"
      @close="addRoleDialogClosed"
    >
      <!-- 内容主体区
        addForm: 添加用户的表单数据对象
        addFormRules: 添加用户的表单数据规则验证对象
      -->
      <el-form :model="addRoleForm" :rules="roleFormRules" ref="addRoleFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色的对话框 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="editRoleDialogVisible"
      width="50%"
      @close="editRoleDialogClosed"
    >
      <!-- 内容主体区 -->
      <el-form
        :model="editRoleForm"
        :rules="roleFormRules"
        ref="editRoleFormRef"
        label-width="100px"
      >
        <!-- 角色名称 -->
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <!-- 邮箱 -->
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRigthDialogClosed"
    >
      <!-- 
        node-key：每个树节点用来作为唯一标识的属性，整棵树应该是唯一的
        default-expand-all: 是否默认展开所有节点
        default-checked-keys: 默认勾选的节点的 key 的数组
      -->
      <el-tree
        :data="rightList"
        :props="treeProps"
        ref="treeRef"
        show-checkbox
        node-key="id"
        :default-expand-all="true"
        :default-checked-keys="defkeys"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色列表数据
      roleList: [],
      // 控制展示修改权限的对话框
      setRightDialogVisible: false,
      // 所有的权限数据
      rightList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        // Any Preference By : https://element.eleme.cn/#/zh-CN/component/tree#fang-fa
        // label: 指定节点标签 为 节点对象的某个属性值 [即显示哪个字段]
        // children: 指定子树 为 节点对象的某个属性值
        label: 'authName',
        children: 'children'
      },
      // 打开'分配权限对话框'时默认勾选的节点的 key 的数组
      defkeys: [],
      // 当前即将分配权限的角色ID
      roleId: '',
      // 控制展示'编辑角色的对话框'
      editRoleDialogVisible: false,
      // 被编辑的角色对象[先根据Id查询得到角色对象然后赋给 editRoleForm]
      editRoleForm: {},
      // 角色表单验证规则
      roleFormRules: {
        // 角色名称验证规则
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        // 角色描述证规则
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      // 添加角色的表单数据对象
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 控制展示'添加角色的对话框'
      addRoleDialogVisible: false
    }
  },
  created() {
    // 获取所有角色列表数据
    this.getRolesList()
  },
  methods: {
    // 获取所有角色列表数据
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      // 获取失败
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      // 获取成功
      this.roleList = res.data
      // console.log(this.roleList)
    },
    // 根据ID删除权限: - 请求路径：roles/:roleId/rights/:rightId
    async removeRightById(role, thirdRightId) {
      console.log(role)
      // 弹框访问用户是否删除MessageBox
      const confirmReslut = await this.$confirm(
        '此操作将删除该权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 取消删除
      if (confirmReslut !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      // 确认删除
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${thirdRightId}`
      )
      // 删除失败
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      // 刷新权限数据
      role.children = res.data
      // 提示删除成功
      this.$message.success('删除权限成功')
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      // 保存当前角色的ID
      this.roleId = role.id
      // 获取权限列表数据[树型结构]
      const { data: res } = await this.$http.get('rights/tree')
      // 获取权限数据失败
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败')
      }
      // 获取成功
      // 把获取的权限数据保存到data中
      this.rightList = res.data
      // console.log(this.rightList)
      // 递归获取三级节点的ID
      this.getLeafKeys(role, this.defkeys)
      // 展示对话框
      this.setRightDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限的id,并保存到 defkeys中
    getLeafKeys(node, arr) {
      // 如果当前节点是三级节点[三级节点的 children 为空]
      if (!node.children) {
        return arr.push(node.id)
      }
      // 如果当前节点不是三级节点，则获取其所有下一子节点
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 监听分配权限对话框的关闭事件：要清空 this.defkeys
    setRigthDialogClosed() {
      /* 关闭对话框前要清空defkeys
        如果不清空，当为某一角色A分配权限时，此数组 defkeys 会保存有数据; 
        当再为某一角色B分配权限时，defkeys中的数据会导致'分配权限对话框'展开时选中角色B原先没有的权限而导致出错 */
      this.defkeys = []
    },
    // '分配权限对话框'的确认按钮监听事件：为角色添加权限
    async allotRights() {
      /* Tree 拥有如下方法：
        getCheckedKeys():
            作用 - 若节点可被选择（即 show-checkbox 为 true）,则返回目前被选中的节点的 key 所组成的数组
            参数 - (leafOnly) 接收一个 boolean 类型的参数，若为 true 则仅返回被选中的叶子节点的 keys，默认值为 false
        getHalfCheckedKeys(): 
            作用 - 若节点可被选择（即 show-checkbox 为 true），则返回目前半选中的节点[半选中的节点 在三层树中 则是指 第一层和第二层结点]的 key 所组成的数组
        */
      // ... :展开运算符, 用于把某一数组或对象展开插入到某一数组中
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // 用逗号把数组keys的元素拼接成一个字符串：'e1,e2,e3,e4,..'
      const idStr = keys.join(',')
      // 发送持久化授权请求
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      // 分配权限失败
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      // 分配权限成功
      this.$message.success('分配权限成功')
      // 重新获取角色权限数据
      this.getRolesList()
      // 关闭'分配权限对话框'
      this.setRightDialogVisible = false
    },
    // 点击'编辑'按钮: 根据ID查询角色信息,并展现'编辑角色的对话框'
    async showEditRoleDialog(role) {
      this.roleId = role.id
      // 根据ID查询角色信息
      const { data: res } = await this.$http.get('roles/' + this.roleId)
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色信息失败')
      }
      this.editRoleForm = res.data
      // console.log(this.editRoleForm)
      // 打开'分配权限对话框'
      this.editRoleDialogVisible = true
    },
    // '分配权限对话框'关闭后,重设还原相关的数据值
    editRoleDialogClosed() {
      this.$refs.editRoleFormRef.resetFields()
    },
    // 点击'分配权限对话框'中的 确定按钮: 把编辑后的角色持久化到数据库
    async editRoleInfo() {
      this.$refs.editRoleFormRef.validate(async valid => {
        console.log(valid)
        // 如果验证不通过,返回
        if (!valid) return
        // 验证通过,则发起添加用户的网络请求
        const { data: res } = await this.$http.put('roles/' + this.roleId, {
          roleName: this.editRoleForm.roleName,
          roleDesc: this.editRoleForm.roleDesc
        })
        if (res.meta.status !== 200) {
          this.$message.error('修改角色失败')
        }
        this.$message.success('修改角色成功')
        // 添加成功后,隐藏'分配权限对话框'
        this.editRoleDialogVisible = false
        // 刷新用户列表: 重新获取数据
        this.getRolesList()
      })
    },
    // 根据ID删除角色
    async removeRoleById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
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
      const { data: res } = await this.$http.delete('roles/' + id)
      // 删除不成功
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败')
      }
      // 删除成功
      this.$message.success('删除角色成功')
      // 更新用户列表
      this.getRolesList()
    },
    // 监听添加角色对话框的关闭事件: 实现添加角色表单的重置功能
    addRoleDialogClosed() {
      this.$refs.addRoleFormRef.resetFields()
    },
    // 点击'添加角色的对话框'中的 确定按钮: 把添加角色持久化到数据库
    async addRole() {
      this.$refs.addRoleFormRef.validate(async valid => {
        console.log(valid)
        // 如果验证不通过,返回
        if (!valid) return
        // 验证通过,则发起添加角色的网络请求
        const { data: res } = await this.$http.post('roles/', this.addRoleForm)
        if (res.meta.status !== 200) {
          this.$message.error('添加角色失败')
        }
        this.$message.success('添加角色成功')
        // 添加成功后,隐藏'添加角色的对话框'
        this.addRoleDialogVisible = false
        // 刷新角色列表: 重新获取数据
        this.getRolesList()
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

//居中显示权限标签
.vcenter {
  display: flex;
  align-items: center;
}

.addrolebtn {
  margin-top: 0;
  margin-bottom: 7px;
}
</style>
