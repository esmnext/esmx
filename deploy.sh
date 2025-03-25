#!/bin/bash  

# 确保脚本抛出遇到的错误
set -e

rm -rf dist
# 编译代码
npm run build

# 文心一言提供的脚本
src_base="examples"  
target_base="dist"

for src_dir in "$src_base"/ssr-*/dist/client "$src_base"/docs/dist/client; do  
  if [ -d "$src_dir" ]; then  
    if [ "$src_dir" = "$src_base/docs/dist/client" ]; then  
      target_dir="$target_base"  
    else  
      ssr_part="${src_dir#$src_base/}"  
      ssr_part="${ssr_part%/dist/client}"
      target_dir="$target_base/$ssr_part"  
    fi  
    mkdir -p "$target_dir"  
    cp -r "$src_dir"/* "$target_dir"  
    echo "Copied $src_dir/* to $target_dir"  
  fi  
done

# 复制 sitemap.xml 文件
if [ -f "$src_base/docs/doc_build/sitemap.xml" ]; then
  cp "$src_base/docs/doc_build/sitemap.xml" "$target_base/sitemap.xml"
  echo "Copied sitemap.xml to $target_base"
fi

cd dist
# 如果是发布到自定义域名
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# 如果发布到 https://js-esm.github.io/gez/
git push -f git@github.com:js-esm/gez.git master:docs

cd -