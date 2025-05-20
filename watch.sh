#!/bin/bash

echo "开始监听文件变更..."

# 监听目录中的任何子文件变更
fswatch -o ./packages/router/src | while read -r event; do
  # 在这里执行你指定的命令
  clear
  echo "packages/router/src 目录中的文件变更检测到，执行指定命令..."
  cd ./packages/router
  pnpm lint:type && pnpm lint:js && pnpm build
#   cd ../../examples/ssr-vue2-remote
#   NODE_ENV=production pnpm build
#   cd ../..
  echo "packages/router/src 目录中的文件变更检测到，执行指定命令完成"
done &

# 监听目录中的任何子文件变更
fswatch -o ./packages/router-vue2/src | while read -r event; do
  # 在这里执行你指定的命令
  clear
  echo "packages/router-vue2/src 目录中的文件变更检测到，执行指定命令..."
  cd ./packages/router-vue2
  pnpm lint:type && pnpm lint:js && pnpm build
  echo "packages/router-vue2/src 目录中的文件变更检测到，执行指定命令完成"
done &

# 监听目录中的任何子文件变更
fswatch -o ./packages/router-vue3/src | while read -r event; do
  # 在这里执行你指定的命令
  clear
  echo "packages/router-vue3/src 目录中的文件变更检测到，执行指定命令..."
  cd ./packages/router-vue3
  pnpm lint:type && pnpm lint:js && pnpm build
  echo "packages/router-vue3/src 目录中的文件变更检测到，执行指定命令完成"
done &

# # 监听第二个目录中的任何子文件变更
# fswatch -o ./examples/ssr-vue2-remote/src | while read -r event; do
#   # 在这里执行第二个目录变更时的指定命令
#   clear
#   echo "examples/ssr-vue2-remote/src 目录中的文件变更检测到，执行指定命令..."
#   cd ./examples/ssr-vue2-remote
#   NODE_ENV=production pnpm build
#   cd ../..
#   echo "examples/ssr-vue2-remote/src 目录中的文件变更检测到，执行指定命令完成"
# done

# 等待所有后台进程完成
wait
