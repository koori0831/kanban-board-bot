const { Message } = require('discord.js');
const { handleKanbanCommand } = require('../commands/kanban');
const { handleTaskCommand } = require('../commands/task');
const { handleBoardCommand } = require('../commands/board');

module.exports = {
    name: 'messageCreate',
    execute(message) {
        if (message.author.bot) return;

        const args = message.content.trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (command === '!kanban') {
            handleKanbanCommand(message, args);
        } else if (command === '!task') {
            handleTaskCommand(message, args);
        } else if (command === '!board') {
            handleBoardCommand(message, args);
        }
    },
};