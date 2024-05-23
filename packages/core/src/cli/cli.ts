// @ts-expect-error type error
import { register } from 'tsx/esm/api'
import path from 'path'
import { type NodeOptions } from '../node'
import { Gez, type App, createApp, getProjectPath } from '../core'
const NAMESPACE = 'gez'
enum COMMAND {
  dev = 'dev',
  build = 'build',
  preview = 'preview',
  start = 'start'
}

export function cli () {
  const command = process.argv.slice(2)[0] || ''
  switch (command) {
    case COMMAND.dev:
    case COMMAND.build:
    case COMMAND.preview:
      runDevApp(command)
      break
    case COMMAND.start:
      runProdApp()
      break
    default:
      runFile(command)
      break
  }
}

function defaultCreated () {
  throw new Error('\'created\' function not set')
}

function defaultCreateDevApp (): App {
  throw new Error('\'createDevApp\' function not set')
}

async function runFile (file: string) {
  if (!/\.(js|ts)$/.test(file)) return
  const api = register({ namespace: NAMESPACE })
  await api.import(path.resolve(file), import.meta.url)
}

async function runDevApp (command: COMMAND) {
  const api = register({ namespace: NAMESPACE })
  const module = await api.import(path.resolve('src/entry-node.ts'), import.meta.url)
  const options: NodeOptions = module.default || {}
  const created = options.created || defaultCreated
  const createDevApp = options.createDevApp ?? defaultCreateDevApp

  const gez = new Gez(options)
  const app = await createDevApp(gez)
  gez.app = app

  switch (command) {
    case COMMAND.dev:
      created(gez)
      break
    case COMMAND.build:
      await app.build()
      await app.destroy()
      await api.unregister()
      break
    case COMMAND.preview:
      await app.build()
      await app.destroy()
      await api.unregister()
      runProdApp()
      break
  }
}

async function runProdApp () {
  const file = getProjectPath(path.resolve(), 'dist/node/entry-node.js')
  import(/* @vite-ignore */file).then(async module => {
    const options: NodeOptions = module.default || {}
    const created = options.created || defaultCreated
    process.env.NODE_ENV = 'production'

    const gez = new Gez(options)
    gez.app = await createApp(gez)

    created(gez)
  })
}
