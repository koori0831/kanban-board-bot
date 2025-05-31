const fs = require('fs');
const path = require('path');
const config = require('../../config.json');

class LocalDatabase {
    constructor() {
        this.dataPath = config.dataPath;
    }

    getGuildDataPath(guildId) {
        const guildPath = path.join(this.dataPath, guildId);
        if (!fs.existsSync(guildPath)) {
            fs.mkdirSync(guildPath, { recursive: true });
        }
        return guildPath;
    }

    // 보드 데이터 저장
    saveBoard(guildId, boardData) {
        const filePath = path.join(this.getGuildDataPath(guildId), 'boards.json');
        let boards = {};
        
        if (fs.existsSync(filePath)) {
            boards = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
        
        boards[boardData.name] = boardData;
        fs.writeFileSync(filePath, JSON.stringify(boards, null, 2));
    }

    // 보드 데이터 로드
    loadBoards(guildId) {
        const filePath = path.join(this.getGuildDataPath(guildId), 'boards.json');
        if (!fs.existsSync(filePath)) {
            return {};
        }
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    // 보드 삭제
    deleteBoard(guildId, boardName) {
        const filePath = path.join(this.getGuildDataPath(guildId), 'boards.json');
        if (!fs.existsSync(filePath)) return false;
        
        const boards = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (boards[boardName]) {
            delete boards[boardName];
            fs.writeFileSync(filePath, JSON.stringify(boards, null, 2));
            return true;
        }
        return false;
    }

    // 태스크 추가
    addTask(guildId, boardName, task) {
        const boards = this.loadBoards(guildId);
        if (!boards[boardName]) {
            boards[boardName] = {
                name: boardName,
                columns: ['할 일', '진행 중', '완료'],
                tasks: {}
            };
        }
        
        const taskId = Date.now().toString();
        boards[boardName].tasks[taskId] = {
            id: taskId,
            title: task.title,
            description: task.description || '',
            column: task.column || '할 일',
            createdAt: new Date().toISOString(),
            assignee: task.assignee || null
        };
        
        this.saveBoard(guildId, boards[boardName]);
        return taskId;
    }

    // 태스크 이동 (제목으로)
    moveTaskByTitle(guildId, boardName, taskTitle, newColumn) {
        const boards = this.loadBoards(guildId);
        if (!boards[boardName]) return false;
        
        const task = Object.values(boards[boardName].tasks).find(t => t.title === taskTitle);
        if (!task) return false;
        
        boards[boardName].tasks[task.id].column = newColumn;
        this.saveBoard(guildId, boards[boardName]);
        return true;
    }

    // 태스크 이동 (ID로)
    moveTask(guildId, boardName, taskId, newColumn) {
        const boards = this.loadBoards(guildId);
        if (!boards[boardName] || !boards[boardName].tasks[taskId]) {
            return false;
        }
        
        boards[boardName].tasks[taskId].column = newColumn;
        this.saveBoard(guildId, boards[boardName]);
        return true;
    }

    // 태스크 삭제 (제목으로)
    deleteTaskByTitle(guildId, boardName, taskTitle) {
        const boards = this.loadBoards(guildId);
        if (!boards[boardName]) return false;
        
        const task = Object.values(boards[boardName].tasks).find(t => t.title === taskTitle);
        if (!task) return false;
        
        delete boards[boardName].tasks[task.id];
        this.saveBoard(guildId, boards[boardName]);
        return true;
    }

    // 태스크 삭제 (ID로)
    deleteTask(guildId, boardName, taskId) {
        const boards = this.loadBoards(guildId);
        if (!boards[boardName] || !boards[boardName].tasks[taskId]) {
            return false;
        }
        
        delete boards[boardName].tasks[taskId];
        this.saveBoard(guildId, boards[boardName]);
        return true;
    }

    // 태스크 검색 (제목으로)
    getTaskByTitle(guildId, boardName, taskTitle) {
        const boards = this.loadBoards(guildId);
        if (!boards[boardName]) return null;
        
        return Object.values(boards[boardName].tasks).find(t => t.title === taskTitle) || null;
    }

    // 보드의 모든 태스크 가져오기
    getBoardTasks(guildId, boardName) {
        const boards = this.loadBoards(guildId);
        if (!boards[boardName]) return [];
        
        return Object.values(boards[boardName].tasks);
    }
}

module.exports = new LocalDatabase();