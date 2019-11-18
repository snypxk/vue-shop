<template>
  <!-- 本组件需要安装运行依赖: echarts -->
  <div>
    <!-- Breadcrumb面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Card 卡片视图区域 -->
    <el-card>
      <el-collapse v-model="activeNames" @change="handleChange">
        <el-collapse-item title="用户来源 - 折线图" name="1">
          <!-- 2.为ECharts准备一个具备大小（宽高）的Dom -->
          <div id="user_resource" style="width: 800px; height: 400px;"></div>
        </el-collapse-item>
        <el-collapse-item title="未来一周气温变化 - 折线图/柱状图[可以切换]" name="2">
          <div id="temperature_change" style="width: 800px; height: 700px;"></div>
        </el-collapse-item>
        <el-collapse-item title="某站点用户访问来源 - 饼状图" name="3">
          <div id="visit_source" style="width: 500px; height: 500px;"></div>
        </el-collapse-item>
        <el-collapse-item title="某站点用户访问来源 - 环形图" name="4">
          <div id="visit_source_cycle" style="width: 500px; height: 500px;"></div>
        </el-collapse-item>
        <el-collapse-item title="折线图堆叠" name="5">
          <div id="five" style="width: 900px; height: 700px;"></div>
        </el-collapse-item>
        <el-collapse-item title="正负条形图" name="6">
          <div id="six" style="width: 900px; height: 500px;"></div>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script>
// 1.导入 echarts
import echarts from 'echarts'
import _ from 'lodash'

export default {
  data() {
    return {
      // 当前激活的面板(如果是手风琴模式，绑定值类型需要为string，否则为array)
      activeNames: ['1'],
      // 从数据库获得的数据 - 用户来源折线图
      options_user_resource: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      },
      // 未来一周气温变化 - 折线图/柱状图[可以切换]
      options_optitemperature_changeon: {
        title: {
          text: '未来一周气温变化',
          subtext: '纯属虚构'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['最高气温', '最低气温']
        },
        toolbox: {
          show: true,
          feature: {
            dataZoom: {
              yAxisIndex: 'none'
            },
            dataView: { readOnly: false },
            magicType: { type: ['line', 'bar'] },
            restore: {},
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value} °C'
          }
        },
        series: [
          {
            name: '最高气温',
            type: 'line',
            data: [11, 11, 15, 13, 12, 13, 10],
            markPoint: {
              data: [
                { type: 'max', name: '最大值' },
                { type: 'min', name: '最小值' }
              ]
            },
            markLine: {
              data: [{ type: 'average', name: '平均值' }]
            }
          },
          {
            name: '最低气温',
            type: 'line',
            data: [1, -2, 2, 5, 3, 2, 0],
            markPoint: {
              data: [{ name: '周最低', value: -2, xAxis: 1, yAxis: -1.5 }]
            },
            markLine: {
              data: [
                { type: 'average', name: '平均值' },
                [
                  {
                    symbol: 'none',
                    x: '90%',
                    yAxis: 'max'
                  },
                  {
                    symbol: 'circle',
                    label: {
                      normal: {
                        position: 'start',
                        formatter: '最大值'
                      }
                    },
                    type: 'max',
                    name: '最高点'
                  }
                ]
              ]
            }
          }
        ]
      },
      // 某站点用户访问来源 - 饼状图
      options_visit_source: {
        title: {
          text: '某站点用户访问来源',
          subtext: '纯属虚构',
          x: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎']
        },
        series: [
          {
            name: '访问来源',
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: [
              { value: 335, name: '直接访问' },
              { value: 310, name: '邮件营销' },
              { value: 234, name: '联盟广告' },
              { value: 135, name: '视频广告' },
              { value: 1548, name: '搜索引擎' }
            ],
            itemStyle: {
              emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      },
      // 某站点用户访问来源 - 环形图
      options_visit_source_cycle: {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          x: 'left',
          data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎']
        },
        series: [
          {
            name: '访问来源',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
              normal: {
                show: false,
                position: 'center'
              },
              emphasis: {
                show: true,
                textStyle: {
                  fontSize: '30',
                  fontWeight: 'bold'
                }
              }
            },
            labelLine: {
              normal: {
                show: false
              }
            },
            data: [
              { value: 335, name: '直接访问' },
              { value: 310, name: '邮件营销' },
              { value: 234, name: '联盟广告' },
              { value: 135, name: '视频广告' },
              { value: 1548, name: '搜索引擎' }
            ]
          }
        ]
      },
      // 折线图堆叠
      options_five: {
        title: {
          text: '折线图堆叠'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['邮件营销', '联盟广告', '视频广告', '直接访问', '搜索引擎']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '邮件营销',
            type: 'line',
            stack: '总量',
            data: [120, 132, 101, 134, 90, 230, 210]
          },
          {
            name: '联盟广告',
            type: 'line',
            stack: '总量',
            data: [220, 182, 191, 234, 290, 330, 310]
          },
          {
            name: '视频广告',
            type: 'line',
            stack: '总量',
            data: [150, 232, 201, 154, 190, 330, 410]
          },
          {
            name: '直接访问',
            type: 'line',
            stack: '总量',
            data: [320, 332, 301, 334, 390, 330, 320]
          },
          {
            name: '搜索引擎',
            type: 'line',
            stack: '总量',
            data: [820, 932, 901, 934, 1290, 1330, 1320]
          }
        ]
      },
      // 正负条形图
      options_bar: {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        legend: {
          data: ['利润', '支出', '收入']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'value'
          }
        ],
        yAxis: [
          {
            type: 'category',
            axisTick: { show: false },
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
          }
        ],
        series: [
          {
            name: '利润',
            type: 'bar',
            label: {
              normal: {
                show: true,
                position: 'inside'
              }
            },
            data: [200, 170, 240, 244, 200, 220, 210]
          },
          {
            name: '收入',
            type: 'bar',
            stack: '总量',
            label: {
              normal: {
                show: true
              }
            },
            data: [320, 302, 341, 374, 390, 450, 420]
          },
          {
            name: '支出',
            type: 'bar',
            stack: '总量',
            label: {
              normal: {
                show: true,
                position: 'left'
              }
            },
            data: [-120, -132, -101, -134, -190, -230, -210]
          }
        ]
      }
    }
  },
  created() {},
  // 钩子函数: 此时页面的所有元素DOM已经被渲染完毕
  async mounted() {
    // ------------------- 用户来源折线图 ----------------------
    // 3.基于准备好的dom，初始化echarts实例
    var userResource = echarts.init(document.getElementById('user_resource'))
    // 4.指定图表的配置项和数据
    const { data: res } = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200) {
      return this.$message.error('获取拆线图数据失败')
    }
    // 使用lodash合并两个对象返回一个新对象
    const result = _.merge(res.data, this.options_user_resource)
    // 5.使用刚指定的配置项和数据显示图表。
    userResource.setOption(result)
    // ------------------- 用户来源折线图 END-------------------
  },
  methods: {
    // 当前激活面板改变时触发(如果是手风琴模式，参数 activeNames 类型为string，否则为array)
    handleChange() {
      // console.log(this.activeNames)
      var chartDom
      if (this.activeNames[this.activeNames.length - 1] === '2') {
        chartDom = echarts.init(document.getElementById('temperature_change'))
        chartDom.setOption(this.options_optitemperature_changeon)
      } else if (this.activeNames[this.activeNames.length - 1] === '3') {
        chartDom = echarts.init(document.getElementById('visit_source'))
        chartDom.setOption(this.options_visit_source)
      } else if (this.activeNames[this.activeNames.length - 1] === '4') {
        chartDom = echarts.init(document.getElementById('visit_source_cycle'))
        chartDom.setOption(this.options_visit_source_cycle)
      } else if (this.activeNames[this.activeNames.length - 1] === '5') {
        chartDom = echarts.init(document.getElementById('five'))
        chartDom.setOption(this.options_five)
      } else if (this.activeNames[this.activeNames.length - 1] === '6') {
        chartDom = echarts.init(document.getElementById('six'))
        chartDom.setOption(this.options_bar)
      }
    }
  }
}
</script>

<style lang="less" scoped>
</style>
