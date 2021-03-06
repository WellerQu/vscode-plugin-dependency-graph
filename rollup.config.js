import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript';

export default [
  {
    input: 'src/webview/visualization.ts',
    output: {
      name: 'visualization',
      file: 'out/webview/visualization.js',
      format: 'umd'
    },
    plugins: [
      resolve(),
      commonjs(), 
      typescript({
        tsconfig: './tsconfig-client.json'
      }) 
    ]
  }
];