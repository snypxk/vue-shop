<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <!-- 头像图片 -->
        <img src="../assets/logo.png" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>

    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse" v-text="toggleShape"></div>
        <!-- 侧边栏菜单区: 
        active-text-color: 当前激活菜单的文字颜色（仅支持 hex 格式）
        unique-opened是否只保持一个子菜单的展开
        collapse: 是否折叠[默认 false]
        collapse-transition: 是否开启折叠动画[默认true]
        router: 是否使用 vue-router 的模式，启用该模式会在激活导航时以 index 作为 path 进行路由跳转
        default-active: 当前激活菜单的 index-->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>

            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/' + subItem.path)"
            >
              <!-- 二级菜单的模板区域 -->
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>

      <!-- 右侧内容主体 -->
      <el-main>
        <!-- 子路由点位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单
      menuList: [],
      // 一级菜单图标
      iconsObj: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      // 是否折叠
      isCollapse: false,
      toggleShape: '折叠',
      // 被激活的链接地址
      activePath: ''
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    // 基于 token 的方式实现退出比较简单，只需要销毁本地的 token 即可。
    // 这样，后续的请求就不会携带token ，必须重新登录生成一个新的 token 之后才可以访问页面。
    logout() {
      // 清空会话区域的token数据
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取所有菜单[一级和二级]
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      // 如果获取菜单失败: 提示失败信息
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // console.log(res)
      this.menuList = res.data
    },
    // 点击按钮，切换菜单的折叠与展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
      this.toggleShape = '展开'
    },
    // 保存链接的激活状态
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}

.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  /* align-items 属性定义flex子项在flex容器的当前行的侧轴（纵轴）方向上的对齐方式.
     align-items: stretch[默认值]|center|flex-start|flex-end|baseline|initial|inherit;
  */
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}

.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}

.el-main {
  background-color: #eaedf1;
}

.iconfont {
  margin-right: 10px;
}

.el-header img {
  width: 50px;
  height: auto;
  border-radius: 50%;
  background-color: #eee;
  box-shadow: 0 0 10px rgb(78, 233, 78);
}

// 折叠按钮
.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
