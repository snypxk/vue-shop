// 这里是项目发布阶段使用的插件: 去除所有的'console'语句
let transformRemoveConsolePlugin = []
if (process.env.NODE_ENV === 'production') {
  transformRemoveConsolePlugin.push('transform-remove-console')
}

module.exports = {
  'presets': [
    '@vue/cli-plugin-babel/preset'
  ],
  'plugins': [
    [
      'component',
      {
        'libraryName': 'element-ui',
        'styleLibraryName': 'theme-chalk'
      }
    ],
    ...transformRemoveConsolePlugin
  ]
}
