<template>
  <div>
    <!-- Breadcrumb面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-row class="el-row-solar-margin-bottom" :gutter="20">
        <el-col :span="8">
          <!-- 搜索框 -->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- Table 表格区: 显示订单列表数据 -->
      <el-table :data="orderList" border stripe>
        <!-- 第一列: 索引列 -->
        <el-table-column type="index"></el-table-column>
        <!-- 第二列: 订单编号 -->
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <!-- 第三列: 订单价格 -->
        <el-table-column label="订单价格" prop="order_price" width="80px"></el-table-column>
        <!-- 第四列: 是否付款 -->
        <el-table-column label="是否付款" prop="pay_status" width="80px">
          <template slot-scope="scope">
            <el-tag type="primary" size="mini" v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="warning" size="mini" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <!-- 第五列: 是否发货 -->
        <el-table-column label="是否发货" prop="is_send" width="80px"></el-table-column>
        <!-- 第六列: 下单时间 -->
        <el-table-column label="下单时间" prop="create_time" width="170px">
          <template slot-scope="scope">{{scope.row.create_time | dateFormat}}</template>
        </el-table-column>
        <!-- 第七列: 操作 -->
        <el-table-column label="操作" width="120px">
          <template>
            <el-tooltip effect="dark" content="地址" placement="top" :enterable="false">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEditLoactionDialog"
              ></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="物流" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-location"
                size="mini"
                @click="showLogisticsDialog"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 底部分页区域 -->
      <!-- 
        @size-change: pageSize 改变时会触发  [回调参数]每页条数
        @current-change: currentPage 改变时会触发 [回调参数]当前页
      -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[8, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>

    <!-- 对话框区域 -->
    <!-- '修改地址对话框' -->
    <el-dialog
      title="修改地址"
      :visible.sync="editLoactionDialogVisable"
      width="50%"
      @close="editLoactionHandleClose"
    >
      <el-form
        :model="editLoactionForm"
        :rules="editLoactionFormRules"
        ref="editLoactionFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县: " prop="address1">
          <el-cascader
            v-model="editLoactionForm.address1"
            :options="cityData"
            :props="{ expandTrigger: 'hover' }"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址: " prop="address2">
          <el-input v-model="editLoactionForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editLoactionDialogVisable = false">取 消</el-button>
        <el-button type="primary" @click="editLoactionConfirm">确 定</el-button>
      </span>
    </el-dialog>

    <!-- '物流对话框': 使用时间线组件:TimeLine -->
    <el-dialog title="物流进度" :visible.sync="logisticsDialogVisable" width="50%" center>
      <el-timeline>
        <!-- 时间线 -->
        <el-timeline-item
          v-for="(item, index) in logisticsData"
          :key="index"
          :timestamp="item.time"
        >{{item.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata.js'

export default {
  data() {
    return {
      // 获取订单列表数据查询对象
      queryInfo: {
        /*
            | 参数名               | 参数说明        | 备注     |
            | -------------------- | --------------- | -------- |
            | query                | 查询参数        | 可以为空 |
            | pagenum              | 当前页码        | 不能为空 |
            | pagesize             | 每页显示条数    | 不能为空 |
            | user_id              | 用户 ID         | 可以为空 |
            | pay_status           | 支付状态        | 可以为空 |
            | is_send              | 是否发货        | 可以为空 |
            | order_fapiao_title   | ['个人','公司'] | 可以为空 |
            | order_fapiao_company | 公司名称        | 可以为空 |
            | order_fapiao_content | 发票内容        | 可以为空 |
            | consignee_addr       | 发货地址        | 可以为空 |
        */
        query: '',
        pagenum: 1,
        pagesize: 8
      },
      // 订单列表数据对象: 在 getOrderList() 初始化
      orderList: [],
      // 查询订单结果的总记录条数: 在 getOrderList() 初始化
      total: 0,
      // 控制'修改地址对话框'的展示与关闭
      editLoactionDialogVisable: false,
      // 修改地址 表单数据对象
      editLoactionForm: {
        address1: [],
        address2: ''
      },
      // 修改地址 表单数据验证规则对象
      editLoactionFormRules: {
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      // 省市联动数据
      cityData: cityData,
      // 控制'物流对话框'的展示与关闭
      logisticsDialogVisable: false,
      // 物流信息列表数据
      logisticsData: []
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    // ====== 获取订单列表数据 =====
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单数据列表失败')
      }
      this.orderList = res.data.goods
      this.total = res.data.total
      // console.log(this.orderList)
    },
    // ===== 当用户选择的当前显示记录数值[pagesize]改变时执行: 根据新的请求参数重新查询订单列表数据 =====
    handleSizeChange(newSize) {
      // 根据handleSizeChange的回调参数 newSize 更新 this.queryInfo.pagesize
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    // ===== 当用户选择的页码[pagenum]改变时执行: 根据新的请求参数重新查询订单列表数据 =====
    handleCurrentChange(newPage) {
      // 根据handleCurrentChange的回调参数 newPage 更新 this.queryInfo.pagenum
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    // ===== 点击'地址'按钮： 显示'修改地址对话框' =====
    showEditLoactionDialog() {
      this.editLoactionDialogVisable = true
    },
    // ===== 点击'修改地址对话框'的确定按钮,执行: [本次只是测试并不真正持久化到数据库] =====
    editLoactionConfirm() {},
    // ===== 关闭'修改地址对话框'后,重置相关数据 =====
    editLoactionHandleClose() {
      this.$refs.editLoactionFormRef.resetFields()
    },
    // ===== 点击'物流'按钮: 显示'物流对话框' =====
    async showLogisticsDialog() {
      // 先获取物流数据
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流信息失败')
      }
      this.logisticsData = res.data
      this.logisticsDialogVisable = true
    }
  }
}
</script>

<style lang="less" scoped>
@import '../../plugins/timeline/timeline.css';
@import '../../plugins/timeline-item/timeline-item.css';

.el-row-solar-margin-bottom {
  margin-bottom: 10px;
}

.el-cascader {
  width: 100%;
}
</style>
