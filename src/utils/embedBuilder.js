const { EmbedBuilder } = require('discord.js');

class KanbanEmbedBuilder {
    static createBoardEmbed(board) {
        const embed = new EmbedBuilder()
            .setTitle(`📋 ${board.name} 칸반보드`)
            .setColor(0x0099FF)
            .setTimestamp();

        board.columns.forEach(column => {
            const tasks = Object.values(board.tasks).filter(task => task.column === column);
            const taskList = tasks.length > 0 
                ? tasks.map(task => `• **${task.title}** ${task.assignee ? `(${task.assignee})` : ''}`).join('\n')
                : '태스크가 없습니다.';
            
            embed.addFields({
                name: `${this.getColumnEmoji(column)} ${column} (${tasks.length})`,
                value: taskList,
                inline: true
            });
        });

        return embed;
    }

    static createTaskEmbed(task) {
        const embed = new EmbedBuilder()
            .setTitle(`📌 ${task.title}`)
            .setDescription(task.description || '설명이 없습니다.')
            .setColor(this.getColumnColor(task.column))
            .addFields(
                { name: '상태', value: task.column, inline: true },
                { name: '담당자', value: task.assignee || '없음', inline: true },
                { name: '생성일', value: new Date(task.createdAt).toLocaleDateString('ko-KR'), inline: true }
            )
            .setFooter({ text: `Task ID: ${task.id}` })
            .setTimestamp();

        return embed;
    }

    static getColumnEmoji(column) {
        const emojis = {
            '할 일': '📝',
            '진행 중': '⚡',
            '완료': '✅'
        };
        return emojis[column] || '📋';
    }

    static getColumnColor(column) {
        const colors = {
            '할 일': 0xFF6B6B,
            '진행 중': 0xFFE66D,
            '완료': 0x4ECDC4
        };
        return colors[column] || 0x0099FF;
    }
}

module.exports = KanbanEmbedBuilder;