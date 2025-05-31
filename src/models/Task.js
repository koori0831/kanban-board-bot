class Task {
    constructor(title, description) {
        this.title = title;
        this.description = description;
        this.status = 'pending'; // default status
    }

    updateStatus(newStatus) {
        const validStatuses = ['pending', 'in-progress', 'completed'];
        if (validStatuses.includes(newStatus)) {
            this.status = newStatus;
        } else {
            throw new Error('Invalid status');
        }
    }

    updateDescription(newDescription) {
        this.description = newDescription;
    }

    toString() {
        return `Task: ${this.title}\nDescription: ${this.description}\nStatus: ${this.status}`;
    }
}

module.exports = Task;