import resolve from '@rollup/plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: ['./src/sw/index.js'],
  output: {
    file: 'public/sw.js',
    format: 'iife',
    // sourcemap: !isProduction,
    sourcemap: true,
  },
  plugins: [
    resolve(),
    commonjs()
  ],
  watch: {
    include: './src/sw/index.js'
  }
}
