<template>
  <div>
    <!-- Breadcrumb面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 用一行来布置: 搜索框 + '添加商品' 按钮 -->
      <!-- gutter: 栅格间隔	 [类型]number
           span: row把一行分24列, span代表所占列数
      -->
      <el-row class="el-row-solar-margin-bottom" :gutter="20">
        <el-col :span="8">
          <!-- 搜索框 -->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <!-- '添加商品' 按钮 -->
          <el-button type="primary" @click="toAddGoodsPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- Table 表格区: 显示商品列表数据 -->
      <el-table :data="goodList" border stripe>
        <!-- 第一列: 索引列 -->
        <el-table-column type="index"></el-table-column>
        <!-- 第二列: 商品名称 -->
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <!-- 第三列: 商品价格 -->
        <el-table-column label="商品价格" prop="goods_price" width="80px"></el-table-column>
        <!-- 第四列: 商品重量 -->
        <el-table-column label="商品重量" prop="goods_weight" width="80px"></el-table-column>
        <!-- 第五列: 创建时间 -->
        <el-table-column label="创建时间" prop="add_time" width="160px">
          <template slot-scope="scope">{{scope.row.add_time | dateFormat}}</template>
        </el-table-column>
        <!-- 第六列: 操作 -->
        <el-table-column label="操作" width="120px">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="编辑" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-delete"
                size="mini"
                @click="deleteGoodsById(scope.row.goods_id)"
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
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 获取商品列表数据查询对象
      queryInfo: {
        /*
        | 参数名   | 参数说明     | 备注     |
        | -------- | ------------ | -------- |
        | query    | 查询参数     | 可以为空 |
        | pagenum  | 当前页码     | 不能为空 |
        | pagesize | 每页显示条数 | 不能为空 |
        */
        query: '',
        pagenum: 1,
        pagesize: 8
      },
      // 商品数据列表
      goodList: [],
      // 商品总记录数
      total: 0
    }
  },
  created() {
    this.getGoodList()
  },
  methods: {
    // ===== 获取商品列表数据 =====
    async getGoodList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表数据失败')
      }
      this.goodList = res.data.goods
      this.total = res.data.total
    },
    // ===== 当用户选择的当前显示记录数值[pagesize]改变时执行: 根据新的请求参数重新查询商品列表数据 =====
    handleSizeChange(newSize) {
      // 根据handleSizeChange的回调参数 newSize 更新 this.queryInfo.pagesize
      this.queryInfo.pagesize = newSize
      this.getGoodList()
    },
    // ===== 当用户选择的页码[pagenum]改变时执行: 根据新的请求参数重新查询商品列表数据 =====
    handleCurrentChange(newPage) {
      // 根据handleCurrentChange的回调参数 newPage 更新 this.queryInfo.pagenum
      this.queryInfo.pagenum = newPage
      this.getGoodList()
    },
    // ===== 点击'删除'按钮后: 根据商品ID删除商品 =====
    async deleteGoodsById(goodsId) {
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
      const { data: res } = await this.$http.delete('goods/' + goodsId)
      // 删除不成功
      if (res.meta.status !== 200) {
        return this.$message.error('删除商品失败')
      }
      // 删除成功
      this.$message.success('删除商品成功')
      // 更新商品列表
      this.getGoodList()
    },
    //  ===== 点击'添加商品'按钮后: 由路由导航到添加商品的页面,注意: 此次添加不使用对话框 =====
    toAddGoodsPage() {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang="less" scoped>
.el-pagination {
  margin-top: 15px;
}

.el-row-solar-margin-bottom {
  margin-bottom: 10px;
}
</style>
