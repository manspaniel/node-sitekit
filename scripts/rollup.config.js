// import sucrase from "@rollup/plugin-sucrase"
import pkg from '../package.json'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import styles from 'rollup-plugin-styles'
import babel from '@rollup/plugin-babel'
import replace from '@rollup/plugin-replace'
import { existsSync } from 'fs'

function dirName(path) {
  let parts = path.split('/')

  parts.pop()

  return parts.join('/')
}

const extensions = ['.js', '.jsx', '.ts', '.tsx']

let modes = ['development', 'test', 'production']
export const config = (mode = 'development') => {
  if (!modes.includes(mode)) {
    throw Error(`Please use on of ${modes.join(' | ')}`)
  }

  let entry = ['src/index.js', 'src/index.tsx', 'src/index.ts'].find((file) =>
    existsSync(file)
  )

  process.env.NODE_ENV = mode

  let finalConfig = {
    input: entry,
    output: [
      {
        dir: dirName(pkg.main),
        entryFileNames: 'index.js',
        chunkFileNames: '[name].js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      },
      {
        dir: dirName(pkg.module),
        entryFileNames: 'index.es.js',
        chunkFileNames: '[name].es.js',
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: [
      resolve({
        extensions,
      }),
      commonjs(),
      babel({
        babelHelpers: 'runtime',
        extensions,
        babelrc: false,
        presets: ['@babel/env', '@babel/typescript'],
        plugins: [
          [
            '@babel/plugin-transform-runtime',
            {
              corejs: 3,
            },
          ],
          '@babel/plugin-proposal-class-properties',
        ],
        include: ['src/**/*'],
        exclude: ['node_modules'],
      }),
    ],
  }

  return finalConfig
}
