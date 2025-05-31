const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }]
});

boardSchema.methods.addTask = function(taskId) {
    this.tasks.push(taskId);
    return this.save();
};

boardSchema.methods.removeTask = function(taskId) {
    this.tasks.pull(taskId);
    return this.save();
};

boardSchema.methods.getTasks = function() {
    return this.populate('tasks').execPopulate();
};

const Board = mongoose.model('Board', boardSchema);

module.exports = Board;