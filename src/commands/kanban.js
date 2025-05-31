const { SlashCommandBuilder } = require('discord.js');
const db = require('../utils/database');
const EmbedBuilder = require('../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kanban')
        .setDescription('칸반보드 관리')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('새 칸반보드 생성')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('보드 이름')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('show')
                .setDescription('칸반보드 현황 표시')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('보드 이름')
                        .setRequired(true)
                        .setAutocomplete(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('모든 보드 목록 표시'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('보드 삭제')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('삭제할 보드 이름')
                        .setRequired(true)
                        .setAutocomplete(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'create':
                await this.createBoard(interaction);
                break;
            case 'show':
                await this.showBoard(interaction);
                break;
            case 'list':
                await this.listBoards(interaction);
                break;
            case 'delete':
                await this.deleteBoard(interaction);
                break;
        }
    },

    async createBoard(interaction) {
        const boardName = interaction.options.getString('name');
        const guildId = interaction.guild.id;
        
        const boards = db.loadBoards(guildId);
        if (boards[boardName]) {
            return interaction.reply({ content: '이미 존재하는 보드명입니다.', ephemeral: true });
        }

        const newBoard = {
            name: boardName,
            columns: ['할 일', '진행 중', '완료'],
            tasks: {},
            createdAt: new Date().toISOString(),
            createdBy: interaction.user.id
        };

        db.saveBoard(guildId, newBoard);
        await interaction.reply({ content: `✅ **${boardName}** 보드가 생성되었습니다!` });
    },

    async showBoard(interaction) {
        const boardName = interaction.options.getString('name');
        const guildId = interaction.guild.id;
        const boards = db.loadBoards(guildId);

        if (!boards[boardName]) {
            return interaction.reply({ content: '존재하지 않는 보드입니다.', ephemeral: true });
        }

        const embed = EmbedBuilder.createBoardEmbed(boards[boardName]);
        await interaction.reply({ embeds: [embed] });
    },

    async listBoards(interaction) {
        const guildId = interaction.guild.id;
        const boards = db.loadBoards(guildId);
        const boardNames = Object.keys(boards);

        if (boardNames.length === 0) {
            return interaction.reply({ 
                content: '생성된 보드가 없습니다. `/kanban create`로 보드를 생성해보세요!',
                ephemeral: true 
            });
        }

        const boardList = boardNames.map((name, index) => `${index + 1}. **${name}**`).join('\n');
        await interaction.reply({ content: `📋 **보드 목록**\n${boardList}` });
    },

    async deleteBoard(interaction) {
        const boardName = interaction.options.getString('name');
        const guildId = interaction.guild.id;

        if (db.deleteBoard(guildId, boardName)) {
            await interaction.reply({ content: `🗑️ **${boardName}** 보드가 삭제되었습니다.` });
        } else {
            await interaction.reply({ content: '존재하지 않는 보드입니다.', ephemeral: true });
        }
    },

    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        const guildId = interaction.guild.id;
        const boards = db.loadBoards(guildId);
        const boardNames = Object.keys(boards);

        if (focusedOption.name === 'name') {
            const filtered = boardNames.filter(name => 
                name.toLowerCase().includes(focusedOption.value.toLowerCase())
            );
            
            await interaction.respond(
                filtered.slice(0, 25).map(name => ({ name, value: name }))
            );
        }
    }
};