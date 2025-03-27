export default {
    extends: [
        import.meta.resolve('stylelint-config-standard'),
        import.meta.resolve('stylelint-config-recess-order'),
        import.meta.resolve('stylelint-config-recommended-less'),
        import.meta.resolve('stylelint-config-html'),
        import.meta.resolve('stylelint-config-recommended-vue')
    ],
    plugins: [import.meta.resolve('stylelint-order')],
    rules: {
        'no-empty-source': null,
        'selector-pseudo-class-no-unknown': [
            true,
            {
                ignorePseudoClasses: ['deep', 'global']
            }
        ],
        'declaration-block-no-shorthand-property-overrides': null,
        'media-query-no-invalid': null,
        'media-feature-range-notation': null,
        'selector-pseudo-element-no-unknown': null,
        'order/properties-order': [],
        'no-descending-specificity': null,
        'font-family-no-missing-generic-family-keyword': null,
        'selector-class-pattern': null,
        'declaration-property-value-no-unknown': null
    }
};
