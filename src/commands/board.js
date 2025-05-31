const { MessageEmbed } = require('discord.js');
const { getAllBoards, getBoardById } = require('../utils/database');

const listBoards = async (message) => {
    const boards = await getAllBoards();
    if (boards.length === 0) {
        return message.reply('No boards found.');
    }

    const embed = new MessageEmbed()
        .setTitle('Kanban Boards')
        .setDescription(boards.map(board => `**${board.name}** - ID: ${board.id}`).join('\n'))
        .setColor('#0099ff');

    message.channel.send({ embeds: [embed] });
};

const viewBoard = async (message, boardId) => {
    const board = await getBoardById(boardId);
    if (!board) {
        return message.reply('Board not found.');
    }

    const embed = new MessageEmbed()
        .setTitle(`Board: ${board.name}`)
        .setDescription(`Tasks:\n${board.tasks.map(task => `- ${task.title} [${task.status}]`).join('\n')}`)
        .setColor('#0099ff');

    message.channel.send({ embeds: [embed] });
};

module.exports = {
    listBoards,
    viewBoard,
};