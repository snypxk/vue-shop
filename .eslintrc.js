module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'space-before-function-paren': 0,
    'no-trailing-spaces': 0,
    'object-curly-spacing': 0,
    'keyword-spacing': 0,
    'no-tabs': 0,
    'no-useless-return': 0,
    'no-multiple-empty-lines': 0
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
