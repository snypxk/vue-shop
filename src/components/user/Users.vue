<template>
  <div>
    <!-- Breadcrumb面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Card 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <!-- 点击添加用户按钮后,执行: addUserDialogVisible = true,此时对话框会显示出来 -->
          <el-button type="primary" @click="addUserDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区 -->
      <el-table :data="userlist">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <!-- 通过作用域插槽接收数据 -->
          <!-- 通过 Scoped slot 可以获取到 row, column, $index 和 store（table 内部的状态管理）的数据
                 可以理解为：
                 userlist是给到table的记录集，scope是table内部基于userlist生成出来的.
                 scope并非是整个table，我们只是能通过{{scope.row}}获得当前的行数据
          -->
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              active-color="#13ce66"
              inactive-color="#DCDFE6"
              @change="userStateChanged(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- '分配角色'按钮: enterable-鼠标是否可进入到 tooltip 中[默认true] -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="showAllotRoleDialog(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <!-- 
          handleSizeChange: 监听 pagesize 改变的事件
          handleCurrentChange: 监听 页码值 改变的事件
      -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
    <!-- 
        visible: 是否显示 Dialog，支持 .sync 修饰符
        @close: Dialog 关闭的回调
    -->
    <el-dialog
      title="添加用户"
      :visible.sync="addUserDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容主体区
        addForm: 添加用户的表单数据对象
        addFormRules: 添加用户的表单数据规则验证对象
      -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editUserDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 内容主体区 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <!-- 用户名不需要验证规则,同时把其禁用,不允许被修改 -->
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <!-- 邮箱 -->
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <!-- 电话 -->
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="allotRoleDialogVisible"
      width="50%"
      @close="allotRoleDialogClosed"
    >
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <p>
          分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="allotRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 对邮箱进行自定义规则
    // rule: 验证规则  value: 需要被验证的那个值  cb: 回调函数
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        // 合法的邮箱: 验证通过
        return cb()
      }
      cb(new Error('请输出合法的邮箱'))
    }
    // 对电话进行自定义规则
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        // 合法的手机号: 验证通过
        return cb()
      }
      cb(new Error('请输出合法的手机号'))
    }
    return {
      // 获取用户列表信息的参数对象
      queryInfo: {
        query: '',
        // 当前页码
        pagenum: 1,
        // 每页显示条数
        pagesize: 2
      },
      userlist: [],
      total: 0,
      // 控制添加用户对话框的显示与隐藏
      addUserDialogVisible: false,
      // 添加用户的表单数据对象
      addForm: {
        // 用户名
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户的表单数据规则验证对象
      addFormRules: {
        // 用户名验证规则
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 5, max: 10, message: '长度在 5 到 10 个字符', trigger: 'blur' }
        ],
        // 密码验证规则
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        // 邮箱验证规则
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        // 电话验证规则
        mobile: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制修改用户对话框的显示与隐藏
      editUserDialogVisible: false,
      // 查询 将要被编辑的 用户信息对象
      editForm: {},
      // 修改用户的表单数据规则验证对象
      editFormRules: {
        // 邮箱验证规则
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        // 电话验证规则
        mobile: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制'分配角色对话框'的打开与关闭
      allotRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 所有角色列表数据
      roleList: [],
      // 已选中的角色的ID值
      selectedRoleId: ''
    }
  },
  created() {
    // 获取用户列表信息
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.userlist = res.data.users
      this.total = res.data.total
      // console.log(res)
    },
    // 监听 pagesize 改变的事件
    handleSizeChange(newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      // 根据新的每页显示的记录数,重新查询数据库
      this.getUserList()
    },
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      // console.log(newPage)
      this.queryInfo.pagenum = newPage
      // 根据新的当前页码,重新查询数据库
      this.getUserList()
    },
    // 监听 switch开关状态的改变
    async userStateChanged(userInfo) {
      // console.log(userInfo)
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        // 更新失败,那么页面上的值也要还原回来
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功')
    },
    // 监听添加用户对话框的关闭事件: 实现添加用户表单的重置功能
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加用户的预验证功能
    addUser() {
      // 参数: valid[命名随你]是一个bool值,如果表单[addFormRef]验证通过则为 true; 反之为 false
      this.$refs.addFormRef.validate(async valid => {
        // console.log(valid)
        // 如果验证不通过,返回
        if (!valid) return
        // 验证通过,则发起添加用户的网络请求
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        // 添加成功后,隐藏添加用户对话框
        this.addUserDialogVisible = false
        // 刷新用户列表: 重新获取数据
        this.getUserList()
      })
    },
    // 展示编辑用户的对话框
    async showEditDialog(id) {
      // console.log(id)
      // 根据ID查询用户信息
      const { data: res } = await this.$http.get('users/' + id)
      // 查询失败
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      // 查询成功: 把查询结果赋给 editForm
      this.editForm = res.data
      this.editUserDialogVisible = true
    },
    // 监听修改用户对话框的关闭事件: 实现修改用户表单的重置功能
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息-持久化到数据库
    editUserInfo() {
      // 表单信息预验证:
      this.$refs.editFormRef.validate(async valid => {
        console.log(valid)
        // 表单规则验证 不通过
        if (!valid) return
        // 表单规则验证 通过: 发起修改用户信息的请求
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        )
        // 修改失败
        if (res.meta.status !== 200) {
          return this.$message.error('修改用户信息失败')
        }
        // 修改成功: 关闭对话框
        this.editUserDialogVisible = false
        // 刷新数据列表
        this.getUserList()
        // 提示修改成功
        this.$message.success('修改用户信息成功')
      })
    },
    // 根据id删除用户
    async removeUserById(id) {
      // console.log(id)
      // 弹框访问是否删除MessageBox
      const confirmResult = await this.$confirm(
        '此操作将删除该用户, 是否继续?',
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
      const { data: res } = await this.$http.delete('users/' + id)
      // 删除不成功
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败')
      }
      // 删除成功
      this.$message.success('删除用户成功')
      // 更新用户列表
      this.getUserList()
    },
    // 展示'分配角色对话框'
    async showAllotRoleDialog(userInfo) {
      this.userInfo = userInfo
      // 在展示对话框之前，获取所有角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.roleList = res.data
      this.allotRoleDialogVisible = true
    },
    // 关闭'分配角色对话框'时的触发事件
    allotRoleDialogClosed() {
      // 重新相关信息
      this.selectedRoleId = ''
      this.userInfo = {}
    },
    // 点击'分配角色对话框'的确定按钮时：执行该函数持久用户信息到数据库
    async allotRole() {
      // 先判断用户是否有选择新角色
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色')
      }
      // 有选择新角色：持久化到数据库
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.selectedRoleId
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('更新角色失败')
      }
      // 重新获取用户列表信息
      this.getUserList()
      // 提示更新角色成功
      this.$message.success('更新角色成功')
      // 关闭'分配角色对话框'
      this.allotRoleDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-pagination {
  margin-top: 15px;
}
</style>
