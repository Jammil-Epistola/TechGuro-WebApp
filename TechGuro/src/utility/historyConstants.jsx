// src/utility/historyConstants.js
export const COURSES = [
    { id: 1, name: "Computer Basics" },
    { id: 2, name: "Internet Safety" },
    { id: 3, name: "Digital Communication and Messaging" }
];

export const QUIZ_TYPES = [
    { value: 'multiple_choice', label: 'Image Recognition Quiz' },
    { value: 'drag_drop', label: 'Drag & Drop Challenge' },
    { value: 'typing', label: 'Typing Practice Quiz' }
];

export const getCourseName = (courseId) => {
    const course = COURSES.find(c => c.id === courseId);
    return course ? course.name : `Course ${courseId}`;
};

export const getQuizTypeLabel = (quizType) => {
    const type = QUIZ_TYPES.find(t => t.value === quizType);
    return type ? type.label : quizType;
};

export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const filterByDateRange = (items, dateRange, dateField) => {
    if (dateRange === 'all') return items;

    const now = new Date();
    const filterDate = new Date();

    switch (dateRange) {
        case 'week':
            filterDate.setDate(now.getDate() - 7);
            break;
        case 'month':
            filterDate.setMonth(now.getMonth() - 1);
            break;
        case '3months':
            filterDate.setMonth(now.getMonth() - 3);
            break;
        default:
            return items;
    }

    return items.filter(item => new Date(item[dateField]) >= filterDate);
};

export const sortItems = (items, sortBy, scoreField, dateField) => {
    return [...items].sort((a, b) => {
        switch (sortBy) {
            case 'recent':
                return new Date(b[dateField]) - new Date(a[dateField]);
            case 'oldest':
                return new Date(a[dateField]) - new Date(b[dateField]);
            case 'highScore':
                return b[scoreField] - a[scoreField];
            case 'lowScore':
                return a[scoreField] - b[scoreField];
            default:
                return new Date(b[dateField]) - new Date(a[dateField]);
        }
    });
};