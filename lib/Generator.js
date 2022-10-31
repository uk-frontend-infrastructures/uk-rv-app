const { getRepoList, getTagList } = require('./http');
const ora = require('ora');
const inquirer = require('inquirer');
const chalk =  require('chalk');
const util = require('util');
const downloadGitRepo = require('download-git-repo');
const path = require('path');

const BASE_URL = 'uk-frontend-infrastructures'; // 组织名

// 添加加载动画
async function wrapLoading(fn, messgae, ...args) {
    // ora 初始化传入的提示信息
    const spinner = ora(messgae);
    // 开始加载动画
    spinner.start();

    try {
        const result = await fn(...args);
        spinner.succeed();
        return result;
    } catch (error) {
        spinner.fail('请求失败...');
        return;
    }
}

class Generator {
    constructor(name, targetDir) {
        // 项目名称
        this.name = name;
        // 创建位置
        this.targetDir = targetDir;

        // 对 download-git-repo 进行 promise 改造
        this.downloadGitRepo = util.promisify(downloadGitRepo);
    };
    /**
     * 获取用户选择的模板
     * 1) 从远程拉取模板数据
     * 2) 用户选择自己新下载的模板名称
     * 3) 返回用户选择的模板名称
     */
    async getRepo() {
        // 1) 从远程拉取模板
        const repoList = await wrapLoading(getRepoList, '等待，获取模板...');
        if (!repoList) return;

        // 过滤我们需要的模板名称
        const repos = repoList.map(item => item.name);

        // 2) 用户选择自己新下载的模板名称
        const { repo } = await inquirer.prompt([
            {
                type: 'list',
                name: 'repo',
                choices: repos,
                message: '请为项目选择模板'
            }
        ]);

        // 3) 返回用户选择的模板名称
        return repo;
    };
    /**
     * 获取用户选择的版本
     * 1) 基于repo结果，远程拉取对应的tag列表
     * 2) 用户选择自己需要下载的tag
     * 3) return 用户选择的 tag
     */
    async getTag(repo) {
        // 1) 基于repo结果，远程拉取对应的tag列表
        const tags = await wrapLoading(getTagList, '等待，获取版本...', repo);

        if (!tags) return;

        // 过滤我们需要的tag名称
        const tagList = tags.map(item => item.name);

        // 2) 用户选择自己需要下载的版本名称
        const { tag } = await inquirer.prompt([
            {
                type: 'list',
                name: 'tag',
                choices: tagList,
                message: '请选择模板的版本'
            }
        ]);

        // 3) 用户选择的tag
        return tag;
    };
    /**
     * 下载远程模板
     * 1) 拼接下载地址
     * 2) 调用下载方法
     */
    async download(repo, tag) {
        // 1) 拼接下载地址
        const requestUrl = `${BASE_URL}/${repo}${tag?'#'+tag:''}`;

        // 2) 调用下载方法
        await wrapLoading(
            this.downloadGitRepo, // 远程下载方法
            '等待下载模板',
            requestUrl, // 参数1：下载地址
            path.resolve(process.cwd(), this.targetDir), // 参数2：创建位置
        );
    };
    /**
     * 创建逻辑（核心）
     * 1) 获取模板名称
     * 2) 获取tag名称
     * 3) 下载模板到模板目录
     * 4) 模板使用提示
     */
    async create() {
        // 1) 获取模板名称
        const repo = await this.getRepo();
        if(!repo) return;
        // 2) 获取tag名称
        const tag = await this.getTag(repo);
        console.log(chalk.green('您选择了' + repo + '模板', tag + '版本'));
        
        // 3) 下载模板到模板目录
        await this.download(repo, tag);
        
        // 4) 模板使用提示
        console.log(`\r\n\项目${chalk.cyan(this.name)}创建完成`);
        console.log(`\r\n cd ${chalk.cyan(this.name)}`);
        console.log(`npm run dev\r\n`);
    };
}

module.exports = Generator;