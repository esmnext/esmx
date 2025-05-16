export default {
    // 继承的基础配置
    extends: [
        import.meta.resolve('stylelint-config-standard'), // 标准配置
        import.meta.resolve('stylelint-config-recess-order'), // CSS 属性排序配置
        import.meta.resolve('stylelint-config-recommended-less'), // Less 推荐配置
        import.meta.resolve('stylelint-config-html'), // HTML 文件中的样式配置
        import.meta.resolve('stylelint-config-recommended-vue') // Vue 文件中的样式配置
    ],
    // 使用的插件
    plugins: [import.meta.resolve('stylelint-order')], // CSS 属性排序插件
    rules: {
        'no-empty-source': null, // 允许空的样式文件
        'selector-pseudo-class-no-unknown': [
            true,
            {
                ignorePseudoClasses: ['deep', 'global'] // 允许使用 :deep 和 :global 伪类(Vue 特性)
            }
        ],
        'declaration-property-value-keyword-no-deprecated': null, // 允许使用已废弃的关键字值
        'declaration-block-no-shorthand-property-overrides': null, // 允许简写属性覆盖
        'media-query-no-invalid': null, // 允许所有媒体查询语法
        'media-feature-range-notation': null, // 允许所有媒体查询范围表示法
        'selector-pseudo-element-no-unknown': null, // 允许未知的伪元素选择器
        'order/properties-order': [], // 不强制属性排序
        'no-descending-specificity': null, // 允许特异性降序
        'font-family-no-missing-generic-family-keyword': null, // 允许字体族无通用字体
        'selector-class-pattern': null, // 不限制类名命名模式
        'declaration-property-value-no-unknown': null // 允许未知的属性值
    }
};
