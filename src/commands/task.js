const { SlashCommandBuilder } = require('discord.js');
const db = require('../utils/database');
const EmbedBuilder = require('../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('task')
        .setDescription('태스크 관리')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('새 태스크 추가')
                .addStringOption(option =>
                    option.setName('board')
                        .setDescription('보드 이름')
                        .setRequired(true)
                        .setAutocomplete(true))
                .addStringOption(option =>
                    option.setName('title')
                        .setDescription('태스크 제목')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('태스크 설명')
                        .setRequired(false))
                .addUserOption(option =>
                    option.setName('assignee')
                        .setDescription('담당자')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('move')
                .setDescription('태스크 이동')
                .addStringOption(option =>
                    option.setName('board')
                        .setDescription('보드 이름')
                        .setRequired(true)
                        .setAutocomplete(true))
                .addStringOption(option =>
                    option.setName('task')
                        .setDescription('태스크 선택')
                        .setRequired(true)
                        .setAutocomplete(true))
                .addStringOption(option =>
                    option.setName('column')
                        .setDescription('이동할 컬럼')
                        .setRequired(true)
                        .addChoices(
                            { name: '할 일', value: '할 일' },
                            { name: '진행 중', value: '진행 중' },
                            { name: '완료', value: '완료' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('show')
                .setDescription('태스크 상세 정보')
                .addStringOption(option =>
                    option.setName('board')
                        .setDescription('보드 이름')
                        .setRequired(true)
                        .setAutocomplete(true))
                .addStringOption(option =>
                    option.setName('task')
                        .setDescription('태스크 선택')
                        .setRequired(true)
                        .setAutocomplete(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('태스크 삭제')
                .addStringOption(option =>
                    option.setName('board')
                        .setDescription('보드 이름')
                        .setRequired(true)
                        .setAutocomplete(true))
                .addStringOption(option =>
                    option.setName('task')
                        .setDescription('태스크 선택')
                        .setRequired(true)
                        .setAutocomplete(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'add':
                await this.addTask(interaction);
                break;
            case 'move':
                await this.moveTask(interaction);
                break;
            case 'show':
                await this.showTask(interaction);
                break;
            case 'delete':
                await this.deleteTask(interaction);
                break;
        }
    },

    async addTask(interaction) {
        const boardName = interaction.options.getString('board');
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description') || '';
        const assigneeUser = interaction.options.getUser('assignee');
        const assignee = assigneeUser ? assigneeUser.username : null;

        const guildId = interaction.guild.id;
        const boards = db.loadBoards(guildId);

        if (!boards[boardName]) {
            return interaction.reply({ content: '존재하지 않는 보드입니다.', ephemeral: true });
        }

        // 중복 제목 확인
        const existingTask = db.getTaskByTitle(guildId, boardName, title);
        if (existingTask) {
            return interaction.reply({ content: '이미 존재하는 태스크 제목입니다.', ephemeral: true });
        }

        const task = {
            title,
            description,
            assignee,
            column: '할 일'
        };

        const taskId = db.addTask(guildId, boardName, task);
        
        // 성공 메시지와 함께 업데이트된 보드 표시
        const successMessage = `✅ 태스크가 추가되었습니다!\n**제목:** ${title}${assignee ? `\n**담당자:** ${assignee}` : ''}`;
        
        // 업데이트된 보드 데이터 가져오기
        const updatedBoards = db.loadBoards(guildId);
        const boardEmbed = EmbedBuilder.createBoardEmbed(updatedBoards[boardName]);
        
        await interaction.reply({ 
            content: successMessage,
            embeds: [boardEmbed]
        });
    },

    async moveTask(interaction) {
        const boardName = interaction.options.getString('board');
        const taskTitle = interaction.options.getString('task');
        const newColumn = interaction.options.getString('column');

        const guildId = interaction.guild.id;
        
        if (db.moveTaskByTitle(guildId, boardName, taskTitle, newColumn)) {
            const successMessage = `✅ **${taskTitle}**이(가) **${newColumn}**로 이동되었습니다!`;
            
            // 업데이트된 보드 데이터 가져오기
            const updatedBoards = db.loadBoards(guildId);
            const boardEmbed = EmbedBuilder.createBoardEmbed(updatedBoards[boardName]);
            
            await interaction.reply({ 
                content: successMessage,
                embeds: [boardEmbed]
            });
        } else {
            await interaction.reply({ content: '태스크를 찾을 수 없습니다.', ephemeral: true });
        }
    },

    async showTask(interaction) {
        const boardName = interaction.options.getString('board');
        const taskTitle = interaction.options.getString('task');
        const guildId = interaction.guild.id;
        
        const task = db.getTaskByTitle(guildId, boardName, taskTitle);
        if (!task) {
            return interaction.reply({ content: '태스크를 찾을 수 없습니다.', ephemeral: true });
        }

        const embed = EmbedBuilder.createTaskEmbed(task);
        await interaction.reply({ embeds: [embed] });
    },

    async deleteTask(interaction) {
        const boardName = interaction.options.getString('board');
        const taskTitle = interaction.options.getString('task');
        const guildId = interaction.guild.id;

        if (db.deleteTaskByTitle(guildId, boardName, taskTitle)) {
            const successMessage = `🗑️ **${taskTitle}**이(가) 삭제되었습니다!`;
            
            // 업데이트된 보드 데이터 가져오기
            const updatedBoards = db.loadBoards(guildId);
            const boardEmbed = EmbedBuilder.createBoardEmbed(updatedBoards[boardName]);
            
            await interaction.reply({ 
                content: successMessage,
                embeds: [boardEmbed]
            });
        } else {
            await interaction.reply({ content: '태스크를 찾을 수 없습니다.', ephemeral: true });
        }
    },

    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        const guildId = interaction.guild.id;
        const boards = db.loadBoards(guildId);

        if (focusedOption.name === 'board') {
            const boardNames = Object.keys(boards);
            const filtered = boardNames.filter(name => 
                name.toLowerCase().includes(focusedOption.value.toLowerCase())
            );
            
            await interaction.respond(
                filtered.slice(0, 25).map(name => ({ name, value: name }))
            );
        } else if (focusedOption.name === 'task') {
            const boardName = interaction.options.getString('board');
            if (!boardName || !boards[boardName]) {
                return interaction.respond([]);
            }

            const tasks = db.getBoardTasks(guildId, boardName);
            const filtered = tasks.filter(task => 
                task.title.toLowerCase().includes(focusedOption.value.toLowerCase())
            );
            
            await interaction.respond(
                filtered.slice(0, 25).map(task => ({ 
                    name: `${task.title} (${task.column})`,
                    value: task.title 
                }))
            );
        }
    }
};