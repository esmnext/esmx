import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import find from 'find';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface DeepSeekResponse {
    choices: Array<{
        index: number;
        message: {
            role: 'assistant' | 'system' | 'user';
            content: string;
        };
    }>;
}
interface FileInfo {
    source: Item;
    sourceDir: string;
    sourceFile: string;
    target: Item;
    targetDir: string;
    targetFile: string;
}

interface Item {
    label: string;
    value: string;
}

const config = {
    sourceDir: path.resolve(__dirname, 'src/zh'),
    API_KEY: process.env.DEEPSEEK_API_KEY,
    // 源语言配置
    source: {
        label: '中文',
        value: 'zh'
    } satisfies Item,
    // 目标语言配置数组
    languages: [
        {
            value: 'en',
            label: '英文'
        }
        // {
        //     value: 'ja',
        //     'label': '日语',
        // }
    ] satisfies Item[],
    promptTemplate: `你是一位专业的Web前端技术文档本地化专家，精通技术文档国际化标准和最佳实践。请将以下{source}技术文档翻译成{target}，严格遵循以下规范：

文档结构与格式：
1. Markdown语法结构规范：
   - 保持标题层级(#, ##, ###等)的层次关系和间距
   - 确保列表缩进和序号的一致性，包括嵌套列表
   - 代码块的语言标记、缩进和格式必须完全保留
   - 表格的对齐方式、分隔符和单元格格式保持一致
   - 引用块(>)的嵌套层级和格式不变
   - 保持空行、分隔线(---)等格式元素的位置

2. YAML和Frontmatter处理规范：
   - 严格保持键名不变，仅翻译值部分
   - 遵守2空格缩进规则
   - 特殊字符(:、-、|、>等)的使用必须符合YAML语法
   - 多行文本根据内容特点选择合适的标记符(|、>)
   - 数组和对象的格式与缩进保持一致
   - 确保frontmatter的起始和结束标记(---)完整

3. 链接与引用处理：
   - 保持所有URL、图片路径和引用完全不变
   - 锚点链接(#)必须与对应标题的翻译保持一致
   - 图片说明文字需要翻译，但保持原有格式
   - 保留原始的引用标记和编号系统

专业术语规范：
1. 术语翻译规则：
   - 首次出现：使用"翻译（原文）"格式
   - 重复出现：仅使用已确立的译名
   - 行业通用术语遵循目标语言的惯用翻译
   - 保持术语翻译的一致性

2. 保持不变的内容：
   - 所有代码片段及其格式
   - 变量名、函数名、类名等标识符
   - 配置项的键名和特殊值
   - 技术框架名称（如Esmx、Vue、React等）
   - 命令行指令和参数

代码相关内容规范：
1. 内联代码处理：
   - 保持原有格式、空格和反引号
   - 确保反引号正确配对
   - 翻译代码的说明性文本，保持简洁明了

2. 代码块处理：
   - 严格保持语言标记
   - 保持代码缩进和格式
   - 保留所有换行和空行
   - 注释翻译需遵循目标语言代码规范

3. 代码注释翻译规范：
   - 遵循目标语言的注释风格和规范
   - 保持注释的缩进和对齐
   - 确保翻译后的注释长度适中
   - 保持多行注释的格式一致
   - 翻译JSDoc/TSDoc等文档注释时保持标签结构

4. API文档规范：
   - 参数、返回值、类型等说明采用统一的语言风格
   - 保持示例代码的完整性和可运行性
   - 类型声明、接口定义等格式保持一致
   - 错误码和状态描述的准确翻译

本地化质量标准：
1. 语言表达：
   - 符合目标语言的表达习惯和语法规则
   - 使用规范的技术术语和专业用语
   - 保持专业性的同时确保可读性
   - 避免使用不当的俚语或过于口语化的表达

2. 格式规范：
   - 正确使用目标语言的标点符号规则
   - 合理的段落划分和文本布局
   - 保持排版格式的一致性
   - 确保列表、表格等元素的对齐

3. 文档结构：
   - 保持逻辑层次的清晰性
   - 确保段落之间的自然衔接
   - 维持术语使用的一致性
   - 保持文档整体的连贯性

4. 本地化要求：
   - 考虑目标语言地区的文化特点
   - 适应目标读者的阅读和理解习惯
   - 在保持专业性的同时注重亲和力
   - 确保翻译内容的准确性和可理解性

5. 质量控制：
   - 确保没有遗漏或错误的翻译
   - 保持专业术语的一致性
   - 确保文档的可读性和可维护性
   - 符合目标语言的技术写作规范

JSON内容处理规范：
1. 翻译范围限制：
   - 仅翻译key名为text或label的字段值
   - 其他字段的key和value保持原样不变
   - 保持JSON结构的完整性和层次关系

2. JSON格式要求：
   - 确保翻译后的内容仍是有效的JSON格式
   - 保持所有引号、逗号、冒号等标点符号的正确性
   - 不改变数值、布尔值、null等特殊值的格式
   - 按照原来 JSON 格式，不需要使用 Markdown 格式返回

3. 复杂结构处理：
   - 正确处理嵌套对象和数组结构
   - 保持数组元素的顺序和完整性
   - 维护对象属性的层级关系

4. 特殊字符处理：
   - 正确处理转义字符（如\n、\t、\"等）
   - 保持Unicode编码的完整性
   - 不破坏JSON字符串中的特殊格式

5. 质量控制：
   - 确保翻译后的JSON可以被正确解析
   - 验证翻译内容的语义完整性
   - 保持专业术语的一致性和准确性
`
};

async function init() {
    const sourceFiles = find.fileSync(config.sourceDir);

    for (const langConfig of config.languages) {
        console.log(`\n开始翻译${langConfig.label}文档...`);
        const files: FileInfo[] = [];

        for (const file of sourceFiles) {
            const relativePath = path.relative(config.sourceDir, file);
            files.push({
                sourceDir: config.sourceDir,
                sourceFile: file,
                source: config.source,
                targetDir: path.resolve(__dirname, `src/${langConfig.value}`),
                targetFile: path.join(
                    path.resolve(__dirname, `src/${langConfig.value}`),
                    relativePath
                ),
                target: langConfig
            });
        }

        const totalFiles = files.length;
        console.log(`找到 ${totalFiles} 个文件需要处理`);
        const translatedFiles = 0;
        const copiedFiles = 0;

        await task({
            salt: langConfig.label + langConfig.value + config.promptTemplate,
            description: '处理文件',
            items: files,
            useCache: false,
            translate: async (content: string, fileInfo: FileInfo) => {
                const result = await translateMarkdown(fileInfo, content);
                return [true, result];
            }
        });

        console.log(`\n${langConfig.label}文档处理完成:`);
        console.log(`- 总文件数: ${totalFiles}`);
        console.log(`- 翻译文件: ${translatedFiles} 个`);
        console.log(`- 复制文件: ${copiedFiles} 个\n`);
    }
}

init();

interface TaskOptions<T> {
    items: FileInfo[];
    translate: (
        sourceText: string,
        fileInfo: FileInfo
    ) => Promise<[boolean, string | null]>;
    description?: string;
    concurrency?: number;
    maxRetries?: number;
    useCache?: boolean;
    cacheDir?: string;
    salt?: string;
}

async function task(options: TaskOptions<FileInfo>) {
    const {
        items,
        description = '处理任务',
        concurrency = 10,
        maxRetries = 3,
        useCache = true,
        cacheDir = path.join(__dirname, '.translation_cache')
    } = options;

    // 创建缓存目录
    if (useCache && !fs.existsSync(cacheDir)) {
        await fs.promises.mkdir(cacheDir, { recursive: true });
    }

    // 任务队列
    const queue = [...items];
    const failedItems = new Map<string, { item: FileInfo; retries: number }>();
    const inProgress = new Set<string>();
    let completed = 0;

    // 进度显示
    const totalItems = items.length;
    const updateProgress = () => {
        const percent = Math.round((completed / totalItems) * 100);
        process.stdout.write(
            `\r${description}: ${percent}% [${completed}/${totalItems}]`
        );
    };

    // 计算文本的哈希值
    const getContentHash = async (content: string): Promise<string> => {
        const encoder = new TextEncoder();
        const data = encoder.encode(content + (options.salt || ''));
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    };

    // 检查缓存
    const checkCache = async (content: string): Promise<string | null> => {
        if (!useCache) return null;
        const hash = await getContentHash(content);
        const cachePath = path.join(cacheDir, `${hash}.txt`);
        if (fs.existsSync(cachePath)) {
            return fs.readFileSync(cachePath, 'utf-8');
        }
        return null;
    };

    // 保存缓存
    const saveCache = async (
        content: string,
        result: string
    ): Promise<void> => {
        if (!useCache) return;
        const hash = await getContentHash(content);
        const cachePath = path.join(cacheDir, `${hash}.txt`);
        await fs.promises.writeFile(cachePath, result, 'utf-8');
    };

    // 处理单个任务
    const processItem = async (item: FileInfo): Promise<boolean> => {
        try {
            const content = fs.readFileSync(item.sourceFile, 'utf-8');

            // 检查缓存
            const cachedResult = await checkCache(content);
            if (cachedResult) {
                await fs.promises.mkdir(path.dirname(item.targetFile), {
                    recursive: true
                });
                await fs.promises.writeFile(
                    item.targetFile,
                    cachedResult,
                    'utf-8'
                );
                return true;
            }

            // 翻译内容
            const [shouldCache, translatedContent] = await options.translate(
                content,
                item
            );
            if (translatedContent) {
                await fs.promises.mkdir(path.dirname(item.targetFile), {
                    recursive: true
                });
                await fs.promises.writeFile(
                    item.targetFile,
                    translatedContent,
                    'utf-8'
                );
                if (shouldCache) {
                    await saveCache(content, translatedContent);
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error(`处理文件 ${item.sourceFile} 失败:`, error);
            return false;
        }
    };

    // 主处理循环
    while (queue.length > 0 || inProgress.size > 0 || failedItems.size > 0) {
        // 处理失败的任务
        for (const [key, { item, retries }] of failedItems.entries()) {
            if (retries < maxRetries && inProgress.size < concurrency) {
                failedItems.delete(key);
                queue.push(item);
            }
        }

        // 处理队列中的任务
        while (queue.length > 0 && inProgress.size < concurrency) {
            const item = queue.shift()!;
            const key = item.sourceFile;
            inProgress.add(key);

            processItem(item).then((success) => {
                inProgress.delete(key);
                if (success) {
                    completed++;
                    updateProgress();
                } else {
                    const retries = (failedItems.get(key)?.retries || 0) + 1;
                    if (retries < maxRetries) {
                        failedItems.set(key, { item, retries });
                    } else {
                        console.error(
                            `\n文件 ${key} 处理失败，已达到最大重试次数`
                        );
                        completed++;
                        updateProgress();
                    }
                }
            });
        }

        // 等待一段时间再继续
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log('\n任务处理完成');
}

function translateMarkdown(fileInfo: FileInfo, text: string) {
    const prompt = config.promptTemplate.replace(
        '{source}',
        fileInfo.source.label
    );
    return translate(prompt, text);
}

async function translate(prompt: string, text: string): Promise<string | null> {
    if (!config.API_KEY) {
        throw new Error('请设置 DEEPSEEK_API_KEY 环境变量');
    }

    const response = await fetch(
        'https://api.deepseek.com/v1/chat/completions',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${config.API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: prompt
                    },
                    {
                        role: 'user',
                        content: text
                    }
                ],
                temperature: 0.3
            })
        }
    );

    if (!response.ok) {
        return null;
    }
    try {
        const data: DeepSeekResponse = await response.json();
        return data.choices[0].message.content;
    } catch {
        return null;
    }
}
