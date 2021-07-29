import babel from 'rollup-plugin-babel';

export default {
  dest: 'dist/cjs.js',
  entry: 'index.js',
  format: 'cjs',
  moduleName: 'usepages-blocks-basic',
  plugins: [
    babel({
      exclude: 'node_modules/**',
      presets: [
        'es2015-rollup',
        'react'
      ],
      runtimeHelpers: true
    })
  ]
};
