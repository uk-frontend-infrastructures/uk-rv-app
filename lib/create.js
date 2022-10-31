const inquirer = require('inquirer');
const fs = require('fs-extra'); // fs-extra 是对 fs 模块的扩展，支持 promise
const path = require('path');

const Generator = require('./Generator');

module.exports = async function create(name, options) {
    // 当前命令行选择的目录
    const cwd = process.cwd();
    // 需要创建目录的地址
    const targetDir = path.join(cwd, name);

    if (fs.existsSync(targetDir)) {
        // 是否覆盖原目录
        if (options.force) {
            await fs.remove(targetDir)
        } else {
            // TODO：询问用户是否确定要覆盖
            let { action } = await inquirer.prompt([
                {
                    name: 'action',
                    type: 'list',
                    messgae: '目标目录已经存在，请选择一个操作',
                    choices: [
                        {
                            name: '覆盖',
                            value: 'overwrite'
                        },
                        {
                            name: '取消',
                            value: false
                        }
                    ]
                }
            ]);

            if (!action) {
                return;
            } else if (action === 'overwrite') {
                // 移除已经存在的目录
                console.log(`\r\n移除...`)
                await fs.remove(targetDir);
            }
        }
    }

    // 创建项目
    const generator = new Generator(name, targetDir);
    // 开始创建
    generator.create();
}