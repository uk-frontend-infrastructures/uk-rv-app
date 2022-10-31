#! /usr/bin/env node

// 快速搭建react/vue项目结构
console.log("快速搭建react/vue项目结构~");

const program = require('commander'); // 自定义命令行指令

const create = require('../lib/create.js'); // 创建项目方法

program
    .command('init <app-name>')
    .description('创建一个新项目')
    .option('-f, --force', '如果目标目录存在，则覆盖它')
    .action((name, options) => {
        create(name, options);
    });

// 配置版本号信息
program
    .version(`v${require('../package.json').version}`)
    .usage('<command> [option]');

// 解析用户执行命令传入参数
program.parse(process.argv);